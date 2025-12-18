export function orpIndex(word: string): number {
  const len = word.length
  if (len <= 1) return 0
  if (len <= 5) return 1
  if (len <= 9) return 2
  if (len <= 13) return 3
  return 4
}

export function splitByOrp(word: string) {
  if (!word) return { pre: '', focus: '', post: '' }
  const index = Math.min(orpIndex(word), word.length - 1)
  return {
    pre: word.slice(0, index),
    focus: word.charAt(index),
    post: word.slice(index + 1),
  }
}

const leadingRegex = /^[^0-9A-Za-z]+/
const trailingRegex = /[^0-9A-Za-z]+$/

export type HighlightPart = {
  leading: string
  pre: string
  focus: string
  post: string
  trailing: string
}

export function highlightToken(token: string): HighlightPart {
  const leading = token.match(leadingRegex)?.[0] ?? ''
  const trailing = token.match(trailingRegex)?.[0] ?? ''
  const core = token.slice(leading.length, token.length - trailing.length)
  const { pre, focus, post } = splitByOrp(core || token)
  return {
    leading,
    pre,
    focus,
    post,
    trailing,
  }
}

export type HighlightSegment =
  | { kind: 'token'; part: HighlightPart }
  | { kind: 'space'; text: string }

export function highlightLine(line: string): HighlightSegment[] {
  if (!line) return []
  const segments: HighlightSegment[] = []
  const pieces = line.split(/(\s+)/)
  for (const piece of pieces) {
    if (!piece) continue
    if (/^\s+$/.test(piece)) {
      segments.push({ kind: 'space', text: piece })
    } else {
      segments.push({ kind: 'token', part: highlightToken(piece) })
    }
  }
  return segments
}
