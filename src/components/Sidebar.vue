<template>
  <div class="h-screen w-64 bg-gray-800 text-white border-r shadow-lg flex flex-col">
    <!-- Logo/Header -->
    <div class="px-6 py-5 text-2xl font-bold text-green-500 border-b border-gray-700">
      MaEs
    </div>

    <!-- Profile Section -->
    <div class="px-6 py-5 border-b border-gray-700 text-center">
      <div class="mx-auto w-16 h-16 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
        <img
          v-if="profileImageUrl"
          :src="profileImageUrl"
          alt="Profile"
          class="w-full h-full object-cover"
        />
        <div v-else class="text-xl font-semibold text-green-500">
          {{ username.charAt(0).toUpperCase() }}
        </div>
      </div>
      <h3 class="mt-2 text-sm font-semibold text-gray-200">{{ username }}</h3>
      <p class="text-xs text-gray-400">{{ role }}</p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <router-link
        to="/dashboard"
        class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition"
      >
        <HomeIcon class="w-5 h-5 mr-3 text-green-500" /> Dashboard
      </router-link>

      <router-link
        to="/payments"
        class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition"
      >
        <CreditCardIcon class="w-5 h-5 mr-3 text-green-500" /> Payments
      </router-link>

      <router-link
        to="/invoices"
        class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition"
      >
        <DocumentTextIcon class="w-5 h-5 mr-3 text-green-500" /> Invoices
      </router-link>

      <router-link
        to="/billing"
        class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition"
      >
        <ClipboardDocumentCheckIcon class="w-5 h-5 mr-3 text-green-500" /> Billing
      </router-link>
    </nav>

    <!-- Logout Button -->
    <div class="px-4 py-5 border-t border-gray-700">
      <button
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <template v-if="!isLoggingOut">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          <span>Logout</span>
        </template>
        <template v-else>
          <svg
            class="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <span>Logging out...</span>
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Heroicons
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/solid'

const router = useRouter()
const username = ref('User')
const role = ref('Viewer')
const profileImageUrl = ref('')
const isLoggingOut = ref(false)

const auth = getAuth()

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        username.value = data.displayName || user.displayName || 'User'
        role.value = data.role || 'Viewer'
        profileImageUrl.value = data.photoURL || user.photoURL || ''
      }
    }
  })
})

const handleLogout = async () => {
  if (isLoggingOut.value) return
  isLoggingOut.value = true
  try {
    await signOut(auth)
    router.push('/login')
  } catch (err) {
    console.error('Logout failed:', err)
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.bg-gray-800 {
  background-color: #2d3748;
}
.text-green-500 {
  color: #48bb78;
}
.bg-gray-600 {
  background-color: #4a5568;
}
.hover\:bg-green-600:hover {
  background-color: #38a169;
}
.text-gray-200 {
  color: #e2e8f0;
}
.text-gray-400 {
  color: #cbd5e0;
}
.bg-red-500 {
  background-color: #f56565;
}
</style>
