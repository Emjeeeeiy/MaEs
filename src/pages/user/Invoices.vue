<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Invoice History</h1>
          <p class="text-sm text-slate-500 mt-1">Track your laboratory billings and payment statuses.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search ID or services..."
              class="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="opt in filterOptions"
          :key="opt.value"
          @click="filterStatus = opt.value"
          :class="[
            'px-5 py-2 text-[11px] font-bold rounded-full whitespace-nowrap transition-all border',
            filterStatus === opt.value
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          ]"
        >
          {{ opt.label }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="animate-pulse">
          <div class="h-96 bg-slate-50 border border-slate-100 rounded-2xl"></div>
        </div>

        <div v-else key="content">
          <div
            v-if="filteredInvoices.length === 0"
            class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
          >
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <FileText class="w-8 h-8 text-slate-200" />
            </div>
            <p class="text-lg font-bold text-slate-900">No records found</p>
            <p class="text-xs mt-1">Try adjusting your filters or search.</p>
            <button @click="resetFilters" class="mt-4 text-teal-600 font-bold text-xs underline underline-offset-4">Reset all filters</button>
          </div>

          <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice ID</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Services</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr 
                    v-for="invoice in filteredInvoices" 
                    :key="invoice.id"
                    class="hover:bg-slate-50 transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-xs font-bold text-slate-600">{{ formatDate(invoice.createdAt) }}</span>
                    </td>

                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <Receipt class="w-3.5 h-3.5 text-slate-400" />
                        <span class="text-[11px] font-bold text-slate-900 uppercase">#{{ invoice.shortId || invoice.id.slice(-6) }}</span>
                      </div>
                    </td>

                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-1 max-w-xs">
                        <span 
                          v-for="(s, idx) in invoice.services" 
                          :key="idx"
                          class="px-2 py-0.5 bg-slate-100 text-[9px] font-bold text-slate-500 rounded"
                        >
                          {{ s.serviceName }}
                        </span>
                      </div>
                    </td>

                    <td class="px-6 py-4 text-right whitespace-nowrap">
                      <span class="text-xs font-bold text-slate-900">
                        ₱{{ calculateTotal(invoice).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                      </span>
                    </td>

                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        :class="[
                          'px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight',
                          getStatusStyles(invoice.status)
                        ]"
                      >
                        {{ invoice.status }}
                      </span>
                    </td>

                    <td class="px-6 py-4 text-right">
                      <button class="p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg transition-all">
                        <ChevronRight class="w-4 h-4" />
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
