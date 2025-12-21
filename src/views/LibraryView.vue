<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useWordSets } from '../stores/wordSets'

const wordSets = useWordSets()

const newSetName = ref('')
const importText = ref('')
const replaceMode = ref(false)
const renameValue = ref('')
const copied = ref(false)
const editText = ref('')

const activeSet = computed(() => wordSets.activeSet)
const hasSets = computed(() => wordSets.sets.length > 0)

watch(
  () => activeSet.value?.id,
  () => {
    renameValue.value = activeSet.value?.name ?? ''
    editText.value = activeSet.value ? activeSet.value.words.join('\n') : ''
  },
  { immediate: true },
)

function createSet() {
  const created = wordSets.createSet(newSetName.value)
  if (created) {
    renameValue.value = created.name
    newSetName.value = ''
    importText.value = ''
    editText.value = ''
  }
}

function selectSet(id: string) {
  wordSets.selectSet(id)
  importText.value = ''
  renameValue.value = wordSets.activeSet?.name ?? ''
  editText.value = wordSets.activeSet ? wordSets.activeSet.words.join('\n') : ''
}

function handleImport() {
  if (!activeSet.value) return
  const count = replaceMode.value
    ? wordSets.replaceWords(activeSet.value.id, importText.value)
    : wordSets.importWords(activeSet.value.id, importText.value)
  importText.value = ''
  editText.value = activeSet.value ? activeSet.value.words.join('\n') : ''
  return count
}

async function importFromFile(event: Event) {
  if (!activeSet.value) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    if (replaceMode.value) {
      wordSets.replaceWords(activeSet.value.id, text)
    } else {
      wordSets.importWords(activeSet.value.id, text)
    }
    editText.value = activeSet.value.words.join('\n')
  } finally {
    input.value = ''
  }
}

function exportWords() {
  if (!activeSet.value) return
  const text = wordSets.exportWords(activeSet.value.id)
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      copied.value = true
      setTimeout(() => (copied.value = false), 1500)
    })
  }
  return text
}

function downloadWordsFile() {
  if (!activeSet.value) return
  const text = wordSets.exportWords(activeSet.value.id)
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${activeSet.value.name || 'words'}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return text
}

function deleteSet(id: string) {
  wordSets.deleteSet(id)
  importText.value = ''
  renameValue.value = wordSets.activeSet?.name ?? ''
}

function renameSet() {
  if (!activeSet.value) return
  wordSets.renameSet(activeSet.value.id, renameValue.value)
}

function saveEditedWords() {
  if (!activeSet.value) return
  wordSets.replaceWords(activeSet.value.id, editText.value)
  editText.value = activeSet.value.words.join('\n')
}

function goToReader(id: string) {
  wordSets.selectSet(id)
  window.dispatchEvent(new CustomEvent('navigate-reader'))
}
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-lg font-semibold">Library</h2>
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Create sets, import words (one per line), pick the active set, and export words.
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
        <li>Create a set, then paste or import words (one entry per line). Duplicates are removed.</li>
        <li>Edit words inline at any time; use “Replace existing words” to overwrite instead of append.</li>
        <li>Import from a .txt file or paste; export by copying or downloading a .txt file for backup.</li>
        <li>Click ▶ on a set or “▶ Reader” to start reading that set from its saved position.</li>
        <li>Use Export to copy all words for backups or sharing.</li>
      </ul>
      <form class="mt-4 flex flex-col gap-3 sm:flex-row" @submit.prevent="createSet">
        <input
          v-model="newSetName"
          type="text"
          placeholder="New set name"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Create
        </button>
      </form>
    </div>

    <div class="grid gap-4 md:grid-cols-[260px,1fr]">
      <div class="space-y-3">
        <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">Sets</h3>
            <span class="text-xs text-slate-500">{{ wordSets.sets.length }} total</span>
          </div>
          <div v-if="hasSets" class="mt-3 space-y-2">
            <div v-for="set in wordSets.sets" :key="set.id" class="flex items-center gap-2">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
                :class="set.id === wordSets.activeSetId ? 'border-slate-500 bg-slate-100 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700'"
                @click="selectSet(set.id)"
              >
                <div>
                  <div class="font-medium">{{ set.name }}</div>
                  <div class="text-xs text-slate-500">{{ set.words.length }} words</div>
                </div>
              </button>
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                @click.stop="goToReader(set.id)"
                aria-label="Open in reader"
              >
                ▶
              </button>
              <button
                type="button"
                class="whitespace-nowrap rounded-lg border border-slate-200 px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-slate-700 dark:hover:bg-slate-800"
                @click.stop="deleteSet(set.id)"
                aria-label="Delete set"
              >
                Delete
              </button>
            </div>
          </div>
          <p v-else class="mt-3 text-sm text-slate-500">No sets yet. Create one to get started.</p>
        </div>
      </div>

      <div
        v-if="activeSet"
        class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">{{ activeSet.name }}</h3>
            <p class="text-sm text-slate-500">{{ activeSet.words.length }} words</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="renameValue"
              type="text"
              class="w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Rename set"
            />
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              @click="renameSet"
            >
              Rename
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              @click="goToReader(activeSet.id)"
            >
              ▶ Reader
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">Edit words</h4>
            <span class="text-xs text-slate-500">One per line</span>
          </div>
          <textarea
            v-model="editText"
            rows="8"
            placeholder="Edit words here"
            class="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          ></textarea>
          <div class="mt-3 flex items-center justify-end">
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              @click="saveEditedWords"
            >
              Save words
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">Import words</h4>
            <label class="flex items-center gap-2 text-xs text-slate-500">
              <input v-model="replaceMode" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500" />
              Replace existing words
            </label>
        </div>
        <textarea
          v-model="importText"
          rows="6"
          placeholder="One word per line"
          class="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        ></textarea>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              <input class="hidden" type="file" accept=".txt,text/plain" @change="importFromFile" />
              📁 Import file
            </label>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              @click="wordSets.clearProgress(activeSet.id)"
            >
              Reset progress
            </button>
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              @click="handleImport"
            >
              {{ replaceMode ? 'Replace' : 'Add' }} words
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">Export words</h4>
            <span class="text-xs text-slate-500">{{ activeSet.words.length }} words</span>
          </div>
          <p class="mt-1 text-sm text-slate-500">Copies all words to your clipboard.</p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              @click="exportWords"
            >
              Copy words
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              @click="downloadWordsFile"
            >
              Download .txt
            </button>
            <span class="text-xs text-green-600" v-if="copied">Copied!</span>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        Select or create a set to manage its words.
      </div>
    </div>
  </section>
</template>
