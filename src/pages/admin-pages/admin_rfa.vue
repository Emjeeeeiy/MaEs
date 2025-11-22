<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 left-0 right-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside
        class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm"
      >
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main
        class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar"
      >
        <!-- Page Title -->
        <h1 class="text-2xl font-bold text-gray-800">📂 Uploaded Financial Documents</h1>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-40">
          <p class="text-gray-500 text-lg">Loading documents...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="documents.length === 0"
          class="flex flex-col items-center justify-center h-40 text-center space-y-2"
        >
          <p class="text-gray-500 text-lg">No documents found.</p>
          <p class="text-gray-400 text-sm">Uploaded files will appear here once available.</p>
        </div>

        <!-- Documents List -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(doc, index) in documents"
            :key="index"
            class="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-5 shadow hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-[1.01] flex flex-col justify-between"
          >
            <!-- Document Info -->
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-800 truncate">
                {{ doc.fileName }}
              </h2>
              <p class="text-sm text-gray-500">{{ doc.email }}</p>
              <p v-if="doc.description" class="text-sm text-gray-600 line-clamp-3">
                {{ doc.description }}
              </p>
            </div>

            <!-- File Actions -->
            <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
              <p class="text-xs">📅 Uploaded: {{ formatDate(doc.createdAt?.seconds) }}</p>
              <a
                :href="doc.fileUrl"
                target="_blank"
                rel="noopener"
                class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 active:scale-95 text-white font-medium shadow transition text-xs"
              >
                View File
              </a>
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
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'

import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/admintopbar.vue'

const documents = ref([])
const loading = ref(true)

// 🔥 Real-time fetch ng financial documents
const fetchDocuments = () => {
  const q = query(collection(db, 'financialDocuments'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    documents.value = snapshot.docs.map((doc) => doc.data())
    loading.value = false
  }, (error) => {
    console.error('Error fetching documents:', error)
    loading.value = false
  })
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

onMounted(fetchDocuments)
</script>