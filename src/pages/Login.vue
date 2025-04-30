<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <form @submit.prevent="loginUser" class="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>
  
        <div v-if="errorMessage" class="mb-4 text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>
  
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            v-model="email"
            required
            class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Password</label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              required
              class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              @click="toggleShowPassword"
              class="absolute inset-y-0 right-3 text-sm text-blue-500"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>
  
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Login
        </button>
  
        <!-- Google Login Button -->
        <button
          @click="loginWithGoogle"
          type="button"
          class="w-full bg-white border border-gray-300 flex items-center justify-center gap-2 py-2 mt-4 rounded hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google Logo"
            class="w-5 h-5"
          />
          <span class="text-gray-700">Sign in with Google</span>
        </button>
      </form>
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
    sendEmailVerification,
    signOut
  } from 'firebase/auth'
  import { db } from '../firebase' // adjust this if your firebase config path differs
  import { doc, getDoc, setDoc } from 'firebase/firestore'
  
  const router = useRouter()
  const auth = getAuth()
  
  const email = ref('')
  const password = ref('')
  const errorMessage = ref('')
  const showPassword = ref(false)
  
  const loginUser = async () => {
    errorMessage.value = ''
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      const user = userCredential.user
  
      if (!user.emailVerified) {
        errorMessage.value = 'Please verify your email first.'
        await signOut(auth)
        return
      }
  
      // Optional: Check Firestore user document
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        errorMessage.value = 'User profile not found.'
        return
      }
  
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      errorMessage.value = 'Login failed: ' + error.message
    }
  }
  
  const loginWithGoogle = async () => {
    errorMessage.value = ''
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
  
      // Optional: Check or create Firestore user record
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
  
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: 'user', // default role
          createdAt: new Date()
        })
      }
  
      router.push('/dashboard')
    } catch (error) {
      errorMessage.value = 'Google login failed: ' + error.message
    }
  }
  
  const toggleShowPassword = () => {
    showPassword.value = !showPassword.value
  }
  </script>
  