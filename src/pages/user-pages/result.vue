<template>
  <div class="h-screen flex flex-col bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Topbar -->
    <div class="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <Topbar />
    </div>

    <!-- Body -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 hidden sm:block border-r border-gray-200 bg-white flex-shrink-0">
        <Sidebar />
      </div>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto px-4 py-6 sm:px-8 space-y-8 animate-fade-in">
        <!-- Header -->
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12h6m2 8H7a2 2 0 01-2-2V6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v12a2 2 0 01-2 2z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800">Your Laboratory Results</h2>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-[60vh]">
          <loading_animation />
        </div>

        <!-- Results -->
        <template v-else>
          <!-- No Invoices -->
          <div v-if="invoices.length === 0" class="text-center text-gray-500 text-sm py-20">
            🧪 No laboratory results available.
          </div>

          <!-- Invoices -->
          <div
            v-else
            v-for="inv in invoices"
            :key="inv.id"
            class="bg-white p-6 rounded-xl shadow border-l-4 transition border-blue-500 hover:shadow-md hover:border-blue-600 space-y-5"
          >
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div class="space-y-1.5">
                <p class="font-medium text-gray-800">
                  📅 Date: <span class="text-gray-600">{{ formatDate(inv.createdAt) }}</span>
                </p>
                <div class="flex items-center text-sm space-x-2">
                  <span class="font-medium text-gray-700">Status:</span>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
                      inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    ]"
                  >
                    <svg
                      v-if="inv.status === 'Paid'"
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg
                      v-else-if="inv.status === 'Pending'"
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3" />
                    </svg>
                    <svg
                      v-else
                      class="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ inv.status }}
                  </span>
                </div>
              </div>

              <button
                @click="exportPDF(inv)"
                class="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 4v16m8-8H4" />
                </svg>
                Export PDF
              </button>
            </div>

            <!-- Service Results -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor"
                  stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 17v-2a4 4 0 018 0v2M12 12h.01M6.938 4.938l1.414 1.414M17.657 4.938l-1.414 1.414" />
                </svg>
                Laboratory Findings
              </h3>
              <ul class="space-y-2 pl-3 border-l-2 border-blue-100">
                <li
                  v-for="svc in inv.services"
                  :key="svc.serviceName"
                  class="text-sm text-gray-800"
                >
                  <strong>{{ svc.serviceName }}</strong>
                  <div class="text-xs text-gray-600 mt-0.5 ml-2 whitespace-pre-line">
                    {{ svc.result || 'No result yet' }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </template>
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
import Topbar from '@/components/Topbar.vue'
import loading_animation from '@/components/loading_animation.vue'

const invoices = ref([])
const userEmail = ref('')
const loading = ref(true)

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
/* global animation, no scoped */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
