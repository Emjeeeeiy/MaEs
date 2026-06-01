<template>
  <div class="flex flex-col h-screen bg-white text-slate-950 overflow-hidden font-sans antialiased">
    <!-- Topbar -->
    <header class="shrink-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 relative">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-12 sm:h-14 md:h-16">

          <!-- Page Title -->
          <div class="font-bold text-black text-base sm:text-lg md:text-xl capitalize truncate">
            {{ pageTitle }}
          </div>

          <!-- Topbar Icons -->
          <nav class="flex gap-4 sm:gap-5 text-black relative items-center">
            <!-- Feedback -->
            <button @click="showModal = true" title="Feedback">
              <ChatBubbleBottomCenterTextIcon class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </button>

            <!-- Upload File -->
            <button @click="showDocumentModal = true" title="Upload File">
              <DocumentArrowUpIcon class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
            </button>

            <!-- Notifications -->
            <div class="relative z-50" ref="notifRef">
              <button @click="toggleNotifDropdown" title="Notifications">
                <BellIcon class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                <span
                  v-if="notifications.length"
                  class="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] sm:text-xs w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center"
                >
                  {{ notifications.length }}
                </span>
              </button>

              <div v-if="notifDropdownOpen" class="fixed inset-0 bg-black/30 z-40" @click="notifDropdownOpen = false"></div>

              <transition name="fade">
                <div
                  v-if="notifDropdownOpen"
                  class="absolute right-0 mt-2 w-60 sm:w-64 max-h-72 sm:max-h-80 overflow-y-auto rounded-md z-50 bg-white"
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
          </nav>
        </div>
      </div>

      <!-- Feedback Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div class="bg-white text-gray-800 rounded-lg w-full max-w-md sm:max-w-lg shadow-lg p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Send Feedback</h2>
          <form @submit.prevent="sendFeedback" class="space-y-3 sm:space-y-4">
            <textarea
              v-model="newMessage"
              rows="3"
              placeholder="Your message..."
              class="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 bg-white text-sm sm:text-base"
            ></textarea>
            <div class="flex items-center gap-2 sm:gap-3">
              <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
              <button type="button" @click="imageInput.click()" class="text-green-600 hover:underline text-sm sm:text-base">Upload Image</button>
              <span v-if="imageFile?.name" class="text-xs sm:text-sm text-gray-500 truncate">{{ imageFile.name }}</span>
            </div>
            <div class="flex justify-end gap-2 sm:gap-3">
              <button type="button" @click="showModal = false" class="text-gray-600 hover:underline text-sm sm:text-base">Cancel</button>
              <button
                type="submit"
                :disabled="loading || (!newMessage && !imageFile)"
                class="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
              >
                <span v-if="loading">Sending...</span>
                <span v-else>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Document Upload Modal -->
      <div v-if="showDocumentModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
        <div class="bg-white text-gray-800 rounded-lg w-full max-w-md sm:max-w-lg shadow-lg p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Upload Financial Document</h2>
          <form @submit.prevent="uploadDocument" class="space-y-3 sm:space-y-4">
            <input ref="fileInput" type="file" class="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base" @change="handleFileSelect" />
            <textarea v-model="docDescription" placeholder="Optional description..." class="w-full border rounded px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base"></textarea>
            <div class="flex justify-end gap-2 sm:gap-3">
              <button type="button" @click="showDocumentModal = false" class="text-gray-600 hover:underline text-sm sm:text-base">Cancel</button>
              <button type="submit" :disabled="!selectedFile || uploading" class="bg-purple-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-purple-700 disabled:opacity-50 text-sm sm:text-base">
                <span v-if="uploading">Uploading...</span>
                <span v-else>Upload</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>

    <div class="flex flex-1 min-h-0 relative">
      <!-- Sidebar -->
      <div class="flex">
        <aside
          class="hidden sm:flex flex-col bg-white h-[calc(100vh-64px)] w-20 items-center py-6 fixed left-0 top-16 z-20 transition-all duration-300 group hover:w-24"
        >
          <nav class="flex flex-col items-center space-y-4 w-full px-2">
            <router-link 
              v-for="item in navItems" 
              :key="item.path"
              :to="item.path" 
              :class="iconLink(item.path)"
            >
              <component :is="item.icon" class="w-6 h-6 shrink-0" />
              <span class="sidebar-tooltip">{{ item.name }}</span>
            </router-link>
          </nav>

          <div class="mt-auto pb-24">
            <div class="w-1 h-16 bg-slate-50 rounded-full overflow-hidden">
              <div class="w-full bg-teal-500 h-1/2 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
            </div>
          </div>
        </aside>

        <!-- Mobile Bottom Nav -->
        <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center h-16 px-4 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="flex flex-col items-center justify-center transition-all duration-300 w-12 h-12 rounded-2xl relative"
            :class="route.path === item.path ? 'text-teal-600 bg-teal-50' : 'text-slate-400'"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <div 
              v-if="route.path === item.path" 
              class="absolute -top-1 w-1 h-1 bg-teal-600 rounded-full"
            ></div>
          </router-link>
        </nav>
      </div>

      <!-- Main Content Area -->
      <main
        class="flex-1 overflow-y-auto transition-all duration-300 bg-white sm:ml-20"
      >
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
  DocumentArrowUpIcon
} from '@heroicons/vue/24/outline'
import {
  LayoutGridIcon as HomeIcon,
  CreditCardIcon,
  FileTextIcon as DocumentTextIcon,
  ClipboardCheckIcon as ClipboardDocumentCheckIcon,
  CalendarDaysIcon as CalendarIcon,
  ActivityIcon as ChartBarIcon,
  UserIcon as UserCircleIcon,
} from 'lucide-vue-next'
import { getAuth } from 'firebase/auth'
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
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const auth = getAuth()
const route = useRoute()
const user = auth.currentUser
const userEmail = user?.email || ''

// Topbar State
const notifDropdownOpen = ref(false)
const notifRef = ref(null)
const showModal = ref(false)
const showDocumentModal = ref(false)
const newMessage = ref('')
const imageFile = ref(null)
const imageInput = ref(null)
const loading = ref(false)
const notifications = ref([])
const selectedFile = ref(null)
const docDescription = ref('')
const uploading = ref(false)
const fileInput = ref(null)

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

const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) notifDropdownOpen.value = false
}

// Sidebar State
const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Billing', path: '/billing', icon: ClipboardDocumentCheckIcon },
  { name: 'Payments', path: '/payments', icon: CreditCardIcon },
  { name: 'Invoices', path: '/invoices', icon: DocumentTextIcon },
  { name: 'Appointments', path: '/appointment', icon: CalendarIcon },
  { name: 'Results', path: '/result', icon: ChartBarIcon },
  { name: 'Profile', path: '/profile', icon: UserCircleIcon },
]

function iconLink(path) {
  const isActive = route.path === path
  return [
    'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group/item',
    isActive 
      ? 'bg-slate-950 text-teal-400 shadow-xl shadow-slate-200 scale-110' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
  ]
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

// Feedback logic
const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) imageFile.value = file
}

const sendFeedback = async () => {
  if (!user) return alert('Please log in first.')
  if (!newMessage.value && !imageFile.value) return

  loading.value = true
  let imageUrl = null

  try {
    if (imageFile.value) {
      const fileRef = sRef(storage, `billingFeedbackImages/${Date.now()}-${imageFile.value.name}`)
      const snapshot = await uploadBytes(fileRef, imageFile.value)
      imageUrl = await getDownloadURL(snapshot.ref)
    }

    await addDoc(collection(db, 'billingFeedback'), {
      text: newMessage.value,
      imageUrl,
      email: userEmail,
      sender: 'user',
      createdAt: serverTimestamp()
    })

    notifySuccess('Feedback sent successfully!')
    newMessage.value = ''
    imageFile.value = null
    if (imageInput.value) imageInput.value.value = ''
    showModal.value = false
  } catch (err) {
    console.error('Feedback send error:', err)
    notifyError('Failed to send feedback. Please try again.')
  } finally {
    loading.value = false
  }
}

// Document Upload logic
const handleFileSelect = (e) => selectedFile.value = e.target.files[0] || null

const uploadDocument = async () => {
  if (!selectedFile.value) return
  uploading.value = true

  try {
    const fileRef = sRef(storage, `financialDocuments/${Date.now()}-${selectedFile.value.name}`)
    const snapshot = await uploadBytes(fileRef, selectedFile.value)
    const fileUrl = await getDownloadURL(snapshot.ref)

    await addDoc(collection(db, 'financialDocuments'), {
      fileName: selectedFile.value.name,
      fileUrl,
      description: docDescription.value || '',
      email: userEmail,
      createdAt: serverTimestamp()
    })

    notifySuccess('Document uploaded successfully!')
    selectedFile.value = null
    docDescription.value = ''
    if (fileInput.value) fileInput.value.value = ''
    showDocumentModal.value = false
  } catch (err) {
    console.error('Upload error:', err)
    notifyError('Failed to upload document. Please try again.')
  } finally {
    uploading.value = false
  }
}

// Clear Notifications logic
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
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sidebar Tooltip styling */
.sidebar-tooltip {
  position: absolute;
  left: 100%;
  margin-left: 1.25rem;
  padding: 0.5rem 0.75rem;
  background: #0f172a; /* slate-950 */
  color: white;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 10px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.sidebar-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: transparent #0f172a transparent transparent;
}

.group\/item:hover .sidebar-tooltip {
  opacity: 1;
  transform: translateX(0);
}
</style>
