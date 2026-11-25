import { randomUUID } from 'node:crypto'
import { containsContent, editedContent, findBlockReason, markerKind, originalText, overridePath, textsEqual } from './src/history.js'

export const name = 'history-message-editor'
export const inject = ['connection', 'sessionController', 'agents', 'attachments', 'llm']

/** How long a page may wait for the interrupted round to reach quiescence. */
const interruptTimeoutMs = 20000

class OverrideError extends Error {
  constructor(message, status = 409) {
    super(message)
    this.status = status
  }
}

function validateRequest(body) {
  return typeof body?.sessionId === 'string' && body.sessionId.length > 0 && body.sessionId.length <= 200 &&
    typeof body?.messageId === 'string' && body.messageId.length > 0 && body.messageId.length <= 200 &&
    Number.isSafeInteger(body.seq) && body.seq >= 0 &&
    Number.isSafeInteger(body.head) && body.head >= body.seq &&
    Array.isArray(body.texts) && body.texts.length > 0 &&
    body.texts.every(text => typeof text === 'string') &&
    (body.retry === undefined || body.retry === true) &&
    (body.interrupt === undefined || typeof body.interrupt === 'boolean')
}

function userMessage(content, kind) {
  return Object.freeze({
    id: randomUUID(), role: 'user', content: Object.freeze(content),
    source: Object.freeze({ kind }),
  })
}

/**
 * Validate the target and build the replacement content.
 * @param session - live session the request names.
 * @param request - validated request body.
 * @param strict - whether the observed head must still be the newest event. A
 *   request that may interrupt a running round cannot promise that, because the
 *   aborted turn appends its own closing events before the replacement lands.
 */
function plan(session, request, strict) {
  if (strict && session.seq - 1 !== request.head) {
    throw new OverrideError('会话刚刚发生变化。请关闭编辑器，重新打开这条消息后再保存。')
  }
  if (request.head > session.seq - 1) {
    throw new OverrideError('会话状态已变化，请关闭编辑器后重新打开这条消息。')
  }
  const event = session.eventAt(request.seq)
  if (event?.type !== 'user/message' || event.data.id !== request.messageId || event.data.source?.kind !== 'user') {
    throw new OverrideError('原消息已变化，请重新选择消息。')
  }
  const index = session.surface.nodes.indexOf(request.seq)
  if (index === -1) throw new OverrideError('这条消息已被覆盖或压缩，无法在该位置重新生成。')
  const blocked = findBlockReason(event)
  if (blocked) throw new OverrideError(blocked)
  const originals = originalText(event.data.content)
  if (originals.length !== request.texts.length) throw new OverrideError('原消息的正文结构已变化。')
  // An unchanged body is only meaningful as a retry: the round is re-asked with
  // identical content instead of an edited one.
  if (textsEqual(originals, request.texts) && request.retry !== true) {
    throw new OverrideError('请先修改消息正文。', 400)
  }
  const content = editedContent(event.data.content, request.texts)
  if (!containsContent(content)) throw new OverrideError('消息正文不能为空。', 400)
  return { content, shadowed: session.surface.nodes.slice(index) }
}

/** Resolve once the agent stops driving any turn or maintenance task. */
function settled(agent) {
  if (typeof agent.whenIdle !== 'function') {
    return Promise.reject(new OverrideError('当前 DSH 不支持等待回复停止。'))
  }
  return new Promise((resolve, reject) => {
    let timer
    let done = false
    function finish(error) {
      if (done) return
      done = true
      clearTimeout(timer)
      if (error) reject(error)
      else resolve()
    }
    timer = setTimeout(
      () => finish(new OverrideError('上一轮回复没有及时停止，请稍后再试。')),
      interruptTimeoutMs,
    )
    Promise.resolve(agent.whenIdle()).then(() => finish(), error => finish(error))
  })
}

/**
 * Stop the round that is still streaming so the replacement can be written.
 * The page never decides whether this is needed: its running flag lags the host
 * after a stop or a finish, so only the host knows what is actually running.
 * @returns whether this request interrupted work.
 */
async function stopRound(agent) {
  if (agent.status === 'idle' && !agent.inbox.hasPending) return false
  // Queued and steering input is the user's own work: it is never discarded to
  // make room for an edit, so ask for it to be handled first.
  if (agent.inbox.hasPending) {
    throw new OverrideError('还有排队中的输入，先发送或删除它们再编辑。')
  }
  if (typeof agent.cancel !== 'function') {
    throw new OverrideError('当前 DSH 不支持中断正在生成的回复。')
  }
  agent.cancel({ kind: 'user' }, { keepInbox: true })
  await settled(agent)
  return true
}

async function verifyAttachments(ctx, agent, content, signal) {
  for (const part of content) {
    if (part.type === 'text') continue
    try {
      if (part.type === 'image') {
        const selection = agent.model.current()
        if (selection) {
          const info = await ctx.llm.resolveModelInfo(selection.provider, selection.model)
          if (info.inputModalities && !info.inputModalities.includes('image')) {
            throw new OverrideError('当前模型不支持图片，请先切换到支持图片的模型。')
          }
        }
        await ctx.attachments.readImage(part.attachment, signal)
      } else {
        for await (const _chunk of ctx.attachments.readFileStream(part.attachment, signal)) {
          // Drain the native verifier before committing the replacement.
        }
      }
    } catch (error) {
      if (error instanceof OverrideError) throw error
      throw new OverrideError('原附件无法读取，当前会话未覆盖。')
    }
  }
}

async function regenerate(ctx, input, signal) {
  const resolved = await ctx.sessionController.resolveAgent(input.sessionId)
  if (!resolved.agent) throw new OverrideError('当前会话暂不可用。')
  const agent = resolved.agent
  const session = agent.session
  if (typeof agent.runMaintenance !== 'function' || typeof session.eventAt !== 'function') {
    throw new OverrideError('当前 DSH 无法安全地在原会话中重新生成。')
  }
  // The head guard only holds while the host itself is idle: a round that is
  // still streaming (or was just stopped) appends its own closing events, so the
  // page's `head` cannot match by the time the replacement is written.
  const strict = agent.status === 'idle' && !agent.inbox.hasPending && input.interrupt !== true
  // Read the target and its attachments before stopping the running round, so a
  // message that cannot be replaced never costs the user the reply they wait for.
  const { content } = plan(session, input, strict)
  await verifyAttachments(ctx, agent, content, signal)
  signal.throwIfAborted()
  await stopRound(agent)
  signal.throwIfAborted()
  if (ctx.agents.get(input.sessionId) !== agent) {
    throw new OverrideError('会话刚刚切换，请重试。')
  }
  if (agent.status !== 'idle' || agent.inbox.hasPending) {
    throw new OverrideError('会话在中断之后又开始了新的生成，请重试。')
  }
  let committed = false
  try {
    await agent.runMaintenance(async maintenance => {
      signal.throwIfAborted()
      maintenance.throwIfAborted()
      if (agent.inbox.hasPending) throw new OverrideError('还有排队中的输入，先处理它们再编辑。')
      const { shadowed } = plan(session, input, strict)
      const replacement = userMessage(content, 'user')
      // Maintenance holds the driver through both synchronous writes.
      session.append('user/message', userMessage([], markerKind), {
        surfaceOp: { op: 'replace', startSeq: shadowed[0], endSeq: shadowed.at(-1) },
        sourceEventSeqs: shadowed,
      })
      committed = true
      agent.followup(replacement)
    })
  } catch (error) {
    if (error instanceof OverrideError && !committed) throw error
    if (committed) throw new OverrideError('已覆盖旧内容，但新消息未获确认。请查看当前会话后再发送。', 500)
    throw new OverrideError('会话正在处理其他操作，未覆盖旧内容。')
  }
}

export function apply(ctx) {
  // Exact Connection routes are authenticated and restricted to owner Peers.
  ctx.connection.fetch.register({
    path: overridePath, methods: ['POST'], requestBody: 'buffered',
    async fetch(request) {
      if (request.headers.get('content-type')?.split(';', 1)[0]?.trim() !== 'application/json') {
        return new Response(null, { status: 415 })
      }
      let input
      try {
        input = await request.json()
      } catch {
        return Response.json({ error: '无法读取请求。' }, { status: 400 })
      }
      if (!validateRequest(input)) return Response.json({ error: '无法核对消息身份或正文。' }, { status: 400 })
      try {
        await regenerate(ctx, input, request.signal)
        return Response.json({ ok: true })
      } catch (error) {
        const known = error instanceof OverrideError
        return Response.json({ error: known ? error.message : 'DSH 未确认操作结果，请查看当前会话。' },
          { status: known ? error.status : 500 })
      }
    },
  })
}
