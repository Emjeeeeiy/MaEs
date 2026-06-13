import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'

// Initialize Theme
const savedTheme = localStorage.getItem('theme') || 'light'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

createApp(App)
.use(router)
.mount('#app')
