<template>
  <div>
    <!-- Mobile overlay -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 sm:hidden"
      @click="$emit('close-sidebar')"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed sm:static top-0 left-0 h-screen w-64 bg-gray-200 text-gray-800 z-50 flex flex-col shadow-md transition-transform duration-300',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      ]"
    >
      <!-- Profile -->
      <div class="flex-1 overflow-y-auto">
        <router-link
          to="/profile"
          class="block px-6 py-6 border-b border-gray-300 text-center hover:bg-gray-300 transition"
        >
          <div
            class="mx-auto w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center shadow transform transition-all duration-500 hover:scale-110 hover:rotate-3 -ml-2"
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
          <h3 class="mt-3 text-base font-semibold text-gray-800 hover:underline">{{ username }}</h3>
          <p class="text-sm text-gray-500">{{ role }}</p>
        </router-link>

        <!-- Navigation Links -->
        <nav class="px-4 py-6 space-y-4">
          <!-- MAIN -->
          <div>
            <p class="px-2 mb-2 text-xs text-gray-500 uppercase tracking-wide">Main</p>
            <router-link to="/dashboard" :class="linkClass('/dashboard')">
              <HomeIcon class="w-5 h-5 text-gray-600" />
              Dashboard
            </router-link>
          </div>

          <!-- PROCESS -->
          <div>
            <p class="px-2 mb-2 text-xs text-gray-500 uppercase tracking-wide">Process</p>
            <router-link to="/billing" :class="linkClass('/billing')">
              <ClipboardDocumentCheckIcon class="w-5 h-5 text-gray-600" />
              Billing
            </router-link>
            <router-link to="/payments" :class="linkClass('/payments')">
              <CreditCardIcon class="w-5 h-5 text-gray-600" />
              Payments
            </router-link>
          </div>

          <!-- INFORMATION -->
          <div>
            <p class="px-2 mb-2 text-xs text-gray-500 uppercase tracking-wide">Information</p>
            <router-link to="/invoices" :class="linkClass('/invoices')">
              <DocumentTextIcon class="w-5 h-5 text-gray-600" />
              Invoices
            </router-link>
          </div>

          <!-- OTHER -->
          <div>
            <p class="px-2 mb-2 text-xs text-gray-500 uppercase tracking-wide">Other</p>
            <router-link to="/appointment" :class="linkClass('/appointment')">
              <CalendarIcon class="w-5 h-5 text-gray-600" />
              Appointments
            </router-link>
            <router-link to="/result" :class="linkClass('/result')">
              <ChartBarIcon class="w-5 h-5 text-gray-600" />
              Result
            </router-link>
          </div>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
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
} from '@heroicons/vue/24/solid'

const props = defineProps({
  isMobileSidebarOpen: Boolean
})

const emit = defineEmits(['close-sidebar'])

const username = ref('User')
const role = ref('Viewer')
const profileImageUrl = ref('')
const route = useRoute()

function linkClass(path) {
  return [
    'flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition',
    route.path === path
      ? 'bg-green-100 text-green-600'
      : 'text-gray-700 hover:bg-gray-300 hover:text-gray-900'
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
