<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-950">Invoice History</h1>
          <p class="text-base text-slate-500 mt-1">Track your laboratory billings and payment statuses.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative group">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search invoice ID..."
              class="pl-11 pr-4 py-2.5 text-sm border border-slate-100 rounded-2xl bg-slate-50/70 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none w-full sm:w-72 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          @click="filterStatus = opt.value"
          :class="[
            'px-6 py-2.5 text-xs font-bold rounded-full whitespace-nowrap transition-all border',
            filterStatus === opt.value
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          ]"
        >
          {{ opt.label }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="animate-pulse space-y-6">
          <div class="h-125 bg-slate-50 border border-slate-100 rounded-4xl"></div>
        </div>

        <div v-else key="content">
          <div
            v-if="filteredInvoices.length === 0"
            class="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200"
          >
            <div class="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
              <FileText class="w-10 h-10 text-slate-200" />
            </div>
            <p class="text-xl font-bold text-slate-900">No records found</p>
            <p class="text-sm mt-1">We couldn't find any invoices matching your criteria.</p>
            <button @click="resetFilters" class="mt-6 text-teal-600 font-bold text-sm underline underline-offset-4">Reset all filters</button>
          </div>

          <div v-else class="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 border-b border-slate-100">
                    <th class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
                    <th class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Services</th>
                    <th class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
                    <th class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr 
                    v-for="invoice in filteredInvoices" 
                    :key="invoice.id"
                    class="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td class="px-6 py-5 whitespace-nowrap">
                      <span class="text-sm font-bold text-slate-700">{{ formatDate(invoice.createdAt) }}</span>
                    </td>

                    <td class="px-6 py-5">
                      <div class="flex items-center gap-2">
                        <Receipt class="w-4 h-4 text-slate-300" />
                        <span class="text-xs font-black text-slate-900 uppercase">#{{ invoice.shortId || invoice.id.slice(-6) }}</span>
                      </div>
                    </td>

                    <td class="px-6 py-5">
                      <div class="flex flex-wrap gap-1 max-w-62.5">
                        <span 
                          v-for="(s, idx) in invoice.services" 
                          :key="idx"
                          class="inline-block px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-md"
                        >
                          {{ s.serviceName }}
                        </span>
                      </div>
                    </td>

                    <td class="px-6 py-5 text-right whitespace-nowrap">
                      <span class="text-sm font-black text-slate-950">
                        ₱{{ calculateTotal(invoice).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                      </span>
                    </td>

                    <td class="px-6 py-5 text-center whitespace-nowrap">
                      <span
                        :class="[
                          'px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter',
                          getStatusStyles(invoice.status)
                        ]"
                      >
                        {{ invoice.status }}
                      </span>
                    </td>

                    <td class="px-6 py-5 text-right">
                      <button class="p-2 hover:bg-teal-50 text-teal-600 rounded-xl transition-all group-hover:translate-x-1">
                        <ChevronRight class="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import UserLayout from "@/components/UserLayout.vue";
import { 
  FileText, 
  Receipt, 
  Search, 
  ChevronRight 
} from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useInvoices } from "@/composables/useInvoices";
import { useFormat } from "@/composables/useFormat";

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

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeIn 0.4s ease forwards; }
</style>