<template>
  <div>
    <!-- Mobile overlay -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 backdrop-blur-sm bg-black/10 sm:hidden"
      @click="isMobileSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed sm:static top-0 left-0 h-screen w-64 bg-gray-800 text-white z-50 flex flex-col transition-transform duration-300',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="px-6 py-4 text-2xl font-bold text-green-500 border-b border-gray-700">
        MaEs
      </div>

      <!-- Profile -->
      <div class="flex-1 overflow-y-auto">
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

        <!-- Navigation Links -->
        <nav class="px-4 py-6 space-y-2">
          <router-link to="/dashboard" class="nav-link group">
            <HomeIcon class="nav-icon group-hover:animate-bounce" />
            Dashboard
          </router-link>

          <router-link to="/billing" class="nav-link group">
            <ClipboardDocumentCheckIcon class="nav-icon group-hover:animate-bounce" />
            Billing
          </router-link>

          <router-link to="/payments" class="nav-link group">
            <CreditCardIcon class="nav-icon group-hover:animate-bounce" />
            Payments
          </router-link>

          <router-link to="/invoices" class="nav-link group">
            <DocumentTextIcon class="nav-icon group-hover:animate-bounce" />
            Invoices
          </router-link>

          <router-link to="/appointment" class="nav-link group">
            <CalendarIcon class="nav-icon group-hover:animate-bounce" />
            Appointments
          </router-link>

          <!-- <router-link to="/report" class="nav-link group">
            <ClipboardDocumentListIcon class="nav-icon group-hover:animate-bounce" />
            Report
          </router-link> -->

          <router-link to="/result" class="nav-link group">
            <ChartBarIcon class="nav-icon group-hover:animate-bounce" />
            Result
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Toggle Button -->
    <button
      @click="isMobileSidebarOpen = !isMobileSidebarOpen"
      class="fixed top-16 left-4 z-[9999] sm:hidden bg-gray-800 text-white p-1.5 rounded-md shadow-md"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/solid'

const username = ref('User')
const role = ref('Viewer')
const profileImageUrl = ref('')
const isMobileSidebarOpen = ref(false)

let unsubscribeUserDoc = null

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (unsubscribeUserDoc) unsubscribeUserDoc()
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      unsubscribeUserDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          username.value = data.username || data.displayName || user.displayName || 'User'
          role.value = data.role || 'Viewer'
          profileImageUrl.value = data.photoURL || user.photoURL || ''
        }
      })
    }
  })
})

onBeforeUnmount(() => {
  if (unsubscribeUserDoc) unsubscribeUserDoc()
})
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: #e5e7eb; /* text-gray-200 */
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #16a34a; /* green-600 */
  color: white;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

/* Scrollbar fix */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
