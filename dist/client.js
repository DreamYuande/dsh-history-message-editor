window.__ModuleLoader__.load({
  id: "dsh-history-message-editor",
  factory: () => {
    'use strict'
    const stylesheet = ".dsh-history-edit-trigger,\n.dsh-history-retry-trigger {\n  display: inline-grid;\n  place-items: center;\n  flex: none;\n  box-sizing: border-box;\n  inline-size: 22px !important;\n  block-size: 22px !important;\n  min-inline-size: 0 !important;\n  min-block-size: 0 !important;\n  padding: 0;\n  border: 0;\n  border-radius: var(--dsw-radius-sm, 6px);\n  background: transparent;\n  color: var(--dsw-alias-label-tertiary, currentColor);\n  cursor: pointer;\n}\n\n.dsh-history-edit-trigger > svg,\n.dsh-history-retry-trigger > svg {\n  display: block;\n  inline-size: 13px !important;\n  block-size: 13px !important;\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 1.1;\n  stroke-linecap: round;\n  stroke-linejoin: round;\n}\n\n/* The retry glyph keeps a 24px view box, so it needs a denser stroke. */\n.dsh-history-retry-trigger > svg {\n  stroke-width: 2;\n}\n\n.dsh-history-edit-trigger:hover,\n.dsh-history-edit-trigger:focus-visible,\n.dsh-history-retry-trigger:hover,\n.dsh-history-retry-trigger:focus-visible {\n  color: var(--dsw-alias-label-secondary, currentColor);\n  background: var(--dsw-alias-interactive-bg-hover, transparent);\n}\n\n[data-chat-node-key] .dsh-history-edit-trigger[aria-disabled=\"true\"],\n[data-chat-node-key] .dsh-history-retry-trigger[aria-disabled=\"true\"] {\n  cursor: help;\n}\n\n.dsh-history-retry-trigger[data-busy] {\n  color: var(--dsw-alias-label-tertiary, currentColor);\n  cursor: progress;\n}\n\n.dsh-history-retry-trigger[data-busy] > svg {\n  animation: dsh-history-spin 0.9s linear infinite;\n}\n\n@keyframes dsh-history-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-history-retry-trigger[data-busy] > svg {\n    animation-duration: 2.4s;\n  }\n}\n\n@media (hover: hover) {\n  [data-chat-node-key]:not(:hover):not(:focus-within) .dsh-history-edit-trigger,\n  [data-chat-node-key]:not(:hover):not(:focus-within) .dsh-history-retry-trigger {\n    opacity: 0;\n    pointer-events: none;\n  }\n}\n\n[data-message-bubble][data-dsh-history-edit-hidden],\n[data-dsh-history-editing] [data-slot=\"conversation.chat.node\"] [data-clock=\"start\"],\n[data-dsh-history-shadowed] {\n  display: none !important;\n}\n\n.dsh-history-editor {\n  box-sizing: border-box;\n  display: grid;\n  gap: 10px;\n  width: 100%;\n  padding: 14px;\n  border: 0;\n  border-radius: 16px;\n  background: var(--dsw-alias-interactive-bg-hover-solid, color-mix(in srgb, CanvasText 6%, Canvas));\n  color: var(--dsw-alias-label-primary, currentColor);\n  font: inherit;\n}\n\nform.dsh-history-editor > textarea {\n  box-sizing: border-box;\n  min-width: 0;\n  width: 100%;\n  min-height: 46px;\n  max-height: 48vh;\n  padding: 0;\n  field-sizing: content;\n  overflow: auto;\n  resize: none;\n  border: 0 !important;\n  outline: none !important;\n  box-shadow: none !important;\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  line-height: 1.5;\n  tab-size: 4;\n}\n\n.dsh-history-editor:has(textarea:focus-visible) {\n  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2, #80808055);\n}\n\n.dsh-history-editor button:focus-visible {\n  outline: 2px solid var(--dsw-alias-label-secondary, currentColor);\n  outline-offset: 2px;\n}\n\n.dsh-history-edit-status {\n  color: var(--dsw-alias-label-secondary, currentColor);\n  font-size: 12px;\n  line-height: 1.4;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n.dsh-history-edit-status:empty {\n  display: none;\n}\n\n.dsh-history-edit-footer {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px 12px;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.dsh-history-edit-impact {\n  color: var(--dsw-alias-label-tertiary, currentColor);\n  font-size: 11px;\n  line-height: 16px;\n}\n\n.dsh-history-edit-buttons {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-end;\n  gap: 6px;\n  margin-inline-start: auto;\n}\n\n.dsh-history-edit-buttons button {\n  box-sizing: border-box;\n  height: 29px;\n  min-height: 0;\n  padding: 0 11px;\n  border: 0.5px solid var(--dsw-alias-border-l2, #80808055);\n  border-radius: 9px;\n  background: Canvas;\n  color: inherit;\n  font: inherit;\n  font-size: 12px;\n  line-height: 18px;\n  cursor: pointer;\n}\n\n.dsh-history-edit-buttons button:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover, transparent);\n}\n\n.dsh-history-edit-buttons .dsh-history-edit-primary {\n  border-color: transparent;\n  background: var(--dsw-alias-button-primary-fill, CanvasText);\n  color: var(--dsw-alias-label-primary-foreground, Canvas);\n}\n\n.dsh-history-edit-buttons .dsh-history-edit-primary:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover, CanvasText);\n}\n\n.dsh-history-editor[data-pristine] .dsh-history-edit-primary,\n.dsh-history-edit-buttons button:disabled {\n  cursor: default;\n  opacity: 0.45;\n}\n\n/* An untouched body greys the primary action out instead of prompting for a change. */\n.dsh-history-editor[data-pristine] .dsh-history-edit-primary {\n  border-color: transparent;\n  background: var(--dsw-alias-interactive-bg-hover-solid, color-mix(in srgb, CanvasText 8%, Canvas));\n  color: var(--dsw-alias-label-tertiary, color-mix(in srgb, CanvasText 45%, Canvas));\n  opacity: 1;\n}\n\n.dsh-history-editor[aria-busy=\"true\"] .dsh-history-edit-buttons button:disabled {\n  cursor: progress;\n  opacity: 0.7;\n}\n\n.dsh-history-editor[aria-busy=\"true\"] .dsh-history-edit-primary:disabled {\n  background: var(--dsw-alias-button-primary-fill, CanvasText);\n  color: var(--dsw-alias-label-primary-foreground, Canvas);\n}\n\n.dsh-history-toast-layer {\n  position: fixed;\n  z-index: 2147483000;\n  inset-block-end: 32px;\n  inset-inline: 0;\n  display: flex;\n  justify-content: center;\n  pointer-events: none;\n}\n\n.dsh-history-toast {\n  box-sizing: border-box;\n  max-width: min(520px, calc(100vw - 48px));\n  padding: 8px 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2, #80808055);\n  border-radius: 10px;\n  background: var(--dsw-specific-input-major, Canvas);\n  box-shadow: var(--dsw-elevation-soft, 0 6px 20px #0000001f);\n  color: var(--dsw-alias-label-primary, CanvasText);\n  font: inherit;\n  font-size: 12px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  pointer-events: auto;\n  cursor: pointer;\n}\n"
    const markerKind = 'dsh-history-message-editor'
const overridePath = '/api/history-message-editor/v1/regenerate'

function findBlockReason(node) {
  if (node.data.source?.principal != null) return '只能编辑自己在本机发送的消息。'
  if (node.data.content.some(part => {
    if (part?.type === 'text') return typeof part.text !== 'string'
    if (part?.type === 'image' || part?.type === 'file') return typeof part.attachment?.attachmentId !== 'string'
    return true
  })) return '该消息包含无法安全保留的内容。'
  return ''
}

function originalText(content) {
  const texts = content.filter(part => part.type === 'text').map(part => part.text)
  return texts.length ? texts : ['']
}

function editedContent(content, texts) {
  let textIndex = 0
  const parts = content.map(part =>
    part.type === 'text' ? { type: 'text', text: texts[textIndex++] } : part)
  if (textIndex === 0 && texts[0] !== '') parts.unshift({ type: 'text', text: texts[0] })
  return parts
}

function containsContent(parts) {
  return parts.some(part => part.type !== 'text' || part.text.trim() !== '')
}

function textsEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

function replacementRanges(entries) {
  const ranges = []
  for (const { type, event } of entries) {
    if (type !== 'event' || event.type !== 'user/message' ||
        event.data.source?.kind !== markerKind || event.surfaceOp?.op !== 'replace') continue
    const start = event.surfaceOp.startSeq
    if (Number.isSafeInteger(start) && start < event.seq) ranges.push([start, event.seq])
  }
  return ranges
}

function wasReplaced(ranges, seq) {
  return ranges.some(([start, end]) => start <= seq && seq <= end)
}

    const inject = ['sessions', 'uiConversation']
const contentSelector = '[data-conversation-content][data-conversation-session]'
const chatNodeSelector = '[data-chat-node-key][data-chat-flow-kind]'
const chatGroupSelector = '[data-chat-group-key]'
const rowSelector = '[data-chat-node-key]:is([data-chat-flow-kind="user"], [data-chat-flow-kind="steering"])'
const actionSelector = '[data-slot="conversation.chat.node"] [data-clock="start"]'
const bubbleSelector = '[data-message-bubble]'
const editLabel = '编辑消息'
const retryLabel = '重试这一轮'

function element(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

function button(text, className) {
  const control = element('button', className, text)
  control.type = 'button'
  return control
}

function editIcon() {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', 'm10.6 3.3 2.1 2.1M3 13l.6-2.7L11 2.8a1.5 1.5 0 0 1 2.2 2.2l-7.5 7.4L3 13Z')
  svg.append(path)
  return svg
}

function retryIcon() {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('aria-hidden', 'true')
  const arc = document.createElementNS(ns, 'path')
  arc.setAttribute('d', 'M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8')
  const head = document.createElementNS(ns, 'path')
  head.setAttribute('d', 'M21 3v5h-5')
  svg.append(arc, head)
  return svg
}

function apply(ctx) {
  const { sessions, uiConversation } = ctx
  if (typeof sessions.retainInfo !== 'function' || typeof uiConversation.binding !== 'function') return
  ctx.effect(() => mountEditor(sessions, uiConversation), 'history-message-editor: message actions')
}

function mountEditor(sessions, conversation) {
  const lifetime = new AbortController()
  const { signal } = lifetime
  const style = element('style')
  style.dataset.dshHistoryEditorStyle = ''
  style.textContent = stylesheet
  document.head.append(style)

  const toasts = element('div', 'dsh-history-toast-layer')
  document.body.append(toasts)
  let toast = null
  let toastTimer = 0

  function hideToast() {
    clearTimeout(toastTimer)
    toastTimer = 0
    toast?.remove()
    toast = null
  }

  function notify(text) {
    if (!toast) {
      toast = element('div', 'dsh-history-toast')
      toast.setAttribute('role', 'status')
      toast.addEventListener('click', hideToast)
      toasts.append(toast)
    }
    toast.textContent = text
    clearTimeout(toastTimer)
    toastTimer = setTimeout(hideToast, 6000)
  }

  const controls = new Map()
  const watched = new Map()
  let shadowed = new Set()
  let frame = 0
  let editor = null
  let operation = null

  function isMain(sessionId) {
    return (sessions.retainInfo(sessionId).getSnapshot().retainedBy.mainView ?? 0) > 0
  }

  function watch(binding) {
    const initial = binding.eventSource.getSnapshot()
    const record = { revision: initial.revision, ranges: replacementRanges(initial.entries), dispose: null }
    record.dispose = binding.eventSource.subscribe(() => {
      const window = binding.eventSource.getSnapshot()
      if (window.revision === record.revision) return
      const { change } = window
      const rebuild = window.revision !== record.revision + 1 || change.kind === 'replace'
      record.revision = window.revision
      if (rebuild) {
        record.ranges = replacementRanges(window.entries)
        requestSweep()
      } else if (change.kind === 'append' || change.kind === 'prepend') {
        const additions = replacementRanges(change.entries)
        if (additions.length) {
          record.ranges.push(...additions)
          requestSweep()
        }
      }
    })
    watched.set(binding, record)
  }

  function syncVisibility() {
    const nextShadowed = new Set()
    const visited = new Set()
    for (const host of document.querySelectorAll(contentSelector)) {
      const id = host.dataset.conversationSession
      const binding = id && sessions.binding(id)
      if (!binding || !isMain(id)) continue
      visited.add(binding)
      if (!watched.has(binding)) watch(binding)
      const { ranges } = watched.get(binding)
      if (!ranges.length) continue
      const chat = conversation.binding(binding).target('chat').getSnapshot()
      if (!chat) continue
      for (const row of host.querySelectorAll(chatNodeSelector)) {
        if (row.closest(contentSelector) !== host) continue
        const node = chat.nodes.get(row.dataset.chatNodeKey)
        if (node && wasReplaced(ranges, node.anchorSeq)) nextShadowed.add(row)
      }
      for (const group of host.querySelectorAll(chatGroupSelector)) {
        const rows = [...group.querySelectorAll(chatNodeSelector)]
        if (rows.length && rows.every(row => nextShadowed.has(row))) nextShadowed.add(group)
      }
    }
    for (const [binding, record] of watched) {
      if (visited.has(binding)) continue
      record.dispose()
      watched.delete(binding)
    }
    for (const row of shadowed) {
      if (!nextShadowed.has(row)) row.removeAttribute('data-dsh-history-shadowed')
    }
    for (const row of nextShadowed) {
      if (!shadowed.has(row)) row.setAttribute('data-dsh-history-shadowed', '')
    }
    shadowed = nextShadowed
  }

  function recordsFor(row) {
    const host = row.closest(contentSelector)
    const sessionId = host?.dataset.conversationSession
    if (!sessionId || !isMain(sessionId)) return
    const binding = sessions.binding(sessionId)
    if (!binding || binding.session.getSnapshot().subagent) return
    const chat = conversation.binding(binding).target('chat').getSnapshot()
    const node = chat?.nodes.get(row.dataset.chatNodeKey)
    if (node?.kind !== row.dataset.chatFlowKind || !node?.data.messageId ||
        node.data.source?.kind !== 'user' || !Array.isArray(node.data.content)) return
    return { sessionId, binding, node }
  }

  function placeForm(draft, row, actions) {
    const bubble = row.querySelector(bubbleSelector)
    if (draft.bubble !== bubble) {
      draft.bubble?.removeAttribute('data-dsh-history-edit-hidden')
      draft.bubble = bubble
      draft.bubble?.setAttribute('data-dsh-history-edit-hidden', '')
    }
    if (draft.row !== row) {
      draft.row?.removeAttribute('data-dsh-history-editing')
      draft.row = row
    }
    row.setAttribute('data-dsh-history-editing', '')
    if (draft.form.parentElement !== actions.parentElement) {
      actions.before(draft.form)
    }
  }

  function endEdit(focus = false) {
    if (!editor) return
    const draft = editor
    editor = null
    draft.bubble?.removeAttribute('data-dsh-history-edit-hidden')
    draft.row?.removeAttribute('data-dsh-history-editing')
    draft.form.remove()
    if (focus) controls.get(draft.row)?.control.focus({ preventScroll: true })
  }

  function sweep() {
    frame = 0
    if (editor && !isMain(editor.sessionId)) endEdit()
    syncVisibility()
    for (const [row, entry] of controls) {
      const sessionId = row.closest(contentSelector)?.dataset.conversationSession
      if (!row.isConnected || !entry.control.isConnected || !entry.retry.isConnected ||
          sessionId !== entry.sessionId || row.dataset.chatNodeKey !== entry.key ||
          !isMain(sessionId) || shadowed.has(row)) {
        entry.control.remove()
        entry.retry.remove()
        controls.delete(row)
      }
    }
    for (const row of document.querySelectorAll(rowSelector)) {
      if (controls.has(row) || shadowed.has(row)) continue
      const actions = row.querySelector(actionSelector)
      const record = actions && recordsFor(row)
      if (!record) continue
      const reason = findBlockReason(record.node)
      const control = button('', 'dsh-history-edit-trigger')
      control.setAttribute('aria-label', editLabel)
      control.title = reason || editLabel
      if (reason) control.setAttribute('aria-disabled', 'true')
      control.append(editIcon())
      control.addEventListener('click', () => {
        const current = recordsFor(row)
        if (current && !findBlockReason(current.node) && !operation) openEditor(current, row, actions)
      })
      const retry = button('', 'dsh-history-retry-trigger')
      retry.setAttribute('aria-label', retryLabel)
      retry.title = reason || '重试这一轮：覆盖此条及后续对话并重新生成'
      if (reason) retry.setAttribute('aria-disabled', 'true')
      retry.append(retryIcon())
      retry.addEventListener('click', () => {
        const current = recordsFor(row)
        if (!current || findBlockReason(current.node)) return
        if (!operation) void retryRound(current, retry)
      })
      actions.append(control, retry)
      controls.set(row, { control, retry, actions, sessionId: record.sessionId, key: record.node.key })
    }
    if (editor) {
      const entry = [...controls].find(([, entry]) => entry.sessionId === editor.sessionId && entry.key === editor.node.key)
      if (entry) placeForm(editor, entry[0], entry[1].actions)
    }
  }

  function requestSweep() {
    if (!frame) frame = requestAnimationFrame(sweep)
  }

  function affectsPlacement(node) {
    if (!(node instanceof Element)) return false
    // React can replace wrapper/row subtrees. Ignore streaming changes and our own
    // controls; only anchors and their replacement containers need a scan.
    const selector = `${contentSelector}, ${chatNodeSelector}, ${chatGroupSelector}, [data-clock="start"]${editor ? `, ${bubbleSelector}` : ''}`
    return node.matches(selector) || node.querySelector(selector) !== null
  }

  const observer = new MutationObserver(changes => {
    if (changes.some(change => change.type === 'attributes' ||
        [...change.addedNodes, ...change.removedNodes].some(affectsPlacement))) requestSweep()
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-conversation-session', 'data-chat-node-key', 'data-chat-flow-kind'],
  })
  const unsubscribe = sessions.list.subscribe(() => {
    if (editor && !isMain(editor.sessionId)) endEdit()
    requestSweep()
  })
  requestSweep()

  function blocked(record, action = '编辑') {
    const state = record.binding.session.getSnapshot()
    if (state.running || state.awaitingFirstTurn || state.pendingSubmissions?.length) {
      return `等当前回复和正在提交的输入结束后再${action}。`
    }
    if (state.openState !== 'open' || state.removed || state.loadingOlder) {
      return '等当前会话的历史加载完成后再试。'
    }
    return ''
  }

  function currentHead(binding) {
    return binding.eventSource.getSnapshot().entries.findLast(entry => entry.type === 'event')?.event.seq
  }

  function pristine(draft) {
    return textsEqual(draft.fields.map(field => field.value), draft.initial)
  }

  function syncSave(draft) {
    const idle = draft.save.dataset.busy !== 'busy'
    draft.save.disabled = !idle || pristine(draft)
    draft.form.toggleAttribute('data-pristine', pristine(draft))
  }

  function openEditor(record, row, actions) {
    if (editor?.node === record.node && editor.sessionId === record.sessionId) {
      editor.fields[0].focus({ preventScroll: true })
      return
    }
    endEdit()
    const form = element('form', 'dsh-history-editor')
    form.setAttribute('aria-label', editLabel)
    const raw = originalText(record.node.data.content)
    const fields = raw.map((text, index) => {
      const field = element('textarea')
      field.value = text
      field.rows = Math.min(12, Math.max(3, text.split('\n').length))
      field.setAttribute('aria-label', raw.length === 1 ? '消息正文' : `消息正文第 ${index + 1} 段`)
      form.append(field)
      return field
    })
    const status = element('div', 'dsh-history-edit-status')
    status.setAttribute('role', 'status')
    const footer = element('div', 'dsh-history-edit-footer')
    const detail = element('div', 'dsh-history-edit-impact', '覆盖此条及后续对话')
    detail.title = '已执行的工具操作不会回退'
    const bar = element('div', 'dsh-history-edit-buttons')
    const dismiss = button('取消')
    const save = button('发送', 'dsh-history-edit-primary')
    save.setAttribute('aria-label', '发送并重新生成')
    save.title = '覆盖此条及后续对话并重新生成'
    save.type = 'submit'
    bar.append(dismiss, save)
    footer.append(detail, bar)
    form.append(status, footer)
    const draft = {
      ...record, form, fields, status, dismiss, save,
      raw, initial: fields.map(field => field.value),
      row: null, bubble: null, head: currentHead(record.binding),
    }
    editor = draft
    placeForm(draft, row, actions)
    status.textContent = blocked(draft)
    syncSave(draft)
    dismiss.addEventListener('click', () => endEdit(true))
    form.addEventListener('input', () => {
      status.textContent = ''
      syncSave(draft)
    })
    form.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !operation) {
        event.preventDefault()
        event.stopPropagation()
        endEdit(true)
      }
    })
    form.addEventListener('submit', event => {
      event.preventDefault()
      if (!operation && !save.disabled) void submit(draft)
    })
    fields[0].focus({ preventScroll: true })
  }

  function stillEditing(draft) {
    return !signal.aborted && editor === draft && isMain(draft.sessionId) &&
      sessions.binding(draft.sessionId) === draft.binding
  }

  function verifySource(draft) {
    if (!stillEditing(draft)) throw new Error('会话已切换。')
    const reason = blocked(draft)
    if (reason) throw new Error(reason)
    const contentReason = findBlockReason(draft.node)
    if (contentReason) throw new Error(contentReason)
  }

  async function submit(draft) {
    const { fields, raw, initial, form, status, save, dismiss, binding, node, sessionId, head } = draft
    const texts = fields.map((field, index) => field.value === initial[index] ? raw[index] : field.value)
    const parts = editedContent(node.data.content, texts)
    // The primary button stays greyed out until the body changes, so this only
    // guards a submit that raced the last input event.
    if (textsEqual(texts, raw)) return
    if (!containsContent(parts)) {
      status.textContent = '消息正文不能为空。'
      return
    }
    operation = draft
    form.setAttribute('aria-busy', 'true')
    save.dataset.busy = 'busy'
    for (const field of fields) field.readOnly = true
    dismiss.disabled = save.disabled = true
    save.textContent = '提交中…'
    status.textContent = ''
    try {
      verifySource(draft)
      if (head === undefined || head !== currentHead(binding)) {
        throw new Error('会话刚刚发生变化。请重新打开这条消息后再保存。')
      }
      const response = await fetch('.' + overridePath, {
        method: 'POST', signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, messageId: node.data.messageId, seq: node.data.seq, head, texts }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) {
        throw new Error(result?.error || 'DSH 未确认提交，请查看当前会话状态。')
      }
      if (stillEditing(draft)) endEdit()
    } catch (error) {
      if (!stillEditing(draft)) return
      status.textContent = error instanceof Error ? error.message : 'DSH 未确认操作结果。'
    } finally {
      operation = null
      form.removeAttribute('aria-busy')
      delete save.dataset.busy
      dismiss.disabled = false
      for (const field of fields) field.readOnly = false
      save.textContent = '发送'
      syncSave(draft)
    }
  }

  async function retryRound(record, control) {
    const reason = blocked(record, '重试')
    if (reason) {
      notify(reason)
      return
    }
    const { binding, node, sessionId } = record
    const head = currentHead(binding)
    const texts = originalText(node.data.content)
    operation = { kind: 'retry' }
    control.dataset.busy = 'busy'
    control.setAttribute('aria-busy', 'true')
    control.disabled = true
    try {
      const response = await fetch('.' + overridePath, {
        method: 'POST', signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, messageId: node.data.messageId, seq: node.data.seq, head, texts, retry: true }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true) {
        throw new Error(result?.error || 'DSH 未确认提交，请查看当前会话状态。')
      }
    } catch (error) {
      if (!signal.aborted) notify(error instanceof Error ? error.message : 'DSH 未确认操作结果。')
    } finally {
      operation = null
      delete control.dataset.busy
      control.removeAttribute('aria-busy')
      control.disabled = false
    }
  }

  return () => {
    lifetime.abort()
    observer.disconnect()
    unsubscribe()
    cancelAnimationFrame(frame)
    endEdit()
    hideToast()
    toasts.remove()
    for (const record of watched.values()) record.dispose()
    for (const row of shadowed) row.removeAttribute('data-dsh-history-shadowed')
    for (const { control, retry } of controls.values()) {
      control.remove()
      retry.remove()
    }
    controls.clear()
    style.remove()
  }
}

    return { apply, inject }
  },
})
