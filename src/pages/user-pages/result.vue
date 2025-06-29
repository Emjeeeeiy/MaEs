<template>
  <div class="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
    <!-- ░░ Sidebar ░░ -->
    <div class="w-64 h-screen sticky top-0 border-r bg-white z-20">
      <Sidebar />
    </div>

    <!-- ░░ Main ░░ -->
    <div class="flex-1 flex flex-col max-h-screen overflow-hidden">
      <!-- Top‑bar -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-300 shadow-sm">
        <Topbar />
      </div>

      <!-- ░░ Results ░░ -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6">
        <h1 class="text-xl font-bold text-green-700">Your Results</h1>

        <div
          v-for="inv in invoices"
          :key="inv.id"
          class="bg-white p-6 rounded-lg shadow border space-y-4"
        >
          <!-- Header row -->
          <div class="flex flex-wrap justify-between items-center gap-3">
            <div>
              <p class="font-medium text-gray-700">
                Date: {{ formatDate(inv.createdAt) }}
              </p>
              <p class="text-sm text-gray-500">
                Status: {{ inv.status }}
              </p>
            </div>

            <button
              @click="exportPDF(inv)"
              class="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Export PDF
            </button>
          </div>

          <!-- Service results -->
          <div>
            <h2 class="font-semibold text-gray-800 mb-2">Results</h2>
            <ul class="space-y-2">
              <li
                v-for="svc in inv.services"
                :key="svc.serviceName"
                class="text-sm text-gray-800"
              >
                <strong>{{ svc.serviceName }}:</strong>
                <span class="whitespace-pre-line">
                  {{ svc.result || 'No result yet' }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p
          v-if="invoices.length === 0"
          class="text-center text-sm text-gray-500"
        >
          No results available.
        </p>
      </main>
    </div>
  </div>
</template>

<script setup>
/* ── Imports ─────────────────────────────────── */
import { ref, onMounted } from 'vue'
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import html2pdf from 'html2pdf.js'

import Sidebar from '@/components/Sidebar.vue'
import Topbar  from '@/components/Topbar.vue'

/* ── Reactive state ──────────────────────────── */
const invoices  = ref([])
const userEmail = ref('')

/* ── Listen to invoices for this user ────────── */
const listenForInvoices = () => {
  if (!userEmail.value) return
  const q = query(
    collection(db, 'invoices'),
    where('email', '==', userEmail.value)
  )
  onSnapshot(q, snap => {
    invoices.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
  })
}

/* ── Helpers ─────────────────────────────────── */
const formatDate = (ts) => {
  if (!ts?.toDate) return 'N/A'
  return ts.toDate().toISOString().split('T')[0]
}

const exportPDF = (inv) => {
  const exportDate = new Date().toLocaleString()
  const logoURL    = `${window.location.origin}/MaEs_logo2.png`

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

/* ── Auth → start listener ───────────────────── */
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
button { white-space: nowrap; }
</style>
