<template>
  <header class="bg-white shadow px-6 py-4 flex justify-between items-center">
    <h1 class="text-xl font-bold text-green-700">Admin Panel</h1>

    <div class="flex items-center gap-6">
      <!-- Feedback Icon -->
      <button @click="showFeedbackModal = true" title="User Feedback">
        <ChatBubbleBottomCenterTextIcon class="w-6 h-6 text-green-600 hover:scale-110 transition" />
      </button>

      <!-- Notification Icon -->
      <div class="relative" ref="notifRef">
        <button @click="toggleNotifDropdown" class="relative" title="Notifications">
          <BellIcon class="w-6 h-6 text-yellow-600 hover:rotate-12 transition" />
          <span
            v-if="notifications.length"
            class="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
          >
            {{ notifications.length }}
          </span>
        </button>

        <!-- Dropdown -->
        <transition name="fade">
          <div
            v-if="notifDropdownOpen"
            class="absolute right-0 mt-2 w-64 max-h-64 overflow-y-auto border border-gray-200 rounded-md shadow-lg bg-white z-50"
          >
            <div v-if="!notifications.length" class="text-gray-600 text-sm p-3">No notifications.</div>
            <div
              v-for="(notif, i) in notifications"
              :key="i"
              class="px-4 py-2 border-b last:border-none text-sm text-gray-700"
            >
              {{ notif.text }}
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(notif.createdAt?.seconds) }}</div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Feedback Modal -->
    <div v-if="showFeedbackModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div class="bg-white rounded-xl max-w-3xl w-full p-6 shadow-md text-gray-800">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">User Feedback</h2>
          <button @click="showFeedbackModal = false" class="text-gray-500 hover:text-red-500 text-sm">Close</button>
        </div>

        <!-- User Selector -->
        <div class="mb-4 max-w-xs">
          <label class="block text-sm font-medium mb-1">Select User</label>
          <select v-model="selectedEmail" class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="" disabled>Select email</option>
            <option v-for="email in uniqueUserEmails" :key="email" :value="email">
              {{ email }}
            </option>
          </select>
        </div>

        <!-- Feedback Content -->
        <div v-if="filteredMessages.length" class="space-y-4 max-h-80 overflow-y-auto border rounded-md p-4 bg-gray-50">
          <div
            v-for="msg in filteredMessages"
            :key="msg.id"
            class="border-b last:border-b-0 pb-3"
          >
            <p v-if="msg.text" class="mb-1">{{ msg.text }}</p>
            <img v-if="msg.imageUrl" :src="msg.imageUrl" class="rounded max-w-xs mb-1 border" />
            <p class="text-xs text-gray-500">{{ msg.sender }} · {{ formatDate(msg.createdAt?.seconds) }}</p>
          </div>
        </div>
        <p v-else-if="selectedEmail" class="text-sm text-gray-500 mt-4">No feedback found for this user.</p>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { BellIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/solid'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'

const showFeedbackModal = ref(false)
const notifDropdownOpen = ref(false)
const notifications = ref([])
const messages = ref([])
const selectedEmail = ref('')
const notifRef = ref(null)

// Watch for outside clicks
const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    notifDropdownOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // Fetch notifications (for admin)
  const notifQuery = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
  onSnapshot(notifQuery, (snap) => {
    notifications.value = snap.docs.map((doc) => doc.data())
  })

  // Fetch feedback
  const feedbackQuery = query(collection(db, 'billingFeedback'), orderBy('createdAt', 'asc'))
  onSnapshot(feedbackQuery, (snap) => {
    messages.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleNotifDropdown = () => {
  notifDropdownOpen.value = !notifDropdownOpen.value
}

const uniqueUserEmails = computed(() => {
  const set = new Set()
  messages.value.forEach(msg => {
    if (msg.email) set.add(msg.email)
  })
  return Array.from(set)
})

const filteredMessages = computed(() => {
  return selectedEmail.value
    ? messages.value.filter(msg => msg.email === selectedEmail.value)
    : []
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
