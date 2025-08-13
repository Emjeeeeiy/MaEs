<template>
  <header class="bg-white shadow-md relative z-10">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        
       <!-- Mobile Sidebar Toggle -->
      <button
        @click="$emit('toggle-sidebar')"
        class="sm:hidden p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        title="Open Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7 transform transition-transform duration-200 hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
          <path stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>


        <!-- Page Title -->
        <div class="font-bold text-green-700 text-lg sm:text-xl md:text-2xl capitalize">
          {{ pageTitle }}
        </div>

        <!-- Topbar Icons -->
        <nav class="flex gap-6 text-gray-700 relative items-center">
          <!-- Feedback -->
          <button @click="showModal = true" title="Feedback">
            <ChatBubbleBottomCenterTextIcon class="w-6 h-6 text-green-600 hover:scale-110 transition" />
          </button>

          <!-- Upload File -->
          <button @click="showDocumentModal = true" title="Upload File">
            <DocumentArrowUpIcon class="w-6 h-6 text-purple-600 hover:scale-110 transition" />
          </button>

          <!-- Notifications -->
          <div class="relative z-50" ref="notifRef">
            <button @click="toggleNotifDropdown" title="Notifications">
              <BellIcon class="w-6 h-6 text-yellow-600 hover:rotate-12 transition" />
              <span
                v-if="notifications.length"
                class="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
              >
                {{ notifications.length }}
              </span>
            </button>

            <div v-if="notifDropdownOpen" class="fixed inset-0 bg-black/30 z-40" @click="notifDropdownOpen = false"></div>

            <transition name="fade">
              <div
                v-if="notifDropdownOpen"
                class="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto border border-gray-200 rounded-md shadow-lg z-50 bg-white"
              >
                <div v-if="!notifications.length" class="text-gray-600 text-sm p-3">No new notifications.</div>
                <div
                  v-for="(notif, index) in notifications"
                  :key="index"
                  class="px-4 py-2 border-b last:border-none text-sm text-gray-700"
                >
                  {{ notif.message }}
                  <span class="block text-xs text-gray-400 mt-1">{{ formatDate(notif.createdAt?.seconds) }}</span>
                </div>
                <div class="text-right px-4 py-2">
                  <button class="text-xs text-red-500 hover:underline" @click="clearNotifications">
                    Clear All
                  </button>
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
                <router-link to="/profile" class="block px-4 py-2 text-gray-700 hover:bg-green-100" @click="closeDropdown">
                  Profile
                </router-link>
                <router-link to="/settings" class="block px-4 py-2 text-gray-700 hover:bg-green-100" @click="closeDropdown">
                  Settings
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
            <button type="button" @click="imageInput.click()" class="text-green-600 hover:underline">Upload Image</button>
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

    <!-- Document Upload Modal -->
    <div v-if="showDocumentModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div class="bg-white text-gray-800 rounded-lg w-full max-w-lg shadow-lg p-6">
        <h2 class="text-xl font-bold mb-4">Upload Financial Document</h2>
        <form class="space-y-4">
          <input type="file" class="w-full border rounded px-3 py-2 text-sm" />
          <textarea placeholder="Optional description..." class="w-full border rounded px-3 py-2 text-sm"></textarea>
          <div class="flex justify-end gap-3">
            <button type="button" @click="showDocumentModal = false" class="text-gray-600 hover:underline">Cancel</button>
            <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Upload</button>
          </div>
        </form>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
  DocumentArrowUpIcon
} from '@heroicons/vue/24/outline'
import { getAuth, signOut } from 'firebase/auth'
import { db, storage } from '@/firebase'
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage'

const auth = getAuth()
const router = useRouter()
const route = useRoute()
const user = auth.currentUser
const userEmail = user?.email || ''

const dropdownOpen = ref(false)
const notifDropdownOpen = ref(false)
const profileDropdownRef = ref(null)
const notifRef = ref(null)

const showModal = ref(false)
const showDocumentModal = ref(false)

const newMessage = ref('')
const imageFile = ref(null)
const imageInput = ref(null)
const loading = ref(false)
const notifications = ref([])

const toggleDropdown = () => dropdownOpen.value = !dropdownOpen.value
const closeDropdown = () => dropdownOpen.value = false
const toggleNotifDropdown = () => notifDropdownOpen.value = !notifDropdownOpen.value

const pageTitle = computed(() => {
  const routeMap = {
    '/dashboard': 'Dashboard',
    '/payments': 'Payments',
    '/billing': 'Billing',
    '/invoices': 'Invoices',
    '/settings': 'Settings',
    '/profile': 'Profile',
    '/report': 'Report',
    '/edit_profile': 'Edit Profile',
    '/appointment': 'Appointment',
    '/result': 'Result'
  }
  return routeMap[route.path] || 'Page'
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    closeDropdown()
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

const handleClickOutside = (e) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    notifDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  if (userEmail) {
    const notifQuery = query(
      collection(db, 'notifications'),
      where('userEmail', '==', userEmail),
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

const clearNotifications = async () => {
  try {
    const snapshot = await getDocs(query(collection(db, 'notifications'), where('userEmail', '==', userEmail)))
    const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletions)
    notifDropdownOpen.value = false
  } catch (err) {
    console.error('Error clearing notifications:', err)
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
