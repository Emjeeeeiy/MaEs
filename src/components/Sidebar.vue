<template>
  <div class="h-screen w-64 bg-white border-r shadow-lg flex flex-col">
    <!-- Logo/Header -->
    <div class="px-6 py-5 text-2xl font-bold text-green-700 border-b border-gray-200">
      MaEs
    </div>

    <!-- Profile Section -->
    <div class="px-6 py-5 border-b border-gray-200 text-center">
      <div class="mx-auto w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <img
          v-if="profileImageUrl"
          :src="profileImageUrl"
          alt="Profile"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="text-xl font-semibold text-green-700"
        >
          {{ username.charAt(0).toUpperCase() }}
        </div>
      </div>
      <h3 class="mt-2 text-sm font-semibold text-gray-800">{{ username }}</h3>
      <p class="text-xs text-gray-500">{{ role }}</p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-1">
      <router-link
        to="/payments"
        class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition"
      >
        <i class="fas fa-credit-card mr-3 w-5 text-green-500"></i> Payments
      </router-link>

      <router-link
        to="/invoices"
        class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition"
      >
        <i class="fas fa-file-invoice mr-3 w-5 text-green-500"></i> Invoices
      </router-link>

      <router-link
        to="/billing"
        class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition"
      >
        <i class="fas fa-clipboard-check mr-3 w-5 text-green-500"></i> Billing
      </router-link>

      <router-link
        to="/settings"
        class="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition"
      >
        <i class="fas fa-cog mr-3 w-5 text-green-500"></i> Settings
      </router-link>
    </nav>

    <!-- Logout Button -->
    <div class="px-4 py-5 border-t border-gray-200">
      <button
        @click="logout"
        class="w-full flex items-center text-left text-red-600 hover:text-red-700 transition"
      >
        <i class="fas fa-sign-out-alt mr-3 w-5"></i> Logout
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

const router = useRouter()
const username = ref('User')
const role = ref('Viewer')
const profileImageUrl = ref('')

// Fetch user info on auth state change
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

const logout = async () => {
  await signOut(auth)
  router.push('/login')
}
</script>
