<template>
  <div class="flex min-h-screen bg-gray-50 text-gray-800">
    <Sidebar class="w-full lg:w-64 border-r border-gray-200" />

    <div class="flex-1 flex flex-col">
      <Topbar class="sticky top-0 z-10 bg-white shadow-sm" />

      <main class="flex-1 p-6 flex flex-col items-center">
        <div class="w-full max-w-2xl bg-white rounded-xl shadow-md flex flex-col h-[500px] overflow-hidden border border-black">
          <div class="bg-green-600 text-white text-lg font-semibold px-6 py-3">
            Billing Feedback
          </div>

          <div
            ref="chatContainer"
            class="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50"
          >
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="flex"
              :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div class="relative max-w-xs px-4 py-2 rounded-lg"
                :class="msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'"
              >
                <div v-if="msg.imageUrl">
                  <img :src="msg.imageUrl" alt="Sent image" class="max-w-full rounded mb-1" />
                </div>
                <div v-if="msg.text">{{ msg.text }}</div>

                <button
                  class="absolute -bottom-5 right-0 text-xs text-gray-500 hover:text-green-600"
                  @click="toggleReaction(index)"
                >
                  {{ msg.reaction === '👍' ? '👍' : '👍' }}
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="sendMessage" class="flex items-center border-t px-4 py-3 gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type your message..."
              class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-green-400"
              :disabled="loading"
            />
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
            />
            <button
              type="button"
              @click="triggerImageUpload"
              class="text-green-600 hover:text-green-800"
              title="Send Image"
            >
              📷
            </button>
            <button
              type="submit"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              :disabled="loading || (!newMessage.trim() && !imageFile)"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getAuth } from 'firebase/auth'
import { db, storage } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/Topbar.vue'

const newMessage = ref('')
const messages = ref([])
const loading = ref(false)
const chatContainer = ref(null)
const imageFile = ref(null)
const imageInput = ref(null)

const auth = getAuth()
const user = auth.currentUser
const userEmail = ref(user?.email || '')

const triggerImageUpload = () => imageInput.value.click()

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file
  }
}

const sendMessage = async () => {
  if (!user) return alert('You must be logged in.')

  const text = newMessage.value.trim()
  const file = imageFile.value

  if (!text && !file) return

  loading.value = true
  let imageUrl = null

  try {
    if (file) {
      const fileRef = storageRef(storage, `billingFeedbackImages/${Date.now()}-${file.name}`)
      await uploadBytes(fileRef, file)
      imageUrl = await getDownloadURL(fileRef)
    }

    await addDoc(collection(db, 'billingFeedback'), {
      text: text || '',
      sender: 'user',
      email: user.email,
      imageUrl,
      reaction: null,
      createdAt: serverTimestamp()
    })

    newMessage.value = ''
    imageFile.value = null
    imageInput.value.value = ''
  } catch (err) {
    console.error('Send Error:', err)
  } finally {
    loading.value = false
  }
}

const toggleReaction = async (index) => {
  const msg = messages.value[index]
  const q = query(
    collection(db, 'billingFeedback'),
    where('createdAt', '==', msg.createdAt),
    where('email', '==', user.email),
    where('text', '==', msg.text || ''),
  )

  const snapshot = await getDocs(q)
  snapshot.forEach(async (docSnap) => {
    const docRef = doc(db, 'billingFeedback', docSnap.id)
    await updateDoc(docRef, {
      reaction: msg.reaction === '👍' ? null : '👍'
    })
  })
}

onMounted(() => {
  if (!user) return

  const q = query(
    collection(db, 'billingFeedback'),
    where('email', '==', user.email),
    orderBy('createdAt', 'asc')
  )

  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id
    }))
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  })
})
</script>
