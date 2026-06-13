<template>
  <UserLayout>
    <div v-if="loading" class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-8 animate-pulse">
      <div class="h-8 bg-slate-100 rounded-xl w-1/4"></div>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-48 bg-slate-50 border border-slate-100 rounded-2xl"></div>
        </div>
        <div class="lg:col-span-1">
          <div class="h-72 bg-slate-100 rounded-3xl border border-slate-100"></div>
        </div>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Outstanding Dues</h1>
          <p class="text-sm text-slate-500 mt-1">Review and settle your laboratory invoices.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        <div class="lg:col-span-3">
          <div v-if="filteredInvoices.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Receipt class="w-10 h-10 opacity-20 mb-3" />
            <p class="text-sm font-semibold">No unpaid invoices found.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="invoice in filteredInvoices"
              :key="invoice.id"
              @click="toggleSelection(invoice)"
              :class="[
                'group relative p-6 border rounded-2xl transition-all cursor-pointer flex flex-col justify-between h-full min-h-48',
                selectedInvoiceIds.includes(invoice.id) 
                  ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-200' 
                  : 'bg-white border-slate-200 hover:border-teal-100',
                invoice.status === 'Flagged' ? 'opacity-60 grayscale pointer-events-none' : ''
              ]"
            >
              <div class="absolute top-4 right-4">
                <div :class="['w-5 h-5 rounded-full border flex items-center justify-center transition-all', selectedInvoiceIds.includes(invoice.id) ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white']">
                  <CheckCircle2 v-if="selectedInvoiceIds.includes(invoice.id)" class="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <div class="flex items-center gap-2 mb-4">
                  <Calendar class="w-4 h-4 text-slate-400" />
                  <span class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{{ formatDate(invoice.createdAt) }}</span>
                </div>

                <h4 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Services</h4>
                <ul class="space-y-1 mb-6">
                  <li v-for="s in invoice.services" :key="s.serviceName" class="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    {{ s.serviceName }}
                  </li>
                </ul>
              </div>

              <div class="flex items-end justify-between pt-4 border-t border-slate-100">
                <div>
                  <span class="text-[9px] text-slate-400 font-bold uppercase block">Amount</span>
                  <span class="text-lg font-bold text-slate-900">₱{{ calculateTotal(invoice).toFixed(2) }}</span>
                </div>
                <div v-if="invoice.status === 'Flagged'" class="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold border border-red-100">
                  FLAGGED
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 sticky top-8">
          <div class="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
              <Receipt class="w-4 h-4 text-teal-400" />
              Payment Summary
            </h2>

            <div class="space-y-4 max-h-60 overflow-y-auto no-scrollbar mb-8">
              <div v-if="selectedInvoiceIds.length === 0" class="py-10 text-center opacity-40">
                <p class="text-xs italic">Select invoices to pay</p>
              </div>
              
              <div 
                v-for="id in selectedInvoiceIds" 
                :key="id" 
                class="flex justify-between items-center animate-fade-in"
              >
                <span class="text-[11px] font-bold truncate max-w-[60%]">Invoice #{{ id.slice(-6) }}</span>
                <span class="text-xs font-mono text-teal-400">₱{{ getInvoiceTotalById(id).toFixed(2) }}</span>
              </div>
            </div>

            <div class="border-t border-white/10 pt-6 space-y-4">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-400 font-medium">Selected</span>
                <span class="font-bold">{{ selectedInvoiceIds.length }}</span>
              </div>
              <div class="flex justify-between items-end">
                <span class="text-xs text-slate-400 font-medium mb-1">Total Payable</span>
                <span class="text-2xl font-black text-teal-400 tracking-tight">
                  ₱{{ totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </div>

              <button
                @click="openPaymentModal"
                :disabled="processingPayment || selectedInvoiceIds.length === 0"
                class="w-full mt-4 py-3.5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 text-sm"
              >
                <template v-if="processingPayment">
                  <RefreshCw class="w-4 h-4 animate-spin" />
                  Processing...
                </template>
                <template v-else>
                  Submit Payment
                  <ChevronRight class="w-4 h-4" />
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Transition name="fade">
      <div v-if="showPaymentMethodModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-100 p-6">
        <div class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl animate-fade-in border border-slate-100">
          <h3 class="text-lg font-bold text-slate-900 mb-6 text-center">Payment Method</h3>
          <div class="grid grid-cols-1 gap-3">
            <button @click="handlePaymentMethod('Cash')" class="flex items-center justify-between p-4 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-all font-bold text-slate-900 text-sm">
              Cash at Counter
              <ChevronRight class="w-3.5 h-3.5 text-slate-300" />
            </button>
            <button @click="handlePaymentMethod('GCash')" class="flex items-center justify-between p-4 bg-blue-50/30 hover:bg-blue-50 border border-blue-100 rounded-xl transition-all font-bold text-blue-700 text-sm">
              GCash Digital
              <img src="/gcash_logo.jpg" class="w-7 h-7 rounded-lg object-contain" />
            </button>
          </div>
          <button @click="showPaymentMethodModal = false" class="w-full mt-6 text-slate-400 text-xs font-bold hover:text-red-500 transition">Cancel</button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showGCashModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-100 p-6">
        <div class="bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl animate-fade-in border-2 border-blue-500">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-lg font-bold text-slate-900">GCash Transfer</h3>
            <img src="/gcash_logo.jpg" class="w-10 h-10 rounded-lg" />
          </div>
          
          <div class="bg-blue-50/50 rounded-xl p-4 text-center mb-6">
             <img src="/gcash-qr2.jpeg" class="w-40 mx-auto rounded shadow-sm" />
             <p class="text-[9px] text-blue-600 mt-2 font-bold uppercase tracking-widest">Scan QR to Pay</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reference Number</label>
              <input v-model="gcashReferenceNumber" type="text" placeholder="13-digit number" class="w-full border-slate-200 bg-slate-50 px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Receipt</label>
              <input type="file" @change="convertToBase64" class="w-full text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            </div>
          </div>

          <div class="flex flex-col gap-2 mt-8">
            <button @click="handleGCashSubmit" :disabled="processingPayment" class="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm">
               <RefreshCw v-if="processingPayment" class="w-4 h-4 animate-spin" />
               Submit Transaction
            </button>
            <button @click="showGCashModal = false" class="text-slate-400 text-xs font-bold py-2">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import UserLayout from "@/components/UserLayout.vue";
import { Search, Calendar, Receipt, CheckCircle2, RefreshCw, ChevronRight } from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useInvoices } from "@/composables/useInvoices";
import { useFormat } from "@/composables/useFormat";
import { useNotifications } from "@/composables/useNotifications";

const { user } = useAuth();
const { invoices, loading, fetchUserInvoices, calculateTotal, submitPayment } = useInvoices();
const { formatDate } = useFormat();
const { success, error: notifyError } = useNotifications();

const selectedInvoiceIds = ref([]);
const processingPayment = ref(false);
const searchQuery = ref("");
const showPaymentMethodModal = ref(false);
const showGCashModal = ref(false);
const gcashReferenceNumber = ref("");
const gcashImageBase64 = ref("");

const filteredInvoices = computed(() => {
  const search = searchQuery.value.toLowerCase();
  return invoices.value
    .filter(inv => {
      const matchesSearch = !search || 
        inv.services.some(s => s.serviceName.toLowerCase().includes(search)) ||
        formatDate(inv.createdAt).includes(search);
      return matchesSearch;
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
});

const totalPayable = computed(() => {
  return selectedInvoiceIds.value.reduce((sum, id) => sum + getInvoiceTotalById(id), 0);
});

const getInvoiceTotalById = (id) => {
  const inv = invoices.value.find(i => i.id === id);
  return inv ? calculateTotal(inv) : 0;
};

const toggleSelection = (invoice) => {
  if (invoice.status === 'Flagged') return;
  const index = selectedInvoiceIds.value.indexOf(invoice.id);
  if (index > -1) {
    selectedInvoiceIds.value.splice(index, 1);
  } else {
    selectedInvoiceIds.value.push(invoice.id);
  }
};

const loadInvoices = async () => {
  if (user.value?.email) {
    await fetchUserInvoices(user.value.email, "not paid");
  }
};

onMounted(loadInvoices);
watch(user, loadInvoices);

const openPaymentModal = () => {
  showPaymentMethodModal.value = true;
};

const handlePaymentMethod = async (method) => {
  showPaymentMethodModal.value = false;
  if (method === "GCash") {
    showGCashModal.value = true;
  } else {
    await markInvoicesPending("Cash");
  }
};

const markInvoicesPending = async (method, receiptBase64 = "") => {
  if (method === "GCash" && (!gcashReferenceNumber.value || !receiptBase64)) {
    notifyError("Please provide the reference number and receipt image.");
    return;
  }

  processingPayment.value = true;
  try {
    const gcashData = method === "GCash" ? {
      receiptBase64,
      referenceNumber: gcashReferenceNumber.value
    } : {};

    await submitPayment(selectedInvoiceIds.value, user.value.email, method, gcashData);

    success("Payment submitted for verification.");
    selectedInvoiceIds.value = [];
    gcashReferenceNumber.value = "";
    gcashImageBase64.value = "";
    await loadInvoices();
  } catch (err) {
    console.error(err);
    notifyError("Failed to submit payment. Please try again.");
  } finally {
    processingPayment.value = false;
  }
};

const handleGCashSubmit = async () => {
  await markInvoicesPending("GCash", gcashImageBase64.value);
  showGCashModal.value = false;
};

const convertToBase64 = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { gcashImageBase64.value = e.target.result; };
  reader.readAsDataURL(file);
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
