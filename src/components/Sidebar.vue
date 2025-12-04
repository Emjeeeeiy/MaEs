<template>
  <div>
    <!-- ✅ Desktop Sidebar -->
    <aside
      class="hidden sm:flex sm:flex-col w-48 h-screen bg-gray-200 text-gray-800 shadow-md"
    >
      <!-- Profile -->
      <div class="flex-1 overflow-y-auto">
        <router-link
          to="/profile"
          class="block px-4 py-4 border-b border-gray-300 text-center hover:bg-gray-300 transition"
        >
          <div
            class="mx-auto w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center shadow transform transition-all duration-500 hover:scale-110 hover:rotate-3"
          >
            <img
              v-if="profileImageUrl"
              :src="profileImageUrl"
              alt="Profile"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-125"
            />
            <div v-else class="text-2xl font-bold text-green-600">
              {{ username.charAt(0).toUpperCase() }}
            </div>
          </div>
          <h3 class="mt-2 text-sm font-semibold text-gray-800 hover:underline truncate">
            {{ username }}
          </h3>
          <p class="text-xs text-gray-500 truncate">{{ role }}</p>
        </router-link>

        <!-- Navigation Links -->
        <nav class="px-3 py-4 space-y-3">
          <!-- MAIN -->
          <div>
            <p class="px-2 mb-1 text-[9px] text-gray-500 uppercase tracking-wide">Main</p>
            <router-link to="/dashboard" :class="linkClass('/dashboard')">
              <HomeIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Dashboard</span>
            </router-link>
          </div>

          <!-- PROCESS -->
          <div>
            <p class="px-2 mb-1 text-[9px] text-gray-500 uppercase tracking-wide">Process</p>
            <router-link to="/billing" :class="linkClass('/billing')">
              <ClipboardDocumentCheckIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Billing</span>
            </router-link>
            <router-link to="/payments" :class="linkClass('/payments')">
              <CreditCardIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Payments</span>
            </router-link>
          </div>

          <!-- INFORMATION -->
          <div>
            <p class="px-2 mb-1 text-[9px] text-gray-500 uppercase tracking-wide">Information</p>
            <router-link to="/invoices" :class="linkClass('/invoices')">
              <DocumentTextIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Invoices</span>
            </router-link>
          </div>

          <!-- OTHER -->
          <div>
            <p class="px-2 mb-1 text-[9px] text-gray-500 uppercase tracking-wide">Other</p>
            <router-link to="/appointment" :class="linkClass('/appointment')">
              <CalendarIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Appointments</span>
            </router-link>
            <router-link to="/result" :class="linkClass('/result')">
              <ChartBarIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Results</span>
            </router-link>
            <router-link to="/profile" :class="linkClass('/profile')">
              <UserCircleIcon class="w-4 h-4 text-gray-600" />
              <span class="truncate text-xs">Profile</span>
            </router-link>
          </div>
        </nav>
      </div>
    </aside>

    <!-- ✅ Bottom Navigation (Mobile) -->
    <nav
      class="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 flex justify-around items-center h-20 z-50"
    >
      <router-link to="/dashboard" :class="mobileLinkClass('/dashboard')">
        <div class="flex flex-col items-center">
          <HomeIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1">Dashboard</span>
        </div>
      </router-link>

      <router-link to="/billing" :class="mobileLinkClass('/billing')">
        <div class="flex flex-col items-center">
          <ClipboardDocumentCheckIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1">Billing</span>
        </div>
      </router-link>

      <router-link to="/payments" :class="mobileLinkClass('/payments')">
        <div class="flex flex-col items-center">
          <CreditCardIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1">Payments</span>
        </div>
      </router-link>

      <router-link to="/invoices" :class="mobileLinkClass('/invoices')">
        <div class="flex flex-col items-center">
          <DocumentTextIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1">Invoices</span>
        </div>
      </router-link>

      <router-link to="/appointment" :class="mobileLinkClass('/appointment')">
        <div class="flex flex-col items-center">
          <CalendarIcon class="w-6 h-6" />
          <span class="text-[8px] mt-1">Appointments</span>
        </div>
      </router-link>

      <router-link to="/result" :class="mobileLinkClass('/result')">
        <div class="flex flex-col items-center">
          <ChartBarIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1">Results</span>
        </div>
      </router-link>

      <router-link to="/profile" :class="mobileLinkClass('/profile')">
        <div class="flex flex-col items-center">
          <UserCircleIcon class="w-6 h-6" />
          <span class="text-[10px] mt-1">Profile</span>
        </div>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  UserCircleIcon,
} from '@heroicons/vue/24/solid'

const username = ref('User')
const role = ref('Viewer')
const profileImageUrl = ref('')
const route = useRoute()
const router = useRouter()

function linkClass(path) {
  return [
    'flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition truncate',
    route.path === path
      ? 'bg-green-100 text-green-600'
      : 'text-gray-700 hover:bg-gray-300 hover:text-gray-900'
  ]
}

function mobileLinkClass(path) {
  return [
    'flex flex-col items-center justify-center text-gray-600 transition-transform duration-300',
    route.path === path
      ? 'text-green-600 transform scale-110'
      : 'hover:text-green-600'
  ]
}

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
          profileImageUrl.value = data.profileImageBase64 || data.photoURL || user.photoURL || ''
        }
      })
    }
  })
})

onBeforeUnmount(() => {
  if (unsubscribeUserDoc) unsubscribeUserDoc()
})
</script>
