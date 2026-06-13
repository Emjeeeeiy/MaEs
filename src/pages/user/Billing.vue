<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-950">Billing Services</h1>
          <p class="text-base text-slate-500 mt-1">Select laboratory services to generate a new invoice.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative group">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search service name..."
              class="pl-11 pr-4 py-2.5 text-sm border border-slate-100 rounded-2xl bg-slate-50/70 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none w-full sm:w-80 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          @click="selectedCategory = ''"
          :class="[
            'px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all border',
            selectedCategory === ''
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          ]"
        >
          All Services
        </button>
        <button
          v-for="cat in availableCategories"
          :key="cat"
          @click="selectedCategory = selectedCategory === cat ? '' : cat"
          :class="[
            'px-5 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all border',
            selectedCategory === cat
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200'
              : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
          <div class="lg:col-span-3 space-y-10">
            <div v-for="i in 3" :key="i" class="space-y-4">
              <div class="h-6 bg-slate-100 rounded w-1/4"></div>
              <div class="h-64 bg-slate-50 border border-slate-100 rounded-3xl"></div>
            </div>
          </div>
          <div class="lg:col-span-1">
            <div class="h-96 bg-slate-900/5 rounded-4xl border border-slate-100"></div>
          </div>
        </div>

        <div v-else key="content" class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          <div class="lg:col-span-3 space-y-10">
            <div v-for="category in orderedCategories" :key="category">
              <div v-if="groupedFilteredServices[category]" class="space-y-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="h-6 w-1 bg-teal-500 rounded-full"></div>
                  <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-widest">{{ category }}</h3>
                  <span class="text-xs text-slate-400 font-medium">({{ groupedFilteredServices[category].length }} items)</span>
                </div>

                <div class="overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12">Select</th>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Service Name</th>
                        <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Fee (PHP)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                      <tr
                        v-for="service in groupedFilteredServices[category]"
                        :key="service.id"
                        @click="toggleService(service)"
                        :class="[
                          'group cursor-pointer transition-colors',
                          isServiceSelected(service) ? 'bg-teal-50/30' : 'hover:bg-slate-50/50'
                        ]"
                      >
                        <td class="px-6 py-4">
                          <div class="flex items-center justify-center">
                            <input
                              type="checkbox"
                              :checked="isServiceSelected(service)"
                              class="h-5 w-5 rounded-lg border-slate-300 text-teal-600 focus:ring-teal-500 transition-all"
                            />
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <FileText :class="['w-4 h-4 transition-colors', isServiceSelected(service) ? 'text-teal-600' : 'text-slate-300 group-hover:text-teal-400']" />
                            <span :class="['text-sm font-semibold transition-colors', isServiceSelected(service) ? 'text-teal-900' : 'text-slate-700']">
                              {{ service.serviceName }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <span :class="['text-sm font-bold font-mono', isServiceSelected(service) ? 'text-teal-700' : 'text-slate-900']">
                            ₱{{ service.amount.toLocaleString() }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div
              v-if="Object.keys(groupedFilteredServices).length === 0"
              class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200"
            >
              <Search class="w-12 h-12 opacity-20 mb-3" />
              <p class="text-lg font-semibold">No services match your search.</p>
              <button @click="searchQuery = ''; selectedCategory = ''" class="mt-2 text-teal-600 font-bold text-sm">Clear all filters</button>
            </div>
          </div>

          <div class="lg:col-span-1 sticky top-6">
            <div class="bg-slate-950 rounded-4xl p-8 text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden">
              <div class="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
              
              <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                <List class="w-5 h-5 text-teal-400" />
                Invoice Summary
              </h2>

              <div class="space-y-4 max-h-75 overflow-y-auto no-scrollbar mb-8">
                <div v-if="selectedServices.length === 0" class="py-10 text-center opacity-40">
                  <p class="text-sm italic">No services selected yet.</p>
                </div>
                
                <div 
                  v-for="item in selectedServices" 
                  :key="item.id" 
                  class="flex justify-between items-center group animate-fade-in"
                >
                  <div class="flex flex-col max-w-[70%]">
                    <span class="text-xs font-bold truncate">{{ item.serviceName }}</span>
                    <span class="text-[10px] text-teal-400 uppercase tracking-tighter">{{ item.category }}</span>
                  </div>
                  <span class="text-sm font-mono">₱{{ item.amount }}</span>
                </div>
              </div>

              <div class="border-t border-white/10 pt-6 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-slate-400">Total Items</span>
                  <span class="text-sm font-bold">{{ selectedServices.length }}</span>
                </div>
                <div class="flex justify-between items-end">
                  <span class="text-sm text-slate-400">Grand Total</span>
                  <span class="text-3xl font-black text-teal-400 tracking-tighter">
                    ₱{{ totalComputedAmount.toLocaleString() }}
                  </span>
                </div>

                <button
                  @click="generateInvoice"
                  :disabled="buttonLoading || selectedServices.length === 0"
                  class="w-full mt-4 py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <template v-if="buttonLoading">
                    <RefreshCw class="w-5 h-5 animate-spin" />
                    Processing...
                  </template>
                  <template v-else>
                    Generate Invoice
                    <ChevronRight class="w-5 h-5" />
                  </template>
                </button>
              </div>
            </div>
            
            <div class="mt-4 p-5 bg-teal-50 border border-teal-100 rounded-3xl">
                <div class="flex gap-3">
                    <div class="text-teal-600"><FileText class="w-5 h-5"/></div>
                    <p class="text-xs text-teal-800 leading-relaxed">
                        Generated invoices are marked as <b>"Not Paid"</b> by default. Use the <b>Invoices</b> tab to settle payments.
                    </p>
                </div>
            </div>
          </div>

        </div>
      </transition>
    </div>
  </UserLayout>
</template>

<script>
import UserLayout from "@/components/UserLayout.vue";
import { 
  FileText, 
  List, 
  Search, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-vue-next";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { useAuth } from "@/composables/useAuth";
import { useNotifications } from "@/composables/useNotifications";

export default {
  name: "BillingPage",
  components: { UserLayout, FileText, List, Search, ChevronRight, RefreshCw, CheckCircle2, AlertCircle },
  setup() {
    const { user } = useAuth();
    const { success, error: notifyError } = useNotifications();
    return { user, success, notifyError };
  },
  data() {
    return {
      services: [],
      selectedServices: [],
      searchQuery: "",
      selectedCategory: "",
      loading: true,
      buttonLoading: false,
      orderedCategories: [
        "CHEMISTRY","SPECIAL CHEMISTRY","ELECTROLYTES","CLINICAL MICROSCOPY",
        "SPECIAL MICROSCOPY","URINE CHEMISTRY","HEMATOLOGY","SEROLOGY",
        "IMMUNOLOGY","THYROID PROFILE","HORMONES","CARDIAC MARKER",
        "TUMOR MARKER","DRUG TEST","HISTOPATHOLOGY","BLOOD STATION",
        "TB-DOTS","OTHERS","PACKAGES","SEND OUT","MICROBIOLOGY",
      ],
    };
  },
  computed: {
    availableCategories() {
      const categories = this.services.map((s) => s.category || "Uncategorized");
      return [...new Set(categories)].sort();
    },
    filteredServices() {
      const query = this.searchQuery.toLowerCase();
      return this.services.filter((s) => {
        const matchesQuery = s.serviceName.toLowerCase().includes(query);
        const matchesCategory = this.selectedCategory ? s.category === this.selectedCategory : true;
        return matchesQuery && matchesCategory;
      });
    },
    groupedFilteredServices() {
      const grouped = this.filteredServices.reduce((groups, s) => {
        const cat = s.category || "Uncategorized";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(s);
        return groups;
      }, {});
      return grouped;
    },
    totalComputedAmount() {
      return this.selectedServices.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    }
  },
  methods: {
    toggleService(service) {
      const index = this.selectedServices.findIndex(s => s.id === service.id);
      if (index > -1) {
        this.selectedServices.splice(index, 1);
      } else {
        this.selectedServices.push(service);
      }
    },
    isServiceSelected(service) {
      return this.selectedServices.some(s => s.id === service.id);
    },
    async fetchServices() {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        this.services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        this.notifyError("Failed to fetch services");
      } finally { 
        this.loading = false; 
      }
    },
    generateShortId() { return `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`; },
    async generateInvoice() {
      if (!this.selectedServices.length) return this.notifyError("Select at least one service.");
      if (!this.user) return this.notifyError("You must be logged in.");

      this.buttonLoading = true;
      try {
        const shortId = this.generateShortId();
        await addDoc(collection(db, "invoices"), {
          email: this.user.email,
          services: this.selectedServices,
          totalAmount: this.totalComputedAmount,
          status: "not paid",
          createdAt: serverTimestamp(),
          shortId,
        });
        this.selectedServices = [];
        this.success(`Invoice ${shortId} generated! check your invoices tab.`);
      } catch (err) {
        this.notifyError("Failed to generate invoice.");
      } finally { 
        this.buttonLoading = false; 
      }
    },
  },
  mounted() {
    this.fetchServices();
  },
};
</script>

<style scoped>
/* Custom Scrollbar for the Invoice Summary */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(20px) translateX(-50%);
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>    