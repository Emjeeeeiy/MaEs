<template>
  <div class="h-screen flex flex-col bg-gray-50 text-gray-800 overflow-hidden">
    <!-- ✅ Topbar -->
    <div
      class="sticky top-0 z-30 transition-all duration-300"
      :class="{
        'backdrop-blur-md bg-white/70': isMobileSidebarOpen,
        'bg-white/95 border-b border-gray-200 shadow-sm': !isMobileSidebarOpen
      }"
    >
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <div class="flex flex-1 overflow-hidden relative">
      <!-- Sidebar -->
      <Sidebar
        :isMobileSidebarOpen="isMobileSidebarOpen"
        @close-sidebar="isMobileSidebarOpen = false"
      />

      <!-- Mobile Overlay -->
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 sm:hidden"
        @click="isMobileSidebarOpen = false"
      ></div>

      <!-- ✅ Main Content -->
      <main
        class="flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-24 space-y-4 sm:space-y-6 transition-all duration-300 custom-scrollbar"
        :class="{ 'blur-sm': isMobileSidebarOpen }"
      >
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-blue-100 text-blue-600 shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v12a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">Laboratory Results</h2>
          </div>

          <button
            @click="refresh"
            class="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 shadow-sm transition"
          >
            🔄 Refresh
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-[40vh]">
          <loading_animation />
        </div>

        <!-- Empty State -->
        <div v-else-if="invoices.length === 0" class="text-center py-20">
          <div class="text-4xl sm:text-5xl mb-3">🧪</div>
          <p class="text-gray-600 text-lg font-medium">No laboratory results available</p>
          <p class="text-gray-400 text-sm mt-1">Please check back later for updates</p>
        </div>

        <!-- Results List -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="inv in invoices"
            :key="inv.id"
            class="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md flex flex-col justify-between transition cursor-pointer"
          >
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
              <div class="flex flex-col gap-1">
                <p class="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
                  📅 <span class="font-medium text-gray-600">{{ formatDate(inv.createdAt) }}</span>
                </p>
                <div class="flex items-center gap-2 text-[10px] sm:text-xs">
                  <span class="font-medium text-gray-700">Status:</span>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full font-semibold',
                      inv.status === 'Paid' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                      inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200' :
                      'bg-red-100 text-red-700 ring-1 ring-red-200'
                    ]"
                  >
                    <svg
                      v-if="inv.status === 'Paid'"
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg
                      v-else-if="inv.status === 'Pending'"
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3" />
                    </svg>
                    <svg
                      v-else
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ inv.status }}
                  </span>
                </div>
              </div>

              <!-- PDF Export -->
              <button
                @click="exportPDF(inv)"
                class="inline-flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Export PDF
              </button>
            </div>

            <!-- Lab Findings -->
            <div class="mt-3 sm:mt-4">
              <h3 class="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-1 sm:gap-2">
                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 17v-2a4 4 0 018 0v2M12 12h.01M6.938 4.938l1.414 1.414M17.657 4.938l-1.414 1.414" />
                </svg>
                Laboratory Findings
              </h3>
              <ul class="space-y-2">
                <li
                  v-for="svc in inv.services"
                  :key="svc.serviceName"
                  class="p-2 sm:p-3 border border-gray-200 rounded-lg text-[10px] sm:text-xs"
                >
                  <div class="font-medium text-gray-800">{{ svc.serviceName }}</div>
                  <div class="text-gray-600 mt-1 whitespace-pre-line leading-relaxed text-[9px] sm:text-[10px]">
                    {{ svc.result || 'No result yet' }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import html2pdf from 'html2pdf.js'

import Sidebar from '@/components/Sidebar.vue'
import Topbar from '@/components/topbar.vue'
import loading_animation from '@/components/loading_animation.vue'

const invoices = ref([])
const userEmail = ref('')
const loading = ref(true)
const isMobileSidebarOpen = ref(false)

const listenForInvoices = () => {
  if (!userEmail.value) return
  const q = query(collection(db, 'invoices'), where('email', '==', userEmail.value))
  onSnapshot(q, snap => {
    invoices.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    loading.value = false
  })
}

const formatDate = (ts) => {
  if (!ts?.toDate) return 'N/A'
  return ts.toDate().toISOString().split('T')[0]
}

const exportPDF = (inv) => {
  const exportDate = new Date().toLocaleString()
  const logoURL = `${window.location.origin}/MaEs_logo2.png`

  const serviceItems = inv.services?.map(s => `
    <li style="margin-bottom:6px;">
      <strong>${s.serviceName}</strong>:<br>
      <div style="margin-left:1em;color:#333;">
        ${s.result ? s.result.replace(/\n/g, '<br>') : '<em>No result yet</em>'}
      </div>
    </li>
  `).join('') || '<li><em>No services listed</em></li>'

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color:#1F2937;">
      <div style="text-align:center; margin-bottom:1em;">
        <img src="${logoURL}" alt="MaEs Logo" style="height:60px;" />
        <h2 style="margin-top:0.5em;">MaEs Laboratory Result</h2>
      </div>

      <p><strong>Email:</strong> ${inv.email}</p>
      <p><strong>Invoice Date:</strong> ${formatDate(inv.createdAt)}</p>
      <p><strong>Status:</strong> ${inv.status}</p>
      <p><strong>Exported On:</strong> ${exportDate}</p>

      <hr style="margin:20px 0;" />

      <h3>Results:</h3>
      <ul style="padding-left:1.2em;">${serviceItems}</ul>
    </div>
  `

  html2pdf()
    .from(html)
    .set({
      margin: 0.5,
      filename: `Result_${formatDate(inv.createdAt)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    })
    .save()
}

const refresh = () => {
  if (userEmail.value) listenForInvoices()
}

onMounted(() => {
  onAuthStateChanged(getAuth(), user => {
    if (user) {
      userEmail.value = user.email
      listenForInvoices()
    }
  })
})
</script>

<style>
/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.6);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.8);
}
</style>
