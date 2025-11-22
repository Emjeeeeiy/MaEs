<template>
  <header
    class="bg-[#1a1a1a] border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow"
  >
    <!-- ✅ Page Title -->
    <h1 class="text-xl font-bold text-green-400">{{ pageTitle }}</h1>

    <div class="flex items-center gap-6">
      <!-- ✅ Notifications -->
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

        <transition name="fade">
          <div
            v-if="notifDropdownOpen"
            class="absolute right-0 mt-2 w-72 max-h-72 overflow-y-auto border border-gray-600 rounded-md shadow-lg bg-[#2a2a2a] z-50"
          >
            <div
              v-if="notifications.length"
              class="flex justify-between items-center px-4 py-2 border-b border-gray-700 text-xs text-gray-400 bg-[#1e1e1e]"
            >
              <span>Notifications (today)</span>
              <button @click="clearAllNotifications" class="hover:text-red-400 transition">
                🗑️ Clear All
              </button>
            </div>

            <div v-if="!notifications.length" class="text-gray-400 text-sm p-3">
              No notifications.
            </div>

            <div
              v-for="(n, i) in notifications"
              :key="n.id"
              class="px-4 py-2 border-b border-gray-700 last:border-none text-sm text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              @click="handleNotifClick(n, i)"
            >
              <div class="font-medium">{{ n.text }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(n.createdAt?.seconds) }}</div>
            </div>
          </div>
        </transition>
      </div>

      <!-- ✅ Logout Button -->
      <button
        @click="logout"
        class="flex items-center gap-2 bg-[#2a2a2a] hover:bg-red-600 text-gray-200 hover:text-white px-4 py-2 rounded-md transition duration-200 border border-gray-700 hover:shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
          />
        </svg>
        <span class="text-sm font-medium">Logout</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BellIcon } from '@heroicons/vue/24/solid'
import { db } from '@/firebase'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'

// 🔒 Logout Function
const router = useRouter()
const logout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// LocalStorage for read tracking
const READ_KEY = 'readNotifIds'
const readIds = ref(new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')))
const saveReadIds = () => localStorage.setItem(READ_KEY, JSON.stringify([...readIds.value]))

// Today's date range
const now = new Date()
const tsStart = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0))
const tsEnd = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59))

// State
const route = useRoute()
const notifDropdownOpen = ref(false)
const notifications = ref([])
const notifRef = ref(null)
const invoiceStatus = new Map()

// UI actions
const toggleNotifDropdown = () => (notifDropdownOpen.value = !notifDropdownOpen.value)
const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) notifDropdownOpen.value = false
}
const handleNotifClick = (notif, index) => {
  readIds.value.add(notif.id)
  saveReadIds()
  notifications.value.splice(index, 1)
  router.push(notif.link)
}
const clearAllNotifications = () => {
  notifications.value.forEach((n) => readIds.value.add(n.id))
  saveReadIds()
  notifications.value = []
}
const formatDate = (s) => (s ? new Date(s * 1000).toLocaleString() : '')

const updateNotifList = (incoming) => {
  const fresh = incoming.filter((n) => !readIds.value.has(n.id))
  const merged = [
    ...notifications.value.filter((o) => !fresh.some((n) => n.id === o.id)),
    ...fresh
  ]
  notifications.value = merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

// Realtime listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Invoice Notifications
  const invQ = query(
    collection(db, 'invoices'),
    where('createdAt', '>=', tsStart),
    where('createdAt', '<=', tsEnd),
    orderBy('createdAt', 'desc')
  )
  const unsubInv = onSnapshot(invQ, (snap) => {
    const list = []
    snap.docChanges().forEach((change) => {
      const d = change.doc.data()
      const id = change.doc.id
      const prev = invoiceStatus.get(id)
      const curr = d.status
      invoiceStatus.set(id, curr)

      if (change.type === 'added') {
        list.push({
          id: `${id}_invoice`,
          text: `New Invoice from ${d.email || 'a patient'}`,
          createdAt: d.createdAt,
          link: '/admin-invoices'
        })
      }

      if (
        change.type === 'modified' &&
        prev?.toLowerCase() !== 'pending' &&
        curr?.toLowerCase() === 'pending'
      ) {
        list.push({
          id: `${id}_payment`,
          text: `Payment submitted by ${d.email || 'a patient'}`,
          createdAt: Timestamp.now(),
          link: '/admin-invoices'
        })
      }
    })
    if (list.length) updateNotifList(list)
  })

  // New Users
  const userQ = query(
    collection(db, 'users'),
    where('createdAt', '>=', tsStart),
    where('createdAt', '<=', tsEnd),
    orderBy('createdAt', 'desc')
  )
  const unsubUser = onSnapshot(userQ, (snap) => {
    const items = snap.docs.map((doc) => ({
      id: `${doc.id}_user`,
      text: `New account: ${doc.data().email || 'Unknown'}`,
      createdAt: doc.data().createdAt,
      link: '/admin-management'
    }))
    updateNotifList(items)
  })

  // New Appointments
  const apptQ = query(
    collection(db, 'appointments'),
    where('createdAt', '>=', tsStart),
    where('createdAt', '<=', tsEnd),
    orderBy('createdAt', 'desc')
  )
  const unsubAppt = onSnapshot(apptQ, (snap) => {
    const items = snap.docs.map((doc) => ({
      id: `${doc.id}_appointment`,
      text: `New appointment – ${doc.data().department || 'Dept.'}`,
      createdAt: doc.data().createdAt,
      link: '/admin-appointment'
    }))
    updateNotifList(items)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    unsubInv()
    unsubUser()
    unsubAppt()
  })
})

// Page Title
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
      return 'Request for Assistance'
    case '/admin-appointment':
      return 'Appointments'
    case '/admin-result':
      return 'Results'
    default:
      return 'Admin Panel'
  }
})
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
