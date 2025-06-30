<template>
  <header class="bg-[#1a1a1a] border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow">
    <!-- Page Title -->
    <h1 class="text-xl font-bold text-green-400">
      {{ pageTitle }}
    </h1>

    <!-- Right Side Icons (Notifications, etc.) -->
    <div class="flex items-center gap-6">
      <!-- Notification Bell -->
      <div class="relative" ref="notifRef">
        <button @click="toggleNotifDropdown" class="relative" title="Notifications">
          <BellIcon class="w-6 h-6 text-yellow-400 hover:rotate-12 transition duration-200" />
          <span
            v-if="notifications.length"
            class="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
          >
            {{ notifications.length }}
          </span>
        </button>

        <!-- Notification Dropdown -->
        <transition name="fade">
          <div
            v-if="notifDropdownOpen"
            class="absolute right-0 mt-2 w-64 max-h-64 overflow-y-auto border border-gray-600 rounded-md shadow-lg bg-[#2a2a2a] z-50"
          >
            <div v-if="!notifications.length" class="text-gray-400 text-sm p-3">No notifications.</div>
            <div
              v-for="(notif, i) in notifications"
              :key="i"
              class="px-4 py-2 border-b border-gray-700 last:border-none text-sm text-gray-300"
            >
              {{ notif.text }}
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(notif.createdAt?.seconds) }}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { BellIcon } from '@heroicons/vue/24/solid'
import { db } from '@/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'

const route = useRoute()
const notifDropdownOpen = ref(false)
const notifications = ref([])
const notifRef = ref(null)

// Detect clicks outside of the notification dropdown
const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    notifDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  onSnapshot(notifQuery, (snap) => {
    notifications.value = snap.docs.map((doc) => doc.data())
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleNotifDropdown = () => {
  notifDropdownOpen.value = !notifDropdownOpen.value
}

// Dynamic page title based on route path
const pageTitle = computed(() => {
  switch (route.path) {
    case '/admin-dashboard':
      return 'Admin Dashboard'
    case '/admin-invoices':
      return 'Invoice Management'
    case '/admin-management':
      return 'User Management'
    case '/admin-services':
      return 'Service Management'
    case '/admin-rfa':
      return 'RFA Monitoring'
    case '/admin-appointment':
      return 'Appointments'
    case '/admin-result':
      return 'Results'
    default:
      return 'Admin Panel'
  }
})

const formatDate = (sec) => {
  if (!sec) return ''
  return new Date(sec * 1000).toLocaleString()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
