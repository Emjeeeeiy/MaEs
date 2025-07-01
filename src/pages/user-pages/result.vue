<template>
  <div class="flex flex-col sm:flex-row h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- Sidebar -->
    <div class="w-full sm:w-64 sm:h-screen sticky top-0 border-b sm:border-b-0 sm:border-r border-gray-200 bg-white z-20">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col max-h-screen overflow-hidden text-sm">
      <!-- Topbar -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <Topbar />
      </div>

      <!-- Page Body -->
      <main class="flex-1 overflow-y-auto px-4 py-4 sm:py-6 space-y-6 animate-fade-in relative">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-[60vh]">
          <loading_animation />
        </div>

        <!-- Invoices List -->
        <template v-else>
          <div
            v-for="inv in invoices"
            :key="inv.id"
            class="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 space-y-4"
          >
            <!-- Header Row -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              <div class="space-y-0.5">
                <p class="font-medium text-gray-700">
                  <span class="text-gray-500">Date:</span> {{ formatDate(inv.createdAt) }}
                </p>
                <p class="text-xs">
                  <span class="text-gray-500 font-medium">Status:</span>
                  <span
                    :class="[
                      'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium',
                      inv.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      inv.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ inv.status }}
                  </span>
                </p>
              </div>

              <button
                @click="exportPDF(inv)"
                class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition"
              >
                Export PDF
              </button>
            </div>

            <!-- Results Section -->
            <div>
              <h3 class="text-sm font-semibold text-gray-800 mb-2">Results</h3>
              <ul class="space-y-2">
                <li
                  v-for="svc in inv.services"
                  :key="svc.serviceName"
                  class="text-sm text-gray-800"
                >
                  <strong>{{ svc.serviceName }}:</strong>
                  <div class="text-xs text-gray-700 whitespace-pre-line mt-0.5 ml-2">
                    {{ svc.result || 'No result yet' }}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- No Results Message -->
          <p v-if="invoices.length === 0" class="text-center text-sm text-gray-500">
            No results available.
          </p>
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

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
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
