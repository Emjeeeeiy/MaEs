<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-green-300 to-green-700 text-gray-900">
    <!-- Top‑bar -->
    <login_topbar />

    <!-- ── Hero / Header ─────────────────────────────────────── -->
    <header class="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12">
      <!-- Copy / Intro -->
      <section class="w-full lg:w-1/2 max-w-xl text-white mb-12 lg:mb-0 lg:mr-10">
        <h1 class="text-4xl sm:text-5xl font-extrabold leading-tight drop-shadow-lg">
          Maria&nbsp;Estrella General Hospital
        </h1>
        <p class="mt-4 text-lg sm:text-xl">
          A modern, secure platform for managing billing, appointments, laboratory results,
          and more — all in one place.
        </p>

        <!-- Login Button -->
        <button
          @click="showLoginModal = true"
          class="mt-6 bg-white text-green-700 font-semibold px-5 py-2 rounded shadow hover:bg-gray-100 transition"
        >
          Login
        </button>
      </section>

      <!-- Glass info card -->
      <section
        class="w-full lg:w-1/2 max-w-xl bg-white/30 backdrop-blur-md border border-white/30 rounded-lg shadow-lg text-white p-8"
      >
        <h2 class="text-2xl font-bold mb-4">Why choose MaEs?</h2>
        <ul class="space-y-3 text-sm leading-relaxed">
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8.5 8.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 12.086l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
            Role‑based secure access for staff &amp; patients
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8.5 8.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 12.086l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
            Real‑time billing and payment monitoring
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8.5 8.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L8 12.086l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
            Integrated feedback &amp; appointment system
          </li>
        </ul>
      </section>
    </header>

    <!-- Feature Grid -->
    <section class="bg-white py-16 px-6">
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div class="bg-green-50 rounded-lg p-6 shadow-sm text-center">
          <h3 class="font-bold text-lg mb-2">Smart Billing</h3>
          <p class="text-sm text-gray-700">
            Automated invoicing, insurance claims, and senior/PWD discounts — handled effortlessly.
          </p>
        </div>
        <div class="bg-green-50 rounded-lg p-6 shadow-sm text-center">
          <h3 class="font-bold text-lg mb-2">Lab Results Online</h3>
          <p class="text-sm text-gray-700">
            Patients can download PDF results, admins can add findings in one secure portal.
          </p>
        </div>
        <div class="bg-green-50 rounded-lg p-6 shadow-sm text-center">
          <h3 class="font-bold text-lg mb-2">24/7 Support</h3>
          <p class="text-sm text-gray-700">
            Built‑in messaging ensures requests for assistance reach the right department fast.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white text-center py-6 text-sm">
      © {{ new Date().getFullYear() }} Maria Estrella General Hospital Inc. All rights reserved.
    </footer>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white w-full max-w-sm rounded-lg p-6 shadow-xl relative">
        <!-- Close -->
        <button @click="showLoginModal = false" class="absolute top-2 right-2 text-gray-600 text-lg">&times;</button>
        <!-- Title -->
        <h2 class="text-xl font-bold text-center text-green-700 mb-4">Login</h2>

        <!-- Error -->
        <p v-if="errorMessage" class="text-sm text-red-600 text-center mb-2">{{ errorMessage }}</p>

        <!-- Email / Password form -->
        <form @submit.prevent="loginUser" class="space-y-3">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border rounded px-3 py-2 focus:ring-1 focus:ring-green-500"
          />

          <!-- Password with eye icon -->
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full border rounded px-3 py-2 pr-10 focus:ring-1 focus:ring-green-500"
            />
            <button
              type="button"
              @click="toggleShowPassword"
              class="absolute inset-y-0 right-2 flex items-center text-gray-500"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.905.532-3.688 1.458-5.211m3.163-2.354A10.05 10.05 0 0112 3c5.523 0 10 4.477 10 10 0 1.905-.532 3.688-1.458 5.211m-3.163 2.354A9.965 9.965 0 0112 21a9.965 9.965 0 01-6.379-2.144" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm4.243 4.243A10.05 10.05 0 0021 12c0-5.523-4.477-10-10-10a10.05 10.05 0 00-7.071 2.929M3 3l18 18" />
              </svg>
            </button>
          </div>

          <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Login
          </button>
        </form>

        <!-- Google Sign‑In -->
        <button
          @click="signInWithGoogle"
          class="mt-4 w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-100"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" class="h-5 w-5" />
          <span class="text-sm font-medium">Sign in with Google</span>
        </button>

        <!-- Register link -->
        <p class="mt-4 text-center text-sm">
          Don't have an account?
          <router-link to="/register" class="text-green-700 font-semibold hover:underline">
            Register
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import login_topbar from '@/components/login_topbar.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

/* ── State ───────────────────────────────────────────── */
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showLoginModal = ref(false)
const showPassword = ref(false)

const auth = getAuth()
const router = useRouter()

/* ── UI helpers ──────────────────────────────────────── */
const toggleShowPassword = () => (showPassword.value = !showPassword.value)

/* ── Email / Password Login ──────────────────────────── */
const loginUser = async () => {
  errorMessage.value = ''
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.value, password.value)

    if (!user.emailVerified) {
      errorMessage.value = 'Please verify your email.'
      await signOut(auth)
      return
    }

    await routeByRole(user.uid)
    showLoginModal.value = false
  } catch (err) {
    errorMessage.value = 'Invalid email or password.'
  }
}

/* ── Google Sign‑In ──────────────────────────────────── */
const signInWithGoogle = async () => {
  errorMessage.value = ''
  try {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    await routeByRole(user.uid)
    showLoginModal.value = false
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Google sign‑in failed.'
  }
}

/* ── Role‑based Routing ─────────────────────────────── */
const routeByRole = async (uid) => {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    errorMessage.value = 'User data not found.'
    return
  }

  const data = snap.data()
  if (data.status === 'deactivated') {
    errorMessage.value = 'Account deactivated.'
    await signOut(auth)
    return
  }

  router.push(data.role === 'admin' ? '/admin-dashboard' : '/dashboard')
}
</script>

<style scoped>
button,
a {
  transition: transform 0.15s ease;
}
button:hover,
a:hover {
  transform: translateY(-2px);
}
</style>
