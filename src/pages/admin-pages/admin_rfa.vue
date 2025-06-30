<template>
  <div class="flex min-h-screen bg-[#1a1a1a] text-gray-100">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 border-r border-gray-700 bg-[#121212]" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <AdminTopbar class="border-b border-gray-700 bg-[#121212]" />

      <!-- Page Content -->
      <main class="flex-1 p-6 space-y-6 overflow-y-auto">
        <h1 class="text-2xl font-bold text-green-400">Uploaded Financial Documents</h1>

        <div v-if="loading" class="text-gray-400">Loading documents...</div>

        <div v-else-if="documents.length === 0" class="text-gray-500 italic">
          No documents found.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(doc, index) in documents"
            :key="index"
            class="border border-gray-700 bg-[#222] rounded-lg p-5 shadow-md hover:shadow-green-500/20 transition"
          >
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-lg font-semibold text-white">{{ doc.fileName }}</h2>
                <p class="text-sm text-gray-400">{{ doc.email }}</p>
                <p v-if="doc.description" class="text-sm mt-2 text-gray-300">
                  {{ doc.description }}
                </p>
              </div>
              <a
                :href="doc.fileUrl"
                target="_blank"
                rel="noopener"
                class="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                View File
              </a>
            </div>
            <p class="text-xs text-gray-500 mt-3">
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
