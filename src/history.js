export const markerKind = 'dsh-history-message-editor'
export const overridePath = '/api/history-message-editor/v1/regenerate'

export function findBlockReason(node) {
  if (node.data.source?.principal != null) return '只能编辑自己在本机发送的消息。'
  if (node.data.content.some(part => {
    if (part?.type === 'text') return typeof part.text !== 'string'
    if (part?.type === 'image' || part?.type === 'file') return typeof part.attachment?.attachmentId !== 'string'
    return true
  })) return '该消息包含无法安全保留的内容。'
  return ''
}

export function originalText(content) {
  const texts = content.filter(part => part.type === 'text').map(part => part.text)
  return texts.length ? texts : ['']
}

export function editedContent(content, texts) {
  let textIndex = 0
  const parts = content.map(part =>
    part.type === 'text' ? { type: 'text', text: texts[textIndex++] } : part)
  if (textIndex === 0 && texts[0] !== '') parts.unshift({ type: 'text', text: texts[0] })
  return parts
}

export function containsContent(parts) {
  return parts.some(part => part.type !== 'text' || part.text.trim() !== '')
}

export function textsEqual(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function replacementRanges(entries) {
  const ranges = []
  for (const { type, event } of entries) {
    if (type !== 'event' || event.type !== 'user/message' ||
        event.data.source?.kind !== markerKind || event.surfaceOp?.op !== 'replace') continue
    const start = event.surfaceOp.startSeq
    if (Number.isSafeInteger(start) && start < event.seq) ranges.push([start, event.seq])
  }
  return ranges
}

export function wasReplaced(ranges, seq) {
  return ranges.some(([start, end]) => start <= seq && seq <= end)
}
