import assert from 'node:assert/strict'
import test from 'node:test'
import { apply } from '../index.js'
import { containsContent, editedContent, markerKind, originalText, replacementRanges, textsEqual, wasReplaced } from '../src/history.js'

const text = value => ({ type: 'text', text: value })
const image = { type: 'image', attachment: { attachmentId: 'image-id' } }
const file = { type: 'file', attachment: { attachmentId: 'file-id' } }

test('preserves raw text segmentation and exact attachment references', () => {
  const parts = [text('first\n'), image, text('code\n'), file]
  assert.deepEqual(originalText(parts), ['first\n', 'code\n'])
  const edited = editedContent(parts, ['常规', '\n```py\nx = 2\n```\n'])
  assert.deepEqual(edited, [text('常规'), image, text('\n```py\nx = 2\n```\n'), file])
  assert.equal(edited[1], image)
  assert.equal(edited[3], file)
  assert.equal(containsContent([text(' \n')]), false)
  assert.equal(containsContent([image]), true)
})

test('compares text segments positionally before anyone submits', () => {
  assert.equal(textsEqual(['a', 'b'], ['a', 'b']), true)
  assert.equal(textsEqual([], []), true)
  assert.equal(textsEqual(['a'], ['a', 'b']), false)
  assert.equal(textsEqual(['a', 'b'], ['b', 'a']), false)
  assert.equal(textsEqual(['a'], ['a ']), false)
})

test('only hides old ranges from this plugin', () => {  const entry = (start, end, kind) => ({ type: 'event', event: {
    type: 'user/message', seq: end, surfaceOp: { op: 'replace', startSeq: start }, data: { source: { kind } },
  } })
  const ranges = replacementRanges([entry(11, 24, markerKind), entry(2, 4, 'another-plugin'), entry(40, 50, markerKind)])
  assert.deepEqual(ranges, [[11, 24], [40, 50]])
  assert.equal(wasReplaced(ranges, 11), true)
  assert.equal(wasReplaced(ranges, 24), true)
  assert.equal(wasReplaced(ranges, 25), false)
  assert.equal(wasReplaced(ranges, 2), false)
})

function fixture({ queued = 0, steering = 0, attachments = [], verify = () => {}, running = false } = {}) {
  const original = { type: 'user/message', data: { id: 'original', source: { kind: 'user' }, content: [text('old'), ...attachments] } }
  const writes = []
  const calls = { cancel: 0, cleared: 0 }
  const session = {
    seq: 10, eventAt: seq => seq === 4 ? original : undefined,
    surface: { nodes: [1, 4, 6, 8] },
    append: (...args) => { writes.push(args); session.seq++ },
  }
  const pendingTurn = Array.from({ length: queued }, (_, index) => ({ id: `queued-${index}`, role: 'user', content: [text('later')] }))
  const pendingStep = Array.from({ length: steering }, (_, index) => ({ id: `steer-${index}`, role: 'user', content: [text('context')] }))
  const agent = {
    session, status: running ? 'running' : 'idle',
    inbox: {
      nextTurn: pendingTurn,
      nextStep: pendingStep,
      get hasPending() { return this.nextTurn.length > 0 || this.nextStep.length > 0 },
      clear() { calls.cleared++; this.nextTurn = []; this.nextStep = [] },
    },
    model: { current: () => undefined },
    runMaintenance: action => action(new AbortController().signal),
    followup: value => writes.push(value),
    cancel: (cause, options) => {
      calls.cancel++
      calls.cause = cause
      calls.options = options
      if (!options?.keepInbox) agent.inbox.clear()
      agent.status = 'idle'
    },
    whenIdle: () => {
      calls.idle = (calls.idle ?? 0) + 1
      return Promise.resolve()
    },
  }
  let route
  apply({
    connection: { fetch: { register: value => { route = value } } },
    sessionController: { resolveAgent: async () => ({ agent }) },
    agents: { get: () => agent },
    llm: {},
    attachments: {
      readImage: async () => verify(),
      async *readFileStream() { verify(); yield new Uint8Array(1) },
    },
  })
  const run = (override = {}) => route.fetch(new Request('http://fixture' + route.path, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: 'original-session', messageId: 'original', seq: 4,
      head: 9, texts: ['NEW'], ...override }),
  }))
  return { writes, calls, run }
}

test('replaces a surface on one agent and follows up once with exact file and image references', async () => {
  const { writes, run } = fixture({ attachments: [image, file] })
  assert.deepEqual(await (await run()).json(), { ok: true })
  assert.equal(writes.length, 2)
  assert.equal(writes[0][1].source.kind, markerKind)
  assert.deepEqual(writes[0][2], { surfaceOp: { op: 'replace', startSeq: 4, endSeq: 8 }, sourceEventSeqs: [4, 6, 8] })
  assert.equal(writes[1].source.kind, 'user')
  assert.deepEqual(writes[1].content, [text('NEW'), image, file])
  assert.equal((await run()).status, 409)
  assert.equal(writes.length, 2)
})

test('refuses an unchanged body unless the round is being retried', async () => {
  const plain = fixture()
  const refused = await plain.run({ texts: ['old'] })
  assert.equal(refused.status, 400)
  assert.match((await refused.json()).error, /请先修改消息正文/)
  assert.equal(plain.writes.length, 0)
  assert.equal((await plain.run({ texts: ['old'], retry: 'yes' })).status, 400)
  assert.equal(plain.writes.length, 0)

  const retried = fixture()
  assert.deepEqual(await (await retried.run({ texts: ['old'], retry: true })).json(), { ok: true })
  assert.equal(retried.writes.length, 2)
  assert.deepEqual(retried.writes[1].content, [text('old')])
  assert.equal(retried.writes[1].source.kind, 'user')
})

test('refuses stale identity and unreadable attachments without writing', async () => {
  const { writes, run } = fixture()
  assert.equal((await run({ head: 8 })).status, 409)
  assert.equal((await run({ messageId: 'wrong' })).status, 409)
  assert.equal(writes.length, 0)
  const missing = fixture({ attachments: [file], verify: () => { throw new Error('fixture') } })
  assert.match((await (await missing.run()).json()).error, /原附件无法读取/)
  assert.equal(missing.writes.length, 0)
})

test('interrupts a running round, then overwrites it with the edited body', async () => {
  const { writes, calls, run } = fixture({ running: true })
  // The head is stale on purpose: an interrupted turn appends its own closing
  // events, so the request cannot promise the log still ends at `head`.
  const response = await run({ interrupt: true, head: 7 })
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(calls.cancel, 1)
  assert.deepEqual(calls.cause, { kind: 'user' })
  assert.equal(calls.options, undefined)
  assert.equal(calls.idle, 1)
  assert.equal(writes.length, 2)
  assert.deepEqual(writes[1].content, [text('NEW')])
})

test('interrupts by default even when the page did not ask for it', async () => {
  const { writes, calls, run } = fixture({ running: true })
  // A page whose running flag lagged behind a stop or a finish sends no flag at
  // all; the host still owns the decision and stops what is actually running.
  assert.deepEqual(await (await run()).json(), { ok: true })
  assert.equal(calls.cancel, 1)
  assert.equal(writes.length, 2)
})

test('stops the round even when the page still reported itself idle', async () => {
  const { writes, calls, run } = fixture({ running: true })
  // The page's running flag lags a stop or a finish; the host decides, so an
  // explicit "not running" from the page cannot leave the user stuck.
  assert.deepEqual(await (await run({ interrupt: false })).json(), { ok: true })
  assert.equal(calls.cancel, 1)
  assert.equal(writes.length, 2)
})

test('accepts an explicit no-interrupt flag from an idle editor', async () => {
  const { writes, calls, run } = fixture()
  assert.deepEqual(await (await run({ interrupt: false })).json(), { ok: true })
  assert.equal(calls.cancel, 0)
  assert.equal(writes.length, 2)
  assert.equal((await run({ interrupt: 'yes' })).status, 400)
})

test('asks once before discarding a queued prompt, then discards it with the edit', async () => {
  const { writes, calls, run } = fixture({ queued: 2 })
  const refused = await run()
  assert.equal(refused.status, 409)
  const body = await refused.json()
  assert.equal(body.queued, 2)
  assert.match(body.error, /还有 2 条排队中的输入/)
  assert.equal(calls.cancel, 0)
  assert.equal(writes.length, 0)

  const confirmed = await run({ discardQueue: true })
  assert.deepEqual(await confirmed.json(), { ok: true, dropped: 2 })
  assert.equal(calls.cancel, 1)
  assert.equal(calls.cleared, 1)
  assert.equal(writes.length, 2)
})

test('clears leftover steering context without asking, since no prompt is lost', async () => {
  const { writes, calls, run } = fixture({ steering: 3 })
  // Injected context and stale steering are not user prompts: an edit may drop
  // them, which is what keeps a stopped session from reporting pending work.
  assert.deepEqual(await (await run()).json(), { ok: true })
  assert.equal(calls.cancel, 1)
  assert.equal(calls.cleared, 1)
  assert.equal(writes.length, 2)
})

test('verifies attachments before it stops the running round', async () => {
  const { writes, calls, run } = fixture({
    running: true, attachments: [file], verify: () => { throw new Error('fixture') },
  })
  const response = await run({ interrupt: true })
  assert.equal(response.status, 409)
  assert.match((await response.json()).error, /原附件无法读取/)
  assert.equal(calls.cancel, 0)
  assert.equal(writes.length, 0)
})
