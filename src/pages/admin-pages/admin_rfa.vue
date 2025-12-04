<template>
  <div class="flex flex-col min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
    <!-- Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30">
      <AdminTopbar />
    </div>

    <div class="flex pt-14">
      <!-- Sidebar -->
      <aside>
        <AdminSidebar />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto h-[calc(100vh-3.5rem)] custom-scrollbar">
        <!-- Page Title -->
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileTextIcon class="w-5 h-5 text-green-600" /> Uploaded Financial Documents
        </h1>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-36">
          <p class="text-gray-500 text-sm sm:text-base">Loading documents...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="documents.length === 0" class="flex flex-col items-center justify-center h-36 text-center space-y-1 sm:space-y-2">
          <p class="text-gray-500 text-sm sm:text-base">No documents found.</p>
          <p class="text-gray-400 text-xs sm:text-sm">Uploaded files will appear here once available.</p>
        </div>

        <!-- Documents List -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            v-for="(doc, index) in documents"
            :key="doc.id || index"
            class="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <!-- Document Info -->
            <div class="space-y-1 sm:space-y-2">
              <h2 class="text-sm sm:text-base font-semibold text-gray-800 truncate">{{ doc.fileName }}</h2>
              <p class="text-xs sm:text-sm text-gray-500">{{ doc.email }}</p>
              <p v-if="doc.description" class="text-xs sm:text-sm text-gray-600 line-clamp-3">
                {{ doc.description }}
              </p>
            </div>

            <!-- File Actions -->
            <div class="mt-3 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <p class="flex items-center gap-1">
                <CalendarIcon class="w-3.5 h-3.5 text-gray-400" /> {{ formatDate(doc.createdAt?.seconds) }}
              </p>
              <div class="flex items-center gap-2">
                <a
                  :href="doc.fileUrl"
                  target="_blank"
                  rel="noopener"
                  class="flex items-center gap-1 px-2 py-1 rounded-md bg-green-600 hover:bg-green-700 active:scale-95 text-white font-medium shadow transition text-xs sm:text-sm"
                >
                  <EyeIcon class="w-3.5 h-3.5" /> View
                </a>
                <button
                  @click="deleteDocument(doc.id)"
                  class="flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 active:scale-95 text-white font-medium shadow transition text-xs sm:text-sm"
                >
                  <Trash2Icon class="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
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

import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/admintopbar.vue'
import { FileTextIcon, CalendarIcon, EyeIcon, Trash2Icon } from 'lucide-vue-next'

const documents = ref([])
const loading = ref(true)

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
  if (!timestamp) return 'N/A'
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
  if (confirm('Are you sure you want to delete this document?')) {
    try {
      await deleteDoc(doc(db, 'financialDocuments', id))
      documents.value = documents.value.filter(d => d.id !== id)
      alert('Document deleted successfully!')
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Failed to delete document.')
    }
  }
}

onMounted(fetchDocuments)
</script>

<style scoped>
/* Optional: make hover scale smoother */
div:hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>
