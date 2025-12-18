import { defineStore } from 'pinia'

type Theme = 'light' | 'dark'

const THEME_KEY = 'rapid-recall:theme'

export const useTheme = defineStore('ui', {
  state: () => ({
    theme: 'light' as Theme,
  }),
  actions: {
    initTheme() {
      const saved = (localStorage.getItem(THEME_KEY) as Theme | null) ?? null
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      const theme: Theme = saved ?? (prefersDark ? 'dark' : 'light')
      this.setTheme(theme)
    },
    setTheme(theme: Theme) {
      this.theme = theme
      localStorage.setItem(THEME_KEY, theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    },
    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark')
    },
  },
})
