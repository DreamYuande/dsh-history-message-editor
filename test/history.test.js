import assert from 'node:assert/strict'
import test from 'node:test'
import { apply } from '../index.js'
import { containsContent, editedContent, markerKind, originalText, replacementRanges, wasReplaced } from '../src/history.js'

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

test('only hides old ranges from this plugin', () => {
  const entry = (start, end, kind) => ({ type: 'event', event: {
    type: 'user/message', seq: end, surfaceOp: { op: 'replace', startSeq: start }, data: { source: { kind } },
  } })
  const ranges = replacementRanges([entry(11, 24, markerKind), entry(2, 4, 'another-plugin'), entry(40, 50, markerKind)])
  assert.deepEqual(ranges, [[11, 24], [40, 50]])
  assert.equal(wasReplaced(ranges, 11), true)
  assert.equal(wasReplaced(ranges, 24), true)
  assert.equal(wasReplaced(ranges, 25), false)
  assert.equal(wasReplaced(ranges, 2), false)
})

function fixture({ pending = false, attachments = [], verify = () => {} } = {}) {
  const original = { type: 'user/message', data: { id: 'original', source: { kind: 'user' }, content: [text('old'), ...attachments] } }
  const writes = []
  const session = {
    seq: 10, eventAt: seq => seq === 4 ? original : undefined,
    surface: { nodes: [1, 4, 6, 8] },
    append: (...args) => { writes.push(args); session.seq++ },
  }
  const agent = {
    session, status: 'idle', inbox: { hasPending: pending },
    model: { current: () => undefined },
    runMaintenance: action => action(new AbortController().signal),
    followup: value => writes.push(value),
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
  return { writes, run }
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

test('refuses stale identity, existing queue, and unreadable attachments without writing', async () => {
  const { writes, run } = fixture()
  assert.equal((await run({ head: 8 })).status, 409)
  assert.equal((await run({ messageId: 'wrong' })).status, 409)
  assert.equal(writes.length, 0)
  const busy = fixture({ pending: true })
  assert.equal((await busy.run()).status, 409)
  assert.equal(busy.writes.length, 0)
  const missing = fixture({ attachments: [file], verify: () => { throw new Error('fixture') } })
  assert.match((await (await missing.run()).json()).error, /原附件无法读取/)
  assert.equal(missing.writes.length, 0)
})
