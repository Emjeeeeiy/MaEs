<template>
  <div>
    <!-- ✅ Desktop Sidebar -->
    <aside
      class="hidden sm:flex sm:flex-col w-64 h-screen bg-gray-200 text-gray-800 shadow-md"
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
          <h3 class="mt-3 text-base font-semibold text-gray-800 hover:underline">
            {{ username }}
          </h3>
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

    <!-- ✅ Simplified Bottom Navigation (Mobile) -->
    <nav
      class="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-300 flex justify-around items-center h-16 z-50"
    >
      <router-link to="/dashboard" :class="mobileLinkClass('/dashboard')">
        <HomeIcon class="w-7 h-7" />
      </router-link>

      <router-link to="/billing" :class="mobileLinkClass('/billing')">
        <ClipboardDocumentCheckIcon class="w-7 h-7" />
      </router-link>

      <router-link to="/payments" :class="mobileLinkClass('/payments')">
        <CreditCardIcon class="w-7 h-7" />
      </router-link>

      <router-link to="/invoices" :class="mobileLinkClass('/invoices')">
        <DocumentTextIcon class="w-7 h-7" />
      </router-link>

      <!-- 🍔 Hamburger Button -->
      <button
        @click="showMenu = true"
        class="text-gray-700 hover:text-green-600 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>

    <!-- ✅ Slide-in Sidebar Menu (Mobile) -->
    <transition name="fade">
      <div
        v-if="showMenu"
        class="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-[60]"
      >
        <div
          class="bg-white w-4/5 h-full shadow-xl flex flex-col py-8 px-6 text-gray-800 animate-slideLeft relative"
        >
          <!-- Close Button -->
          <button
            @click="showMenu = false"
            class="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          >
            ✕
          </button>

          <!-- Profile Section -->
          <div class="flex items-center gap-4 mb-10 mt-8 border-b pb-4">
            <div
              class="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center"
            >
              <img
                v-if="profileImageUrl"
                :src="profileImageUrl"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <div v-else class="text-lg font-bold text-green-600">
                {{ username.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">{{ username }}</h3>
              <p class="text-sm text-gray-500">{{ role }}</p>
            </div>
          </div>

          <!-- Menu Links -->
          <div class="flex flex-col gap-6 text-lg font-medium">
            <router-link
              to="/appointment"
              class="flex items-center gap-3 hover:text-green-600 transition"
              @click="closeMenu"
            >
              <CalendarIcon class="w-6 h-6 text-gray-600" /> Appointments
            </router-link>

            <router-link
              to="/result"
              class="flex items-center gap-3 hover:text-green-600 transition"
              @click="closeMenu"
            >
              <ChartBarIcon class="w-6 h-6 text-gray-600" /> Results
            </router-link>

            <router-link
              to="/profile"
              class="flex items-center gap-3 hover:text-green-600 transition"
              @click="closeMenu"
            >
              <UserCircleIcon class="w-6 h-6 text-gray-600" /> Profile
            </router-link>
          </div>

          <!-- Logout Button -->
          <div class="mt-auto pt-8 border-t">
            <button
              @click="logout"
              class="flex items-center justify-center gap-3 w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
            >
              <ArrowLeftOnRectangleIcon class="w-6 h-6" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
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
  ArrowLeftOnRectangleIcon,
} from '@heroicons/vue/24/solid'

const username = ref('User')
const role = ref('Viewer')
const profileImageUrl = ref('')
const route = useRoute()
const router = useRouter()
const showMenu = ref(false)

function linkClass(path) {
  return [
    'flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition',
    route.path === path
      ? 'bg-green-100 text-green-600'
      : 'text-gray-700 hover:bg-gray-300 hover:text-gray-900'
  ]
}

function mobileLinkClass(path) {
  return [
    'flex flex-col items-center justify-center text-gray-600 transition-transform duration-300',
    route.path === path
      ? 'text-green-600 transform scale-125'
      : 'hover:text-green-600'
  ]
}

const closeMenu = () => {
  showMenu.value = false
}

const logout = async () => {
  const auth = getAuth()
  await signOut(auth)
  router.push('/login')
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

<style>
/* ✅ Animations for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slideLeft {
  animation: slideLeft 0.3s ease-out;
}
</style>
