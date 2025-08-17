<template>
  <div
    class="min-h-screen flex items-center justify-center relative px-4 py-8"
  >
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('/MaEs_bg.png');"
    ></div>

    <!-- Overlay para di masyadong matingkad yung bg -->
    <div class="absolute inset-0 bg-black/40"></div>

    <!-- Login Container -->
    <div
      class="relative w-full max-w-5xl bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
    >
      <!-- Left Info Section -->
      <div
        class="md:w-1/2 bg-white text-green-700 p-10 flex flex-col justify-center"
      >
        <div class="mb-6">
          <img src="/MaEs_logo2.png" alt="Logo" class="h-14 w-14 mb-4" />
          <h2 class="text-2xl font-bold">
            Maria Estrella General Hospital, Inc.
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            A secure hospital management and billing system designed to improve
            patient care and streamline operations.
          </p>
        </div>
        <ul class="space-y-3 text-sm">
          <li class="flex items-center gap-2">
            <span class="bg-green-600 rounded-full h-2 w-2"></span>
            Fast & secure access for staff and patients
          </li>
          <li class="flex items-center gap-2">
            <span class="bg-green-600 rounded-full h-2 w-2"></span>
            Role-based dashboard for Admin & Users
          </li>
          <li class="flex items-center gap-2">
            <span class="bg-green-600 rounded-full h-2 w-2"></span>
            Integrated billing & record management
          </li>
        </ul>
      </div>

      <!-- Right Login Card (More Transparent) -->
      <div class="md:w-1/2 p-8 bg-white/30 backdrop-blur-xl">
        <!-- Title -->
        <h2 class="text-2xl font-bold text-center text-green-700 mb-6">
          Log in
        </h2>

        <!-- Error -->
        <p
          v-if="errorMessage"
          class="text-sm text-red-600 text-center mb-4"
        >
          {{ errorMessage }}
        </p>

        <!-- Email / Password form -->
        <form @submit.prevent="loginUser" class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1"
              >Password</label
            >
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                @click="toggleShowPassword"
                class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <svg
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 
                       0-10-4.477-10-10 0-1.905.532-3.688 
                       1.458-5.211m3.163-2.354A10.05 10.05 
                       0 0112 3c5.523 0 10 4.477 10 
                       10 0 1.905-.532 3.688-1.458 
                       5.211m-3.163 2.354A9.965 9.965 
                       0 0112 21a9.965 9.965 0 01-6.379-2.144"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 
                       11-6 0 3 3 0 016 0zm4.243 
                       4.243A10.05 10.05 0 0021 12c0-5.523-4.477-10-10-10a10.05 
                       10.05 0 00-7.071 2.929M3 3l18 18"
                  />
                </svg>
              </button>
            </div>
            <!-- Forgot Password Link -->
            <div class="text-right mt-1">
              <router-link
                to="/reset_password"
                class="text-sm text-green-700 hover:underline"
              >
                Forgot Password?
              </router-link>
            </div>
          </div>

          <button
            type="submit"
            class="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition duration-150"
          >
            Login
          </button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center justify-between">
          <hr class="w-full border-gray-300" />
          <span class="text-sm text-gray-400 px-2">or</span>
          <hr class="w-full border-gray-300" />
        </div>

        <!-- Google Sign-In -->
        <button
          @click="signInWithGoogle"
          class="w-full border border-gray-300 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            class="h-5 w-5"
          />
          <span class="text-sm font-medium text-gray-700"
            >Continue with Google</span
          >
        </button>

        <!-- Register link -->
        <p class="mt-6 text-center text-sm text-gray-700">
          Don’t have an account?
          <router-link
            to="/register"
            class="text-green-700 font-semibold hover:underline"
            >Register</router-link
          >
        </p>

        <!-- Back to Landing Page -->
        <div class="mt-4 text-center">
          <router-link
            to="/"
            class="inline-block text-sm text-gray-600 hover:text-green-700 font-medium hover:underline"
          >
            ← Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)

const auth = getAuth()
const router = useRouter()

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value
}

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
  } catch (err) {
    errorMessage.value = 'Invalid email or password.'
  }
}

const signInWithGoogle = async () => {
  errorMessage.value = ''
  try {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    await routeByRole(user.uid)
  } catch (err) {
    console.error(err)
    errorMessage.value = 'Google sign-in failed.'
  }
}

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
