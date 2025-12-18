import { describe, expect, it } from 'vitest'
import { highlightLine, highlightToken, orpIndex, splitByOrp } from './highlight'

describe('orpIndex', () => {
  it('picks expected positions by length', () => {
    expect(orpIndex('a')).toBe(0)
    expect(orpIndex('word')).toBe(1)
    expect(orpIndex('longer')).toBe(2)
    expect(orpIndex('incredible')).toBe(3)
    expect(orpIndex('characteristics')).toBe(4)
  })
})

describe('splitByOrp', () => {
  it('splits around the focus character', () => {
    expect(splitByOrp('speed')).toEqual({ pre: 's', focus: 'p', post: 'eed' })
    expect(splitByOrp('reading')).toEqual({ pre: 're', focus: 'a', post: 'ding' })
  })

  it('handles empty input', () => {
    expect(splitByOrp('')).toEqual({ pre: '', focus: '', post: '' })
  })
})

describe('highlightToken', () => {
  it('preserves punctuation and highlights core', () => {
    expect(highlightToken('(hello)')).toEqual({
      leading: '(',
      pre: 'h',
      focus: 'e',
      post: 'llo',
      trailing: ')',
    })
  })
})

describe('highlightLine', () => {
  it('highlights multiple words', () => {
    const parts = highlightLine('This is fine')
    expect(parts).toHaveLength(5) // token, space, token, space, token
    expect(parts[0].kind).toBe('token')
    expect(parts[0].kind === 'token' ? parts[0].part.focus : '').toBe('h')
    expect(parts[2].kind === 'token' ? parts[2].part.focus : '').toBe('s')
    expect(parts[4].kind === 'token' ? parts[4].part.focus : '').toBe('i')
    expect(parts[1].kind).toBe('space')
  })

  it('preserves spaces and punctuation between tokens', () => {
    const parts = highlightLine('Hello, world!')
    expect(parts.map((p) => (p.kind === 'space' ? p.text : 'token'))).toEqual(['token', ' ', 'token'])
    if (parts[0].kind === 'token') {
      expect(parts[0].part.leading).toBe('')
      expect(parts[0].part.trailing).toBe(',')
    }
    if (parts[2].kind === 'token') {
      expect(parts[2].part.trailing).toBe('!')
    }
  })
})
