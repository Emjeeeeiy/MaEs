<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <!-- Workspace Heading & Counter Context -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <FileTextIcon class="w-5 h-5 text-gray-400" />
              <span>Financial Ledger Vault</span>
            </h1>
            <span v-if="!loading && documents.length > 0" class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 border border-gray-200/40 dark:border-gray-800/40 font-mono">
              {{ documents.length }} File{{ documents.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Pamahalaan, suriin, o burahin ang mga isinumiteng dokumentong pinansyal at resibo mula sa mga rehistradong kliyente.</p>
        </div>
      </header>

      <!-- ================= SKELETON LOADING STATE ================= -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        <div v-for="i in 3" :key="i" class="p-5 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800/60 space-y-4">
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4"></div>
            <div class="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-1/2"></div>
          </div>
          <div class="h-12 bg-gray-50 dark:bg-gray-800/30 rounded-lg"></div>
          <div class="flex justify-between items-center pt-2">
            <div class="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-1/3"></div>
            <div class="flex gap-2">
              <div class="h-7 w-12 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              <div class="h-7 w-12 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= EMPTY LEDGER STATE ================= -->
      <div v-else-if="documents.length === 0" class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-12 text-center shadow-2xs max-w-xl mx-auto mt-6">
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="p-3 rounded-full bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800">
            <InboxIcon class="w-6 h-6 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Document Repository Empty</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Kasalukuyang walang nakaimbak na mga ulat. Ang mga uploads ng kliyente ay awtomatikong lilitaw rito sa sandaling maging available ang mga ito.
            </p>
          </div>
        </div>
      </div>

      <!-- ================= MAIN FILE GRID WORKSPACE ================= -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(doc, index) in documents"
          :key="doc.id || index"
          class="group bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-5 shadow-2xs hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs transition duration-200 flex flex-col justify-between relative"
        >
          <!-- Core Info Section -->
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" :title="doc.fileName">
                  {{ doc.fileName }}
                </h2>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate mt-0.5">{{ doc.email }}</p>
              </div>
              <div class="p-1.5 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800 shrink-0">
                <FileIcon class="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            <!-- Description Frame Payload -->
            <div v-if="doc.description" class="p-2.5 rounded-lg bg-gray-50/50 dark:bg-[#222]/30 border border-gray-100 dark:border-gray-800/40">
              <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                {{ doc.description }}
              </p>
            </div>
          </div>

          <!-- Bottom Meta Controls Bar -->
          <div class="mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between text-[11px]">
            <span class="flex items-center gap-1 text-gray-400 dark:text-gray-500 font-mono">
              <CalendarIcon class="w-3 h-3 text-gray-300 dark:text-gray-600" /> 
              <span>{{ formatDate(doc.createdAt?.seconds) }}</span>
            </span>
            
            <!-- Quick Link Operations Group -->
            <div class="flex items-center gap-1.5">
              <a
                :href="doc.fileUrl"
                target="_blank"
                rel="noopener"
                title="View original copy"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 font-medium transition shadow-2xs active:scale-97"
              >
                <EyeIcon class="w-3 h-3 text-gray-400" /> 
                <span>Open</span>
              </a>
              
              <button
                @click="deleteDocument(doc.id)"
                title="Purge Document from Vault"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-medium transition active:scale-97"
              >
                <Trash2Icon class="w-3 h-3" /> 
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>

  <!-- ================= GENERIC CONFIRMATION MODAL ================= -->
  <transition name="fade">
    <div
      v-if="confirmationModal.show"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-xs px-4"
      @click="confirmationModal.show = false"
    >
      <div 
        class="bg-white dark:bg-[#1a1a1a] w-full max-w-md p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl relative animate-fadeIn"
        @click.stop
      >
        <div :class="['flex items-center gap-3 mb-4', confirmationModal.isDestructive ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400']">
          <div :class="['p-3 rounded-2xl border', confirmationModal.isDestructive ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30']">
            <component :is="confirmationModal.icon || AlertTriangleIcon" class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-black tracking-tight">{{ confirmationModal.title }}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Please confirm your action.</p>
          </div>
        </div>
        
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
          {{ confirmationModal.message }}
        </p>
        
        <div class="flex justify-end gap-3">
          <button
            @click="confirmationModal.show = false"
            class="px-6 py-3 rounded-2xl text-xs font-bold bg-gray-50 dark:bg-transparent hover:bg-gray-100 dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 transition"
          >
            Cancel
          </button>
          <button
            @click="handleConfirmedAction"
            :class="['px-6 py-3 rounded-2xl text-xs font-bold text-white transition shadow-lg', confirmationModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20']"
          >
            {{ confirmationModal.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  collection,
  orderBy,
  query,
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/firebase'

import AdminLayout from '@/components/AdminLayout.vue'
import { 
  FileTextIcon, 
  CalendarIcon, 
  EyeIcon, 
  Trash2Icon, 
  Inbox as InboxIcon, 
  File as FileIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'

import { useNotifications } from '@/composables/useNotifications'

const documents = ref([])
const loading = ref(true)
const { success: notifySuccess, error: notifyError } = useNotifications()

// Confirmation Modal State
const confirmationModal = ref({
  show: false,
  title: '',
  message: '',
  confirmText: '',
  isDestructive: false,
  icon: null,
  action: null
});

const handleConfirmedAction = () => {
  if (confirmationModal.value.action) {
    confirmationModal.value.action();
  }
  confirmationModal.value.show = false;
};

const openConfirm = (config) => {
  confirmationModal.value = {
    show: true,
    title: config.title || 'Are you sure?',
    message: config.message || 'This action cannot be undone.',
    confirmText: config.confirmText || 'Confirm',
    isDestructive: config.isDestructive || false,
    icon: config.icon || AlertTriangleIcon,
    action: config.action
  };
};

// 🔥 Real-time fetch of financial documents
const fetchDocuments = () => {
  const q = query(collection(db, 'financialDocuments'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    documents.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    loading.value = false
  }, (error) => {
    console.error('Error fetching documents:', error)
    loading.value = false
  })
}

// Format timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

// Delete document
const deleteDocument = async (id) => {
  if (!id) return
  openConfirm({
    title: 'Purge Document?',
    message: 'Sigurado ka bang nais mong burahin ang dokumentong ito mula sa vault? Ang aksyong ito ay permanenteng aalisin ang file sa system.',
    confirmText: 'Yes, Purge Document',
    isDestructive: true,
    icon: Trash2Icon,
    action: async () => {
      try {
        await deleteDoc(doc(db, 'financialDocuments', id))
        documents.value = documents.value.filter(d => d.id !== id)
        notifySuccess('Document deleted successfully!')
      } catch (err) {
        console.error('Error deleting document:', err)
        notifyError('Failed to delete document.')
      }
    }
  });
}

onMounted(fetchDocuments)
</script>

<style scoped>
/* Optional: make hover scale smoother */
div:hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
</style>
