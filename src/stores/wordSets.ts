import { defineStore } from 'pinia'
import { nanoid } from 'nanoid/non-secure'

export type WordSet = {
  id: string
  name: string
  words: string[]
  currentIndex: number
  wpm: number
}

type PersistedState = {
  sets: WordSet[]
  activeSetId: string | null
}

const STORAGE_KEY = 'rapid-recall:word-sets'
const WPM_MIN = 1
const WPM_MAX = 300
const DEFAULT_WPM = 100

function clampWpm(value: number | undefined) {
  const num = typeof value === 'number' ? value : DEFAULT_WPM
  return Math.min(Math.max(WPM_MIN, num), WPM_MAX)
}

function normalizeLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function loadState(): PersistedState {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { sets: [], activeSetId: null }
  try {
    const parsed = JSON.parse(raw) as PersistedState
    return parsed
  } catch (err) {
    console.warn('Failed to parse stored sets', err)
    return { sets: [], activeSetId: null }
  }
}

function persistState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useWordSets = defineStore('wordSets', {
  state: () => ({
    sets: [] as WordSet[],
    activeSetId: null as string | null,
  }),
  getters: {
    activeSet(state): WordSet | undefined {
      return state.sets.find((set) => set.id === state.activeSetId)
    },
  },
  actions: {
    hydrate() {
      const data = loadState()
      this.sets = (data.sets ?? []).map((set) => ({
        ...set,
        wpm: clampWpm(set.wpm),
      }))
      this.activeSetId = data.activeSetId ?? null
    },
    persist() {
      persistState({ sets: this.sets, activeSetId: this.activeSetId })
    },
    createSet(name: string) {
      const trimmed = name.trim()
      if (!trimmed) return null
      const newSet: WordSet = {
        id: nanoid(8),
        name: trimmed,
        words: [],
        currentIndex: 0,
        wpm: DEFAULT_WPM,
      }
      this.sets.unshift(newSet)
      this.activeSetId = newSet.id
      this.persist()
      return newSet
    },
    renameSet(id: string, name: string) {
      const set = this.sets.find((s) => s.id === id)
      if (!set) return
      const trimmed = name.trim()
      if (!trimmed) return
      set.name = trimmed
      this.persist()
    },
    deleteSet(id: string) {
      this.sets = this.sets.filter((s) => s.id !== id)
      if (this.activeSetId === id) {
        this.activeSetId = this.sets[0]?.id ?? null
      }
      this.persist()
    },
    selectSet(id: string) {
      this.activeSetId = id
      this.persist()
    },
    importWords(id: string, text: string) {
      const set = this.sets.find((s) => s.id === id)
      if (!set) return 0
      const words = normalizeLines(text)
      const existing = new Set(set.words)
      let added = 0
      for (const w of words) {
        if (!existing.has(w)) {
          set.words.push(w)
          existing.add(w)
          added++
        }
      }
      this.persist()
      return added
    },
    replaceWords(id: string, text: string) {
      const set = this.sets.find((s) => s.id === id)
      if (!set) return 0
      const words = normalizeLines(text)
      const unique = Array.from(new Set(words))
      set.words = unique
      set.currentIndex = 0
      this.persist()
      return unique.length
    },
    exportWords(id: string) {
      const set = this.sets.find((s) => s.id === id)
      return set ? set.words.join('\n') : ''
    },
    setIndex(id: string, nextIndex: number) {
      const set = this.sets.find((s) => s.id === id)
      if (!set) return
      const bounded = Math.min(Math.max(0, nextIndex), Math.max(set.words.length - 1, 0))
      set.currentIndex = bounded
      this.persist()
    },
    setWpm(id: string, wpm: number) {
      const set = this.sets.find((s) => s.id === id)
      if (!set) return
      const bounded = clampWpm(wpm)
      set.wpm = bounded
      this.persist()
    },
    clearProgress(id: string) {
      const set = this.sets.find((s) => s.id === id)
      if (!set) return
      set.currentIndex = 0
      this.persist()
    },
  },
})
