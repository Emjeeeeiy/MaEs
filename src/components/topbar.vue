<template>
  <header class="bg-white shadow-md relative z-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="text-xl font-bold text-green-700">Dashboard</div>

        <!-- Icons -->
        <nav class="flex gap-6 text-gray-700 relative items-center">
          <!-- Feedback -->
          <button @click="showModal = true" title="Feedback">
            <ChatBubbleBottomCenterTextIcon class="w-6 h-6 text-green-600 hover:scale-110 transition" />
          </button>

          <!-- Notifications -->
          <div class="relative z-50" ref="notifRef">
            <button @click="toggleNotifDropdown" class="relative focus:outline-none" title="Notifications">
              <BellIcon class="w-6 h-6 text-yellow-600 hover:rotate-12 transition" />
              <span
                v-if="notifications.length > 0"
                class="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
              >
                {{ notifications.length }}
              </span>
            </button>

            <!-- Blurred Background -->
            <div
              v-if="notifDropdownOpen"
              class="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
              @click="notifDropdownOpen = false"
            ></div>

            <!-- Dropdown -->
            <transition name="fade">
              <div
                v-if="notifDropdownOpen"
                class="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto border border-gray-200 rounded-md shadow-lg z-50 bg-white/90 backdrop-blur-sm"
              >
                <div v-if="notifications.length === 0" class="text-gray-600 text-sm p-3">No new notifications.</div>
                <div
                  v-for="(notif, index) in notifications"
                  :key="index"
                  class="px-4 py-2 border-b last:border-none text-sm text-gray-700"
                >
                  {{ notif.text }}
                  <span class="block text-xs text-gray-400 mt-1">{{ formatDate(notif.createdAt?.seconds) }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Profile -->
          <div class="relative" ref="profileDropdownRef">
            <button @click="toggleDropdown" title="Profile">
              <UserIcon class="w-6 h-6 text-blue-600 hover:scale-110 transition" />
            </button>

            <transition name="fade">
              <div
                v-if="dropdownOpen"
                class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-green-100"
                  @click="closeDropdown"
                >
                  Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-100"
                >
                  Logout
                </button>
              </div>
            </transition>
          </div>

          <!-- Settings -->
          <!-- <router-link to="/settings" title="Settings">
            <Cog6ToothIcon class="w-6 h-6 text-gray-700 hover:rotate-180 transition" />
          </router-link> -->
        </nav>
      </div>
    </div>

    <!-- Feedback Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div class="bg-white text-gray-800 rounded-lg w-full max-w-lg shadow-lg p-6">
        <h2 class="text-xl font-bold mb-4">Send Feedback</h2>
        <form @submit.prevent="sendFeedback" class="space-y-4">
          <textarea
            v-model="newMessage"
            rows="3"
            placeholder="Your message..."
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 bg-white"
          ></textarea>

          <div class="flex items-center gap-3">
            <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
            <button type="button" @click="imageInput.click()" class="text-green-600 hover:underline">
              Upload Image
            </button>
            <span v-if="imageFile?.name" class="text-sm text-gray-500">{{ imageFile.name }}</span>
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="text-gray-600 hover:underline">Cancel</button>
            <button
              type="submit"
              :disabled="loading || (!newMessage && !imageFile)"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  BellIcon
} from '@heroicons/vue/24/outline'
import { db, storage } from '@/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage'
import { getAuth, signOut } from 'firebase/auth'

const router = useRouter()
const auth = getAuth()
const user = auth.currentUser
const userEmail = user?.email || ''

const dropdownOpen = ref(false)
const notifDropdownOpen = ref(false)
const profileDropdownRef = ref(null)
const notifRef = ref(null)

const showModal = ref(false)
const newMessage = ref('')
const imageFile = ref(null)
const imageInput = ref(null)
const loading = ref(false)
const notifications = ref([])

const toggleDropdown = () => dropdownOpen.value = !dropdownOpen.value
const closeDropdown = () => dropdownOpen.value = false
const toggleNotifDropdown = () => notifDropdownOpen.value = !notifDropdownOpen.value

const handleLogout = async () => {
  try {
    await signOut(auth)
    closeDropdown()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleClickOutside = (event) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
  if (notifRef.value && !notifRef.value.contains(event.target)) {
    notifDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  if (userEmail) {
    const notifQuery = query(
      collection(db, 'notifications'),
      where('email', '==', userEmail),
      orderBy('createdAt', 'desc')
    )
    onSnapshot(notifQuery, (snapshot) => {
      notifications.value = snapshot.docs.map(doc => doc.data())
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    imageFile.value = file
  }
}

const sendFeedback = async () => {
  if (!user) return alert('Please log in first.')
  if (!newMessage.value && !imageFile.value) return

  loading.value = true
  let imageUrl = null

  try {
    if (imageFile.value) {
      const fileRef = storageRef(storage, `billingFeedbackImages/${Date.now()}-${imageFile.value.name}`)
      await uploadBytes(fileRef, imageFile.value)
      imageUrl = await getDownloadURL(fileRef)
    }

    await addDoc(collection(db, 'billingFeedback'), {
      text: newMessage.value,
      imageUrl,
      email: userEmail,
      sender: 'user',
      createdAt: serverTimestamp()
    })

    newMessage.value = ''
    imageFile.value = null
    imageInput.value.value = ''
    showModal.value = false
  } catch (err) {
    console.error('Feedback send error:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
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
