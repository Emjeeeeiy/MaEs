<template>
  <div class="flex min-h-screen bg-white text-gray-800">
    <!-- Sidebar -->
    <AdminSidebar class="w-full md:w-64 border-r border-gray-200" />

    <!-- Main Content -->
    <div class="flex-1 p-6">
      <h2 class="text-xl font-semibold mb-6">User Feedback Viewer</h2>

      <!-- User Selector -->
      <div class="mb-6 max-w-sm">
        <label for="user" class="block text-sm font-medium mb-1">Select a user</label>
        <select
          id="user"
          v-model="selectedEmail"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="" disabled>Select user email</option>
          <option v-for="email in uniqueUserEmails" :key="email" :value="email">
            {{ email }}
          </option>
        </select>
      </div>

      <!-- Feedback Card -->
      <loading_animation v-if="loading" class="mt-10" />
      <div v-else>
        <div
          v-if="filteredMessages.length"
          class="max-w-4xl bg-gray-50 border border-gray-300 rounded-lg p-6 shadow-md max-h-[500px] overflow-y-auto"
        >
          <div
            v-for="(msg, index) in filteredMessages"
            :key="msg.id"
            class="mb-6 border-b border-gray-300 pb-4 last:border-b-0 last:pb-0"
          >
            <div v-if="msg.text" class="text-base mb-3 whitespace-pre-wrap">
              {{ msg.text }}
            </div>
            <div v-if="msg.imageUrl" class="mb-3">
              <img :src="msg.imageUrl" class="rounded max-w-xs border" />
            </div>
            <p class="text-xs text-gray-500">
              {{ msg.sender }} · {{ formatDate(msg.createdAt) }}
            </p>

            <!-- Delete Button -->
            <button
              @click="deleteMessage(msg.id)"
              class="mt-2 text-red-600 text-xs hover:underline"
            >
              Delete
            </button>
          </div>
        </div>

        <div v-else-if="selectedEmail" class="text-gray-500 text-sm mt-4">
          No feedback found for this user.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/firebase'
import AdminSidebar from '@/components/admin_sidebar.vue'
import loading_animation from '@/components/loading_animation.vue'

const messages = ref([])
const selectedEmail = ref('')
const loading = ref(true)

onMounted(() => {
  const q = query(collection(db, 'billingFeedback'), orderBy('createdAt', 'asc'))
  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  })
})

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

const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return ''
  return new Date(timestamp.seconds * 1000).toLocaleString()
}

const deleteMessage = async (id) => {
  if (confirm('Are you sure you want to delete this message?')) {
    try {
      await deleteDoc(doc(db, 'billingFeedback', id))
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }
}
</script>
