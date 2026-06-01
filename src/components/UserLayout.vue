<template>
  <div class="flex h-screen bg-slate-50/50 text-slate-900 overflow-hidden font-sans antialiased">
    <!-- Sidebar -->
    <aside
      class="hidden lg:flex flex-col bg-white border-r border-slate-200/60 w-64 shrink-0 h-full z-30 transition-all duration-300"
    >
      <!-- Logo Section -->
      <div class="h-16 flex items-center px-6 border-b border-slate-50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-200">
             <img src="/MaEs_logo.png" class="w-6 h-6 object-contain brightness-0 invert" alt="Logo" />
          </div>
          <span class="font-bold text-lg tracking-tight text-slate-800">MaEs</span>
        </div>
      </div>

      <!-- Navigation Section -->
      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">Main Menu</div>
        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path" 
          :class="iconLink(item.path)"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span class="font-medium text-sm">{{ item.name }}</span>
          
          <!-- Active Indicator dot -->
          <div v-if="route.path === item.path" class="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]"></div>
        </router-link>

        <div class="pt-8 pb-4">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">Account</div>
          <button 
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 mt-1"
          >
            <LogOutIcon class="w-5 h-5 shrink-0" />
            <span class="font-medium text-sm">Logout</span>
          </button>
        </div>
      </nav>

      <!-- User Profile Card -->
      <div class="p-4 border-t border-slate-50 bg-slate-50/30">
        <div class="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div class="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            {{ userEmail ? userEmail.charAt(0).toUpperCase() : 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-slate-800 truncate">{{ userEmail.split('@')[0] }}</p>
            <p class="text-[10px] text-slate-400 truncate">{{ userEmail }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Wrapper -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Topbar -->
      <header class="shrink-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0">
        <div class="w-full px-4 sm:px-6">
          <div class="flex justify-between items-center h-16">

            <!-- Page Title & Mobile Toggle -->
            <div class="flex items-center gap-4">
              <button class="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <MenuIcon class="w-6 h-6" />
              </button>
              <h1 class="font-bold text-slate-800 text-lg md:text-xl capitalize tracking-tight">
                {{ pageTitle }}
              </h1>
            </div>

            <!-- Topbar Actions -->
            <nav class="flex items-center gap-1 sm:gap-3">
              <!-- Quick Actions Label (Desktop Only) -->
              <span class="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Quick Actions</span>
              
              <!-- Feedback -->
              <button 
                @click="showModal = true" 
                class="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 group relative"
              >
                <ChatBubbleBottomCenterTextIcon class="w-5 h-5" />
                <span class="absolute top-full right-0 mt-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Feedback</span>
              </button>

              <!-- Upload File -->
              <button 
                @click="showDocumentModal = true" 
                class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group relative"
              >
                <DocumentArrowUpIcon class="w-5 h-5" />
                <span class="absolute top-full right-0 mt-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Upload</span>
              </button>

              <div class="h-6 w-px bg-slate-200 mx-1"></div>

              <!-- Notifications -->
              <div class="relative" ref="notifRef">
                <button 
                  @click="toggleNotifDropdown" 
                  class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 relative group"
                >
                  <BellIcon class="w-5 h-5" />
                  <span
                    v-if="notifications.length"
                    class="absolute top-2 right-2 flex h-2 w-2"
                  >
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </button>

                <transition name="pop-over">
                  <div
                    v-if="notifDropdownOpen"
                    class="absolute right-0 mt-3 w-80 sm:w-96 max-h-128 overflow-hidden rounded-2xl z-50 bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 ring-1 ring-slate-900/5"
                  >
                    <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-sm text-slate-900">Notifications</span>
                        <span v-if="notifications.length" class="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">{{ notifications.length }} New</span>
                      </div>
                      <button 
                        v-if="notifications.length"
                        class="text-xs text-rose-500 hover:text-rose-600 font-bold" 
                        @click="clearNotifications"
                      >
                        Clear all
                      </button>
                    </div>
                    
                    <div class="overflow-y-auto max-h-96 custom-scrollbar">
                      <div v-if="!notifications.length" class="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                          <BellIcon class="w-6 h-6 text-slate-300" />
                        </div>
                        <p class="text-sm font-bold text-slate-500">All caught up!</p>
                        <p class="text-xs text-slate-400 mt-1">No new notifications for you.</p>
                      </div>
                      
                      <div
                        v-for="(notif, index) in notifications"
                        :key="index"
                        class="px-4 py-4 border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <div class="flex gap-4">
                          <div class="mt-1 h-2 w-2 rounded-full bg-teal-500 shrink-0 group-hover:scale-125 transition-transform"></div>
                          <div class="flex-1">
                            <p class="text-sm text-slate-700 font-medium leading-relaxed group-hover:text-slate-900">{{ notif.message }}</p>
                            <div class="flex items-center gap-2 mt-2">
                              <CalendarIcon class="w-3 h-3 text-slate-300" />
                              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ formatDate(notif.createdAt?.seconds) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="p-3 border-t border-slate-50 bg-slate-50/30 text-center">
                       <button class="text-xs font-bold text-teal-600 hover:text-teal-700">View All Notifications</button>
                    </div>
                  </div>
                </transition>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main
        class="flex-1 overflow-y-auto transition-all duration-300 bg-transparent p-4 sm:p-6 lg:p-10 custom-scrollbar"
      >
        <div class="max-w-7xl mx-auto">
          <slot></slot>
        </div>

        <!-- Add extra space for mobile bottom nav -->
        <div class="h-20 lg:hidden"></div>
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/50 flex justify-around items-center h-16 pb-safe z-40 px-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <router-link 
        v-for="item in navItems.slice(0, 5)" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center transition-all duration-300 w-12 h-12 rounded-xl relative"
        :class="route.path === item.path ? 'text-teal-600' : 'text-slate-400'"
      >
        <component :is="item.icon" class="w-6 h-6" />
        <span class="text-[9px] font-bold mt-0.5 truncate w-full text-center">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Modals -->
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="bg-white rounded-4xl w-full max-w-md shadow-2xl relative overflow-hidden border border-white/20">
          <div class="p-8">
            <div class="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6">
              <ChatBubbleBottomCenterTextIcon class="w-6 h-6 text-teal-600" />
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Send Feedback</h2>
            <p class="text-sm text-slate-500 mb-8 leading-relaxed">Your feedback helps us make MaEs better for everyone. What's on your mind?</p>
            
            <form @submit.prevent="sendFeedback" class="space-y-6">
              <div class="relative group">
                <textarea
                  v-model="newMessage"
                  rows="4"
                  placeholder="Share your thoughts..."
                  class="w-full border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-slate-700 bg-slate-50/50 text-sm transition-all resize-none"
                ></textarea>
              </div>
              
              <div class="flex items-center gap-4">
                <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
                <button 
                  type="button" 
                  @click="imageInput.click()" 
                  class="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <CameraIcon class="w-4 h-4" />
                  {{ imageFile ? 'Change Image' : 'Add Image' }}
                </button>
                <span v-if="imageFile" class="text-xs text-teal-600 font-bold truncate max-w-37.5 bg-teal-50 px-2 py-1 rounded-lg">{{ imageFile.name }}</span>
              </div>
              
              <div class="flex gap-4 pt-4">
                <button 
                  type="button" 
                  @click="showModal = false" 
                  class="flex-1 px-6 py-3.5 rounded-2xl text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading || (!newMessage && !imageFile)"
                  class="flex-1 bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-teal-700 disabled:opacity-50 text-sm shadow-xl shadow-teal-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span v-if="loading">Sending...</span>
                  <template v-else>
                    <span>Send Message</span>
                    <SendIcon class="w-4 h-4" />
                  </template>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal">
      <div v-if="showDocumentModal" class="fixed inset-0 z-60 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showDocumentModal = false"></div>
        <div class="bg-white rounded-4xl w-full max-w-md shadow-2xl relative overflow-hidden border border-white/20">
          <div class="p-8">
            <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <DocumentArrowUpIcon class="w-6 h-6 text-indigo-600" />
            </div>
            <h2 class="text-2xl font-bold text-slate-900 mb-2">Upload Document</h2>
            <p class="text-sm text-slate-500 mb-8 leading-relaxed">Securely upload your financial or medical documents for review.</p>
            
            <form @submit.prevent="uploadDocument" class="space-y-6">
              <div 
                @click="fileInput.click()"
                class="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group relative overflow-hidden"
              >
                <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" />
                <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <DocumentArrowUpIcon class="w-7 h-7 text-indigo-500" />
                </div>
                <p class="text-sm font-bold text-slate-700 text-center">{{ selectedFile ? selectedFile.name : 'Click or drop to select' }}</p>
                <p class="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-widest">PDF, JPG, PNG (Max 10MB)</p>
                
                <div v-if="selectedFile" class="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p class="text-xs font-bold text-indigo-600">Change File</p>
                </div>
              </div>
              
              <div>
                <input 
                  v-model="docDescription" 
                  placeholder="What is this document for?" 
                  class="w-full border-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 bg-slate-50/50 text-sm transition-all"
                />
              </div>
              
              <div class="flex gap-4 pt-4">
                <button 
                  type="button" 
                  @click="showDocumentModal = false" 
                  class="flex-1 px-6 py-3.5 rounded-2xl text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  :disabled="!selectedFile || uploading" 
                  class="flex-1 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 text-sm shadow-xl shadow-indigo-500/30 transition-all active:scale-95"
                >
                  <span v-if="uploading">Uploading...</span>
                  <span v-else>Upload Document</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
  DocumentArrowUpIcon,
  CameraIcon,
  Bars3Icon as MenuIcon,
} from '@heroicons/vue/24/outline'
import {
  LayoutGridIcon as HomeIcon,
  CreditCardIcon,
  FileTextIcon as DocumentTextIcon,
  ClipboardCheckIcon as ClipboardDocumentCheckIcon,
  CalendarDaysIcon as CalendarIcon,
  ActivityIcon as ChartBarIcon,
  UserIcon as UserCircleIcon,
  SettingsIcon,
  LogOutIcon,
  SendIcon,
} from 'lucide-vue-next'
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
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useNotifications } from '@/composables/useNotifications'

const { success: notifySuccess, error: notifyError } = useNotifications()
const router = useRouter()

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
  return routeMap[route.path] || 'Overview'
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
  { name: 'Settings', path: '/edit_profile', icon: SettingsIcon },
]

function iconLink(path) {
  const isActive = route.path === path
  return [
    'flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group/item',
    isActive 
      ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 ring-4 ring-teal-500/10' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  ]
}

const handleLogout = async () => {
  try {
    await signOut(auth)
    notifySuccess('Logged out successfully')
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
    notifyError('Failed to log out')
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

// Feedback logic
const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) imageFile.value = file
}

const sendFeedback = async () => {
  if (!user) return notifyError('Please log in first.')
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
    notifyError('Failed to send feedback.')
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
    notifyError('Failed to upload document.')
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
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(30px);
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Page height fix */
.h-screen {
  height: 100vh;
  height: 100dvh;
}
</style>
