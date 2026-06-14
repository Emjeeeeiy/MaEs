<template>
  <div class="flex h-screen bg-gray-50 dark:bg-[#121212] font-sans antialiased overflow-hidden">
    <!-- Mobile Sidebar Backdrop -->
    <transition name="fade">
      <div 
        v-if="isMobileMenuOpen" 
        @click="isMobileMenuOpen = false"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
      ></div>
    </transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo Section -->
        <div class="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
               <img src="/MaEs_logo.png" class="w-6 h-6 object-contain brightness-0 invert" alt="Logo" />
            </div>
            <span class="font-bold text-lg tracking-tight text-gray-800 dark:text-white">Admin Panel</span>
          </div>
        </div>

        <!-- User Profile (Sidebar) -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1a1a1a]/50">
          <div class="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm ring-4 ring-green-50 dark:ring-green-900/10">
              {{ role ? role.charAt(0).toUpperCase() : 'A' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-800 dark:text-gray-100 truncate">Administrator</p>
              <p class="text-[10px] text-gray-400 truncate">{{ role }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Section -->
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          <div v-for="(group, gIdx) in navigationGroups" :key="gIdx">
            <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-4">{{ group.title }}</h3>
            <ul class="space-y-1">
              <li v-for="item in group.items" :key="item.path">
                <RouterLink
                  :to="item.path"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item relative overflow-hidden"
                  :class="[
                    $route.path === item.path 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-500/30 font-semibold' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/10 hover:text-green-600 dark:hover:text-green-400'
                  ]"
                >
                  <component :is="item.icon" class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover/item:scale-110" />
                  <span class="text-sm">{{ item.name }}</span>
                  
                  <!-- Active Indicator -->
                  <div v-if="$route.path === item.path" class="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                </RouterLink>
              </li>
            </ul>
          </div>
        </nav>

        <!-- Footer / Support -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-800">
          <button 
            @click="logout"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-sm"
          >
            <LogOutIcon class="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
      <!-- Topbar -->
      <header class="h-16 shrink-0 z-40 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0">
        <div class="w-full h-full px-4 sm:px-6 flex justify-between items-center">
          
          <!-- Page Title & Mobile Toggle -->
          <div class="flex items-center gap-4">
            <button 
              @click="isMobileMenuOpen = true"
              class="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MenuIcon class="w-6 h-6" />
            </button>
            <h1 class="font-bold text-gray-800 dark:text-white text-lg md:text-xl tracking-tight">
              {{ pageTitle }}
            </h1>
          </div>

          <!-- Topbar Actions -->
          <div class="flex items-center gap-2 sm:gap-4">
            <!-- Notifications -->
            <div class="relative" ref="notifRef">
              <button 
                @click="toggleNotifDropdown" 
                class="p-2.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-all duration-200 relative group"
                title="Notifications"
              >
                <BellIcon class="w-5 h-5" />
                <span
                  v-if="notifications.length"
                  class="absolute top-2 right-2 flex h-2 w-2"
                >
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </button>

              <transition name="pop-over">
                <div
                  v-if="notifDropdownOpen"
                  class="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden rounded-2xl z-50 bg-white dark:bg-[#252525] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 ring-1 ring-black/5"
                >
                  <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#1e1e1e]/50">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                      <span v-if="notifications.length" class="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full">{{ notifications.length }} Today</span>
                    </div>
                    <button 
                      v-if="notifications.length"
                      class="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 font-bold transition-colors" 
                      @click="clearAllNotifications"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <div class="overflow-y-auto max-h-128 custom-scrollbar">
                    <div v-if="!notifications.length" class="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div class="w-14 h-14 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center mb-3">
                        <BellIcon class="w-7 h-7 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p class="text-sm font-bold text-gray-500 dark:text-gray-400">All caught up!</p>
                      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">No new activity reported today.</p>
                    </div>
                    
                    <div
                      v-for="(n, i) in notifications"
                      :key="n.id"
                      @click="handleNotifClick(n, i)"
                      class="px-4 py-3.5 border-b border-gray-100 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer relative"
                    >
                      <div class="flex gap-3.5">
                        <div 
                          class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          :class="getNotifCategory(n.id).bg"
                        >
                          <component :is="getNotifCategory(n.id).icon" class="w-5 h-5" :class="getNotifCategory(n.id).text" />
                        </div>

                        <div class="flex-1 min-w-0 pr-2">
                          <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                            {{ n.text }}
                          </p>
                          <div class="flex items-center gap-1.5 mt-2">
                            <ClockIcon class="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                            <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{{ formatDate(n.createdAt?.seconds) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

            <!-- Profile Dropdown (Simplified for Header) -->
            <div class="flex items-center gap-3 pl-2">
               <div class="hidden sm:block text-right">
                  <p class="text-xs font-bold text-gray-800 dark:text-gray-100">Administrator</p>
                  <p class="text-[10px] text-green-600 dark:text-green-400 font-medium">Online</p>
               </div>
               <div class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden">
                  <div class="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-sm">
                    A
                  </div>
               </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Scrollable Content Area -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
        <!-- Breadcrumbs (Optional but adds professional touch) -->
        <div class="mb-6 flex items-center gap-2 text-xs font-medium text-gray-400">
           <span>Admin</span>
           <ChevronRightIcon class="w-3 h-3" />
           <span class="text-green-600 dark:text-green-400">{{ pageTitle }}</span>
        </div>

        <div class="max-w-7xl mx-auto">
          <slot />
        </div>

        <!-- Footer Spacer for Mobile -->
        <div class="h-10 lg:hidden"></div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { BellIcon, ClockIcon, ChevronRightIcon, Bars3Icon as MenuIcon } from '@heroicons/vue/24/outline'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings as SettingsIcon,
  Calendar,
  BarChart,
  MessageSquare,
  Wrench,
  LogOutIcon,
  CreditCard,
  UserCheck
} from 'lucide-vue-next'
import { db, auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { useNotifications } from '@/composables/useNotifications'

// UI State
const isMobileMenuOpen = ref(false)
const notifDropdownOpen = ref(false)
const notifRef = ref(null)
const role = "Administrator"

const navigationGroups = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
      { name: 'Users', path: '/admin-management', icon: Users },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Invoices', path: '/admin-invoices', icon: FileText },
      { name: 'Services', path: '/admin-services', icon: Wrench },
    ]
  },
  {
    title: 'Activities',
    items: [
      { name: 'Appointments', path: '/admin-appointment', icon: Calendar },
      { name: 'Results', path: '/admin-result', icon: BarChart },
      { name: 'RFA', path: '/admin-rfa', icon: MessageSquare },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { name: 'Settings', path: '/admin-settings', icon: SettingsIcon },
    ]
  }
]

// 🔒 Logout Function
const router = useRouter()
const { success: notifySuccess } = useNotifications()

const logout = async () => {
  try {
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        onlineStatus: 'offline',
        lastActive: serverTimestamp()
      })
    }
    await signOut(auth)
    notifySuccess('Logged out successfully.')
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Notifications Logic
const READ_KEY = 'readNotifIds'
const readIds = ref(new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')))
const saveReadIds = () => localStorage.setItem(READ_KEY, JSON.stringify([...readIds.value]))

const now = new Date()
const tsStart = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0))
const tsEnd = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59))

const route = useRoute()
const notifications = ref([])
const invoiceStatus = new Map()

const toggleNotifDropdown = () => (notifDropdownOpen.value = !notifDropdownOpen.value)
const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) notifDropdownOpen.value = false
}

const handleNotifClick = (notif, index) => {
  readIds.value.add(notif.id)
  saveReadIds()
  notifications.value.splice(index, 1)
  router.push(notif.link)
  notifDropdownOpen.value = false
}

const clearAllNotifications = () => {
  notifications.value.forEach((n) => readIds.value.add(n.id))
  saveReadIds()
  notifications.value = []
}

const formatDate = (s) => {
  if (!s) return ''
  const date = new Date(s * 1000)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getNotifCategory = (id) => {
  if (id.includes('invoice') || id.includes('payment')) {
    return { icon: CreditCard, bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }
  }
  if (id.includes('user')) {
    return { icon: UserCheck, bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' }
  }
  if (id.includes('appointment')) {
    return { icon: Calendar, bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' }
  }
  return { icon: BellIcon, bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' }
}

const updateNotifList = (incoming) => {
  const fresh = incoming.filter((n) => !readIds.value.has(n.id))
  const merged = [
    ...notifications.value.filter((o) => !fresh.some((n) => n.id === o.id)),
    ...fresh
  ]
  notifications.value = merged.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

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

const pageTitle = computed(() => {
  const routeMap = {
    '/admin-dashboard': 'Admin Dashboard',
    '/admin-invoices': 'Invoice Management',
    '/admin-management': 'User Management',
    '/admin-services': 'Service Management',
    '/admin-rfa': 'Request for Assistance',
    '/admin-appointment': 'Appointments',
    '/admin-result': 'Results',
    '/admin-settings': 'Admin Settings'
  }
  return routeMap[route.path] || 'Admin Panel'
})
</script>

<style scoped>
/* Transitions */
.pop-over-enter-active,
.pop-over-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.pop-over-enter-from,
.pop-over-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #374151;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
