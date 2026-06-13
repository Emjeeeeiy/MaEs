<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-6 bg-teal-500 rounded-full"></div>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">Lab Results</h1>
          </div>
          <p class="text-sm text-slate-500 ml-3.5">View and download your official laboratory findings.</p>
        </div>
        
        <button
          @click="refresh"
          class="flex items-center gap-2 px-5 py-2 text-[11px] font-bold uppercase tracking-wider bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Sync Records
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
           <div v-for="i in 3" :key="i" class="bg-slate-50 border border-slate-100 rounded-3xl h-96"></div>
        </div>

        <div v-else key="content">
          <div
            v-if="invoices.length === 0"
            class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200"
          >
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <FlaskConical class="w-8 h-8 text-slate-200" />
            </div>
            <p class="text-lg font-bold text-slate-900">No results found</p>
            <p class="text-xs mt-1">Your reports will appear here once processed.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="inv in invoices"
              :key="inv.id"
              class="group bg-white rounded-3xl border border-slate-200 hover:border-teal-200 transition-all hover:shadow-xl hover:shadow-slate-200/40 flex flex-col overflow-hidden"
            >
              <div class="p-6 pb-4 flex justify-between items-start">
                <div class="space-y-1">
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Released On</span>
                  <h3 class="text-base font-bold text-slate-900">{{ formatDate(inv.createdAt) }}</h3>
                </div>
                <button
                  @click="exportPDF(inv)"
                  class="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/10 active:scale-95"
                  title="Download PDF"
                >
                  <Download class="w-4 h-4" />
                </button>
              </div>

              <div class="px-6 mb-4">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight border',
                    inv.status === 'Paid' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                  ]"
                >
                  {{ inv.status === 'Paid' ? 'Verified Result' : 'Pending Verification' }}
                </span>
              </div>

              <div class="flex-1 px-6 pb-6">
                <div class="bg-slate-50 p-5 space-y-4 rounded-2xl border border-slate-100">
                  <div class="flex items-center gap-2 mb-1">
                    <ClipboardCheck class="w-3.5 h-3.5 text-teal-600" />
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Medical Findings</span>
                  </div>

                  <div class="space-y-4">
                    <div
                      v-for="svc in inv.services"
                      :key="svc.serviceName"
                      class="relative pl-3 border-l-2 border-teal-200"
                    >
                      <p class="text-[11px] font-bold text-slate-900 mb-0.5 uppercase tracking-tight">{{ svc.serviceName }}</p>
                      <div class="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                        {{ svc.result || 'Analysis in progress...' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-6 py-4 bg-slate-900 text-white/40 flex justify-between items-center mt-auto">
                 <span class="text-[8px] font-bold uppercase tracking-widest">MaEs Diagnostic Hub</span>
                 <div class="flex gap-1">
                    <div class="w-1 h-1 rounded-full bg-teal-500"></div>
                    <div class="w-1 h-1 rounded-full bg-teal-500/50"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

import UserLayout from '@/components/UserLayout.vue'
import { 
  RefreshCw, FlaskConical, Download, 
  ClipboardCheck, ChevronRight 
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const { user, loading: authLoading } = useAuth()
const invoices = ref([])
const dataLoading = ref(true)
const loading = computed(() => authLoading.value || dataLoading.value)

let unsubscribeSnapshot = null

const listenForInvoices = () => {
  if (!user.value?.email) return
  
  if (unsubscribeSnapshot) unsubscribeSnapshot()

  const q = query(collection(db, 'invoices'), where('email', '==', user.value.email))
  unsubscribeSnapshot = onSnapshot(q, snap => {
    invoices.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    dataLoading.value = false
  })
}

const formatDate = (ts) => {
  if (!ts?.toDate) return 'N/A'
  return ts.toDate().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const exportPDF = async (inv) => {
  const html2pdf = (await import('html2pdf.js')).default;
  const exportDate = new Date().toLocaleString()
  const logoURL = `${window.location.origin}/MaEs_logo2.png`

  const serviceItems = inv.services?.map(s => `
    <div style="margin-bottom: 20px; border-left: 4px solid #0d9488; padding-left: 15px;">
      <h4 style="margin: 0; color: #0f172a; font-size: 14px; text-transform: uppercase;">${s.serviceName}</h4>
      <p style="margin: 5px 0 0; color: #475569; font-size: 12px; font-style: italic; line-height: 1.5;">
        ${s.result ? s.result.replace(/\n/g, '<br>') : '<em>Result processing...</em>'}
      </p>
    </div>
  `).join('') || '<p>No services listed</p>'

  const html = `
    <div style="font-family: sans-serif; padding: 40px; color: #0f172a;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="margin: 0; color: #0d9488; font-size: 24px;">Laboratory Report</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 12px;">MaEs Diagnostic & Laboratory Center</p>
        </div>
        <img src="${logoURL}" alt="Logo" style="height: 50px;" />
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          <p><strong>Patient Email:</strong> ${inv.email}</p>
          <p><strong>Report ID:</strong> ${inv.id.toUpperCase()}</p>
        </div>
        <div style="text-align: right;">
          <p><strong>Released On:</strong> ${formatDate(inv.createdAt)}</p>
          <p><strong>Export Date:</strong> ${exportDate}</p>
        </div>
      </div>

      <h3 style="font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px;">Diagnostic Results</h3>
      ${serviceItems}

      <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #94a3b8; text-align: center;">
        <p>This is a computer-generated document. For official medical use, please consult your physician.</p>
      </div>
    </div>
  `

  html2pdf()
    .from(html)
    .set({
      margin: 0.5,
      filename: `MaEs_Result_${formatDate(inv.createdAt)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    })
    .save()
}

const refresh = () => {
  dataLoading.value = true
  listenForInvoices()
}

onMounted(listenForInvoices)
watch(user, listenForInvoices)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease forwards; }

/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
