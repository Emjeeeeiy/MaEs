<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { watch } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useTawk } from './composables/useTawk'

const route = useRoute()
const { loadTawk, unloadTawk } = useTawk()

let tawkLoaded = false

// ❌ Routes na bawal magpakita ng Tawk
const blockedRoutes = ['/', '/login', '/register', '/reset_password']

// Detect admin route (kahit subpath)
const isAdminRoute = (path) => path.startsWith('/admin')

// Helper: tanggalin talaga yung injected iframe ng Tawk
const removeTawkWidget = () => {
  const iframe = document.querySelector('iframe[src*="tawk.to"]')
  if (iframe?.parentNode) iframe.parentNode.removeChild(iframe)

  const script = document.querySelector('script[src*="tawk.to"]')
  if (script?.parentNode) script.parentNode.removeChild(script)

  // Clear global object
  window.Tawk_API = undefined
  tawkLoaded = false
}

// ✅ Custom style: ilipat sa kaliwa
const setTawkPositionLeft = () => {
  if (window.Tawk_API && window.Tawk_API.customStyle) {
    window.Tawk_API.customStyle({
      visibility: {
        desktop: {
          position: 'bl', // bottom-left
        },
        mobile: {
          position: 'bl', // bottom-left din sa mobile
        },
      },
    })
  }
}

// Main checker
const checkTawkStatus = () => {
  const user = auth.currentUser
  const path = route.path

  // ❌ Blocked routes (login, register, reset_password, landing, admin)
  if (isAdminRoute(path) || blockedRoutes.includes(path)) {
    unloadTawk()
    removeTawkWidget()
    return
  }

  // ✅ User logged in at hindi admin/blocked → load Tawk
  if (user && !tawkLoaded) {
    removeTawkWidget()
    loadTawk()
    tawkLoaded = true

    // Gumamit ng Tawk onLoad event para sure na ma-apply
    const waitForTawk = setInterval(() => {
      if (window.Tawk_API && typeof window.Tawk_API.onLoad === 'function') {
        window.Tawk_API.onLoad = function () {
          setTawkPositionLeft()
        }
        clearInterval(waitForTawk)
      }
    }, 500)

    return
  }

  // ❌ Guest user → tanggalin Tawk
  if (!user) {
    unloadTawk()
    removeTawkWidget()
  }
}

// 🔁 Watch route changes
watch(() => route.path, () => {
  checkTawkStatus()
}, { immediate: true })

// 👤 React to auth state changes
onAuthStateChanged(auth, () => {
  checkTawkStatus()
})
</script>

<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e2e5e8;
}

main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
