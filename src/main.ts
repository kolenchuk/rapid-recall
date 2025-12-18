import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useTheme } from './stores/ui'
import { useWordSets } from './stores/wordSets'
import { registerSW } from 'virtual:pwa-register'

registerSW()

const app = createApp(App)
const pinia = createPinia()

const ui = useTheme(pinia)
const sets = useWordSets(pinia)
ui.initTheme()
sets.hydrate()

app.use(pinia)
app.use(router)

window.addEventListener('navigate-reader', () => {
  router.push({ name: 'reader' })
})

app.mount('#app')
