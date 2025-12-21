<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useWordSets } from '../stores/wordSets'
import { highlightLine, HighlightSegment } from '../utils/highlight'

const wordSets = useWordSets()
const playing = ref(false)
let timer: number | null = null

const activeSet = computed(() => wordSets.activeSet)
const hasWords = computed(() => (activeSet.value?.words.length ?? 0) > 0)
const currentWord = computed(() => {
  const set = activeSet.value
  if (!set || set.words.length === 0) return ''
  return set.words[Math.min(set.currentIndex, set.words.length - 1)]
})

const highlightedParts = computed<HighlightSegment[]>(() => highlightLine(currentWord.value))

const progressLabel = computed(() => {
  const set = activeSet.value
  if (!set) return 'No set selected'
  const total = set.words.length
  if (!total) return `${set.name} · 0 / 0`
  return `${set.name} · ${set.currentIndex + 1} / ${total}`
})

function scheduleNext() {
  clearTimer()
  if (!playing.value || !activeSet.value) return
  const wpm = activeSet.value.wpm || 1
  const delay = Math.max(50, Math.round(60000 / wpm))
  timer = window.setTimeout(() => {
    nextWord()
    if (activeSet.value && activeSet.value.currentIndex >= activeSet.value.words.length - 1) {
      playing.value = false
      clearTimer()
    } else {
      scheduleNext()
    }
  }, delay)
}

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

function togglePlay() {
  if (!hasWords.value) return
  const set = activeSet.value
  if (set && set.currentIndex >= set.words.length - 1) {
    wordSets.setIndex(set.id, 0)
  }
  playing.value = !playing.value
  if (playing.value) {
    scheduleNext()
  } else {
    clearTimer()
  }
}

function nextWord() {
  const set = activeSet.value
  if (!set) return
  if (set.currentIndex < set.words.length - 1) {
    wordSets.setIndex(set.id, set.currentIndex + 1)
  }
}

function prevWord() {
  const set = activeSet.value
  if (!set) return
  if (set.currentIndex > 0) {
    wordSets.setIndex(set.id, set.currentIndex - 1)
  }
}

function jumpStart() {
  const set = activeSet.value
  if (!set) return
  wordSets.setIndex(set.id, 0)
  playing.value = false
  clearTimer()
}

function jumpEnd() {
  const set = activeSet.value
  if (!set) return
  wordSets.setIndex(set.id, Math.max(set.words.length - 1, 0))
  playing.value = false
  clearTimer()
}

function updateWpm(value: number) {
  const set = activeSet.value
  if (!set) return
  wordSets.setWpm(set.id, value)
  if (playing.value) {
    scheduleNext()
  }
}

function updateIndex(value: number) {
  const set = activeSet.value
  if (!set) return
  wordSets.setIndex(set.id, value)
}

function onKey(e: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement | null)?.tagName ?? '')) return
  if (e.code === 'Space') {
    e.preventDefault()
    togglePlay()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextWord()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevWord()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const set = activeSet.value
    if (!set) return
    updateWpm(set.wpm + 25)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    const set = activeSet.value
    if (!set) return
    updateWpm(set.wpm - 25)
  }
}

watch(
  () => activeSet.value?.id,
  () => {
    playing.value = false
    clearTimer()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKey, { passive: false })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimer()
})
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">Reader</h2>
          <p class="text-sm text-slate-500">{{ progressLabel }}</p>
        </div>
        <div class="text-xs text-slate-500">Space: play/pause · ←/→ prev/next · ↑/↓ speed</div>
      </div>
    </div>

    <div class="flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="min-h-[140px] flex w-full flex-col items-center justify-center">
        <div
          v-if="hasWords"
          class="max-w-full text-center text-4xl font-semibold leading-tight tracking-wide text-slate-900 dark:text-slate-100 sm:text-5xl whitespace-pre-wrap break-words"
        >
          <template v-if="highlightedParts.length">
            <template v-for="(segment, idx) in highlightedParts" :key="idx">
              <template v-if="segment.kind === 'token'">
                <span class="text-slate-400 break-words">{{ segment.part.leading }}{{ segment.part.pre }}</span>
                <span class="text-red-500 break-words">{{ segment.part.focus }}</span>
                <span class="text-slate-400 break-words">{{ segment.part.post }}{{ segment.part.trailing }}</span>
              </template>
              <template v-else>
                <span>{{ segment.text }}</span>
              </template>
            </template>
          </template>
        </div>
        <p v-else class="text-sm text-slate-500">Select a set with words to start reading.</p>
      </div>

      <div class="w-full">
        <input
          v-if="activeSet"
          type="range"
          min="0"
          :max="Math.max(activeSet.words.length - 1, 0)"
          :value="activeSet.currentIndex"
          class="w-full accent-slate-600"
          @input="updateIndex(Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div class="grid w-full grid-cols-5 gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="!hasWords"
          @click="jumpStart"
        >
          ⏮ Start
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="!hasWords"
          @click="prevWord"
        >
          ◀ Prev
        </button>
        <button
          type="button"
          class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          :disabled="!hasWords"
          @click="togglePlay"
        >
          {{ playing ? 'Pause' : 'Play' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="!hasWords"
          @click="nextWord"
        >
          ▶ Next
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          :disabled="!hasWords"
          @click="jumpEnd"
        >
          ⏭ End
        </button>
      </div>

      <div class="w-full rounded-lg border border-slate-200 p-4 text-left dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-semibold">Words Per Minute</div>
            <div class="text-lg font-bold text-slate-900 dark:text-slate-100">
              {{ activeSet?.wpm ?? 100 }}
            </div>
          </div>
          <div class="text-xs text-slate-500">Range 1–300</div>
        </div>
        <input
          v-if="activeSet"
          type="range"
          min="1"
          max="300"
          step="1"
          :value="activeSet.wpm"
          class="mt-3 w-full accent-slate-600"
          @input="updateWpm(Number(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>
  </section>
</template>
