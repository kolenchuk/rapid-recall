<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useTheme } from './stores/ui'
import { computed } from 'vue'

const theme = useTheme()
const route = useRoute()

const navigation = computed(() => [
  { name: 'Library', to: '/library' },
  { name: 'Reader', to: '/reader' },
])
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-100">
    <header class="border-b border-slate-200/60 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <span class="text-lg font-semibold">RapidRecall</span>
          <nav class="flex items-center gap-2 text-sm font-medium">
            <RouterLink
              v-for="item in navigation"
              :key="item.to"
              :to="item.to"
              class="rounded-full px-3 py-1 transition-colors"
              :class="
                route.path === item.to
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
              "
            >
              {{ item.name }}
            </RouterLink>
          </nav>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="theme.toggleTheme"
          >
            {{ theme.theme === 'dark' ? 'Light' : 'Dark' }} mode
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
