<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
    <!-- ✅ Topbar -->
    <div class="fixed top-0 z-30 shadow bg-white/90 backdrop-blur-md border-b border-gray-200 h-16 w-full md:left-64 md:right-0 flex items-center px-6">
      <AdminTopbar />
    </div>

    <div class="flex pt-16">
      <!-- ✅ Sidebar -->
      <aside class="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white/90 backdrop-blur-md h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar shadow-sm">
        <AdminSidebar />
      </aside>

      <!-- ✅ Main Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-4rem)] space-y-6 custom-scrollbar">
        <h1 class="text-2xl font-bold mb-4">Uploaded Financial Documents</h1>

        <div v-if="loading" class="text-gray-500">
          Loading documents...
        </div>

        <div v-else-if="documents.length === 0" class="text-gray-500">
          No documents found.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(doc, index) in documents"
            :key="index"
            class="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow hover:shadow-lg transition"
          >
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h2 class="font-semibold text-gray-800">{{ doc.fileName }}</h2>
                <p class="text-gray-500 text-sm">{{ doc.email }}</p>
                <p v-if="doc.description" class="text-gray-600 text-sm">{{ doc.description }}</p>
              </div>
              <a
                :href="doc.fileUrl"
                target="_blank"
                rel="noopener"
                class="text-blue-600 hover:underline text-sm font-medium"
              >
                View File
              </a>
            </div>
            <p class="text-gray-400 text-xs mt-2">
              Uploaded: {{ formatDate(doc.createdAt?.seconds) }}
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase'

import AdminSidebar from '@/components/admin_sidebar.vue'
import AdminTopbar from '@/components/AdminTopbar.vue'

const documents = ref([])
const loading = ref(true)

const fetchDocuments = async () => {
  try {
    const q = query(collection(db, 'financialDocuments'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    documents.value = snapshot.docs.map((doc) => doc.data())
  } catch (error) {
    console.error('Error fetching documents:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchDocuments)
</script>

<style>
/* Scrollbar */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 3px;
}
</style>
