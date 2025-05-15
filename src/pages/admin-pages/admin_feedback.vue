<template>
  <div class="flex min-h-screen bg-gray-50 text-gray-800">
    <!-- Sidebar -->
    <AdminSidebar class="w-full md:w-64 border-r border-gray-200" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col p-4">
      <h2 class="text-2xl font-bold mb-4">User Feedback</h2>

      <loading_animation v-if="loading" class="flex-1 flex items-center justify-center" />

      <div v-else class="flex flex-col md:flex-row gap-4 flex-1">
        <!-- User List -->
        <div class="w-full md:w-1/3 bg-white border rounded-md p-3 shadow">
          <h3 class="text-lg font-semibold mb-3 border-b pb-2">Users</h3>
          <ul class="space-y-2 overflow-y-auto max-h-[70vh] pr-2">
            <li
              v-for="email in uniqueUserEmails"
              :key="email"
              @click="selectUser(email)"
              :class="[
                'p-3 rounded-md cursor-pointer text-sm',
                selectedEmail === email
                  ? 'bg-green-100 text-green-700 font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              {{ email }}
            </li>
          </ul>
        </div>

        <!-- Chat Box -->
        <div class="w-full md:flex-1 bg-white border rounded-md shadow flex flex-col">
          <!-- Header -->
          <div class="bg-green-600 text-white px-4 py-3 rounded-t-md font-semibold">
            {{ selectedEmail || 'Select a user to view messages' }}
          </div>

          <!-- Messages -->
          <div
            ref="chatContainer"
            class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50"
          >
            <div
              v-for="(msg, index) in filteredMessages"
              :key="index"
              class="flex"
              :class="msg.sender === 'admin' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-xs md:max-w-sm px-4 py-2 rounded-lg shadow"
                :class="msg.sender === 'admin'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-800'"
              >
                <div v-if="msg.imageUrl" class="mb-1">
                  <img :src="msg.imageUrl" class="rounded max-w-full" />
                </div>
                <div v-if="msg.text">{{ msg.text }}</div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <form
            v-if="selectedEmail"
            @submit.prevent="sendResponse"
            class="flex items-center gap-2 border-t px-4 py-3 bg-white rounded-b-md"
          >
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a reply..."
              class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-green-400"
              :disabled="sending"
            />
            <button
              type="submit"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              :disabled="sending || !newMessage.trim()"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import AdminSidebar from '@/components/admin_sidebar.vue'
import loading_animation from '@/components/loading_animation.vue'

const messages = ref([])
const loading = ref(true)
const sending = ref(false)
const selectedEmail = ref(null)
const newMessage = ref('')
const chatContainer = ref(null)

// Fetch messages
onMounted(() => {
  const q = query(collection(db, 'billingFeedback'), orderBy('createdAt', 'asc'))

  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => doc.data())
    loading.value = false

    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  })
})

// Get unique emails
const uniqueUserEmails = computed(() => {
  const emailSet = new Set()
  messages.value.forEach((msg) => {
    if (msg.email) {
      emailSet.add(msg.email)
    }
  })
  return Array.from(emailSet)
})

// Filter messages for selected user
const filteredMessages = computed(() => {
  return selectedEmail.value
    ? messages.value.filter(msg => msg.email === selectedEmail.value)
    : []
})

const selectUser = (email) => {
  selectedEmail.value = email
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendResponse = async () => {
  if (!newMessage.value.trim() || !selectedEmail.value) return

  sending.value = true
  try {
    await addDoc(collection(db, 'billingFeedback'), {
      text: newMessage.value.trim(),
      sender: 'admin',
      email: selectedEmail.value,
      createdAt: serverTimestamp()
    })
    newMessage.value = ''
  } catch (err) {
    console.error('Failed to send:', err)
  } finally {
    sending.value = false
  }
}
</script>
