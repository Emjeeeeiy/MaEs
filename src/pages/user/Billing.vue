<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-8">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Billing Services</h1>
          <p class="text-sm text-slate-500 mt-1">Select services to generate an invoice.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search services..."
              class="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          @click="selectedCategory = ''"
          :class="[
            'px-4 py-1.5 text-[11px] font-bold rounded-full whitespace-nowrap transition-all border',
            selectedCategory === ''
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          ]"
        >
          All Services
        </button>
        <button
          v-for="cat in availableCategories"
          :key="cat"
          @click="selectedCategory = selectedCategory === cat ? '' : cat"
          :class="[
            'px-4 py-1.5 text-[11px] font-bold rounded-full whitespace-nowrap transition-all border',
            selectedCategory === cat
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-pulse">
          <div class="lg:col-span-3 space-y-8">
            <div v-for="i in 3" :key="i" class="space-y-4">
              <div class="h-4 bg-slate-100 rounded w-1/4"></div>
              <div class="h-48 bg-slate-50 border border-slate-100 rounded-2xl"></div>
            </div>
          </div>
          <div class="lg:col-span-1">
            <div class="h-80 bg-slate-50 rounded-2xl border border-slate-100"></div>
          </div>
        </div>

        <div v-else key="content" class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          <div class="lg:col-span-3 space-y-10">
            <div v-for="category in orderedCategories" :key="category">
              <div v-if="groupedFilteredServices[category]" class="space-y-4">
                <div class="flex items-center gap-3 ml-1">
                  <div class="h-4 w-1 bg-teal-500 rounded-full"></div>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">{{ category }}</h3>
                  <span class="text-[10px] text-slate-400 font-medium">({{ groupedFilteredServices[category].length }})</span>
                </div>

                <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th class="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 w-12 text-center">Select</th>
                        <th class="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Service Name</th>
                        <th class="px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Fee (PHP)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                      <tr
                        v-for="service in groupedFilteredServices[category]"
                        :key="service.id"
                        @click="toggleService(service)"
                        :class="[
                          'group cursor-pointer transition-colors',
                          isServiceSelected(service) ? 'bg-teal-50/50' : 'hover:bg-slate-50/30'
                        ]"
                      >
                        <td class="px-5 py-3 text-center">
                          <input
                            type="checkbox"
                            :checked="isServiceSelected(service)"
                            class="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 transition-all"
                          />
                        </td>
                        <td class="px-5 py-3">
                          <div class="flex items-center gap-2.5">
                            <FileText :class="['w-3.5 h-3.5', isServiceSelected(service) ? 'text-teal-600' : 'text-slate-300']" />
                            <span :class="['text-sm font-semibold', isServiceSelected(service) ? 'text-teal-900' : 'text-slate-700']">
                              {{ service.serviceName }}
                            </span>
                          </div>
                        </td>
                        <td class="px-5 py-3 text-right">
                          <span :class="['text-sm font-bold', isServiceSelected(service) ? 'text-teal-700' : 'text-slate-900']">
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
              class="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
            >
              <Search class="w-10 h-10 opacity-20 mb-3" />
              <p class="text-sm font-semibold">No services match your search.</p>
              <button @click="searchQuery = ''; selectedCategory = ''" class="mt-2 text-teal-600 font-bold text-xs">Clear all filters</button>
            </div>
          </div>

          <div class="lg:col-span-1 sticky top-8">
            <div class="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <h2 class="text-lg font-bold mb-6 flex items-center gap-2">
                <List class="w-4 h-4 text-teal-400" />
                Invoice Summary
              </h2>

              <div class="space-y-4 max-h-72 overflow-y-auto no-scrollbar mb-8">
                <div v-if="selectedServices.length === 0" class="py-10 text-center opacity-40">
                  <p class="text-xs italic">No services selected.</p>
                </div>
                
                <div 
                  v-for="item in selectedServices" 
                  :key="item.id" 
                  class="flex justify-between items-center animate-fade-in"
                >
                  <div class="flex flex-col max-w-[70%]">
                    <span class="text-[11px] font-bold truncate">{{ item.serviceName }}</span>
                    <span class="text-[9px] text-teal-400 uppercase tracking-tight">{{ item.category }}</span>
                  </div>
                  <span class="text-xs font-mono">₱{{ item.amount }}</span>
                </div>
              </div>

              <div class="border-t border-white/10 pt-6 space-y-4">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-400 font-medium">Total Items</span>
                  <span class="font-bold">{{ selectedServices.length }}</span>
                </div>
                <div class="flex justify-between items-end">
                  <span class="text-xs text-slate-400 font-medium mb-1">Grand Total</span>
                  <span class="text-2xl font-black text-teal-400 tracking-tight">
                    ₱{{ totalComputedAmount.toLocaleString() }}
                  </span>
                </div>

                <button
                  @click="generateInvoice"
                  :disabled="buttonLoading || selectedServices.length === 0"
                  class="w-full mt-4 py-3.5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 text-sm"
                >
                  <template v-if="buttonLoading">
                    <RefreshCw class="w-4 h-4 animate-spin" />
                    Processing...
                  </template>
                  <template v-else>
                    Generate Invoice
                    <ChevronRight class="w-4 h-4" />
                  </template>
                </button>
              </div>
            </div>
            
            <div class="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                <div class="flex gap-3">
                    <FileText class="w-4 h-4 text-teal-600 mt-0.5 shrink-0"/>
                    <p class="text-[11px] text-teal-800 leading-relaxed font-medium">
                        Generated invoices are marked as <b>"Not Paid"</b>. Visit the <b>Invoices</b> tab to settle.
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
