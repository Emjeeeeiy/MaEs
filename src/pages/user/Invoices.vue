<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-10">
      
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Invoice History</h1>
          <p class="text-sm font-bold text-slate-500 mt-2">Track your laboratory billings, payments, and scheduling status.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-4">
          <div class="relative group w-full sm:w-80">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Invoice ID or test name..."
              class="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl bg-slate-50/50 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-xs"
            />
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-col gap-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Status</h3>
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            @click="filterStatus = opt.value"
            :class="[
              'px-6 py-2.5 text-xs font-black rounded-2xl whitespace-nowrap transition-all border-2 shadow-sm active:scale-95',
              filterStatus === opt.value
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-100 hover:border-teal-200'
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="animate-pulse space-y-4">
          <div v-for="i in 5" :key="i" class="h-24 bg-slate-100 rounded-3xl border border-slate-200"></div>
        </div>

        <div v-else key="content">
          <!-- Empty State -->
          <div
            v-if="filteredInvoices.length === 0"
            class="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[40px] border-2 border-dashed border-slate-100"
          >
            <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
              <Receipt class="w-10 h-10 opacity-20" />
            </div>
            <p class="text-xl font-black text-slate-900">No records found</p>
            <p class="text-sm font-bold text-slate-400 mt-1">We couldn't find any invoices matching your criteria.</p>
            <button @click="resetFilters" class="mt-8 px-10 py-3.5 bg-slate-900 text-white font-black text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95">
              Reset all filters
            </button>
          </div>

          <!-- Invoice List -->
          <div v-else class="space-y-4">
            <div 
              v-for="invoice in filteredInvoices" 
              :key="invoice.id"
              @click="router.push('/payments')"
              class="group bg-white border border-slate-200 p-6 rounded-4xl hover:border-teal-300 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <!-- Hover visual accent -->
              <div class="absolute top-0 right-0 w-32 h-full bg-teal-50/30 -skew-x-12 translate-x-32 group-hover:translate-x-0 transition-transform duration-500"></div>

              <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <!-- Left: ID & Date -->
                <div class="flex items-center gap-5">
                  <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg', getStatusIconClass(invoice.status)]">
                    <Receipt class="w-7 h-7" />
                  </div>
                  <div>
                    <div class="flex items-center gap-3">
                      <span class="text-lg font-black text-slate-900 tracking-tight uppercase">#{{ invoice.shortId || invoice.id.slice(-6) }}</span>
                      <span
                        :class="[
                          'px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                          getStatusStyles(invoice.status)
                        ]"
                      >
                        {{ invoice.status }}
                      </span>
                    </div>
                    <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{{ formatDate(invoice.createdAt) }}</p>
                  </div>
                </div>

                <!-- Center: Services Chips -->
                <div class="flex-1 lg:px-10">
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="(s, idx) in invoice.services" 
                      :key="idx"
                      class="px-4 py-1.5 bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 rounded-full"
                    >
                      {{ s.serviceName }}
                    </span>
                  </div>
                </div>

                <!-- Right: Amount & Action -->
                <div class="flex items-center justify-between lg:justify-end gap-10">
                  <div class="text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-1">Total Amount</p>
                    <p class="text-2xl font-black text-slate-900 tracking-tighter">
                      ₱{{ calculateTotal(invoice).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                    </p>
                  </div>
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import UserLayout from "@/components/UserLayout.vue";
import { 
  FileText, 
  Receipt, 
  Search, 
  ChevronRight,
  ArrowRight
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useInvoices } from "@/composables/useInvoices";
import { useFormat } from "@/composables/useFormat";

const router = useRouter();
const { user } = useAuth();
const { invoices, loading, fetchUserInvoices, calculateTotal, getStatusStyles } = useInvoices();
const { formatDate } = useFormat();

const filterStatus = ref("");
const searchQuery = ref("");

const filterOptions = [
  { label: "All Records", value: "" },
  { label: "Paid", value: "Paid" },
  { label: "Pending Verification", value: "Pending" },
  { label: "Unpaid", value: "Not Paid" }
];

const filteredInvoices = computed(() => {
  const statusFilter = filterStatus.value.toLowerCase();
  const search = searchQuery.value.toLowerCase();

  return invoices.value
    .filter(invoice => {
      const status = (invoice.status || "").toLowerCase();
      const statusMatch = !statusFilter || status === statusFilter;
      const services = invoice.services?.map(s => s.serviceName).join(" ").toLowerCase() || "";
      const searchMatch = !search || 
        (invoice.shortId || "").toLowerCase().includes(search) ||
        services.includes(search);

      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      const dA = a.createdAt?.seconds || 0;
      const dB = b.createdAt?.seconds || 0;
      return dB - dA;
    });
});

const getStatusIconClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === 'paid') return 'bg-teal-600 text-white shadow-teal-500/20';
  if (s === 'pending') return 'bg-amber-500 text-white shadow-amber-500/20';
  return 'bg-rose-500 text-white shadow-rose-500/20';
};

const loadInvoices = async () => {
  if (user.value?.email) {
    await fetchUserInvoices(user.value.email);
  }
};

onMounted(loadInvoices);
watch(user, loadInvoices);

const resetFilters = () => {
  filterStatus.value = "";
  searchQuery.value = "";
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease forwards; }
</style>
