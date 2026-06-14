<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-8 md:px-10 space-y-10">
      
      <!-- Page Header & Instructions -->
      <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span class="p-2 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-500/20">
               <Receipt class="w-6 h-6" />
            </span>
            Laboratory Billing
          </h1>
          <p class="text-slate-500 mt-2 font-medium max-w-lg">
            Select the laboratory tests or clinical services you need. 
            Generating an invoice will allow you to proceed with payment and scheduling.
          </p>
          
          <!-- Step Indicator -->
          <div class="flex items-center gap-6 mt-6">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-black">1</div>
              <span class="text-xs font-bold text-slate-700">Select Tests</span>
            </div>
            <div class="w-8 h-px bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black">2</div>
              <span class="text-xs font-bold text-slate-400">Get Invoice</span>
            </div>
            <div class="w-8 h-px bg-slate-200"></div>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black">3</div>
              <span class="text-xs font-bold text-slate-400">Pay & Visit</span>
            </div>
          </div>
        </div>

        <div class="shrink-0 w-full md:w-auto flex flex-col items-end gap-3 z-10">
           <div class="relative w-full sm:w-80 group">
              <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Find a specific test or service..."
                class="w-full pl-11 pr-4 py-3 border border-slate-100 rounded-2xl bg-slate-50/50 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none transition-all shadow-inner font-medium text-sm"
              />
           </div>
           <div v-if="unpaidBalance > 0" class="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 animate-bounce">
              <AlertCircle class="w-4 h-4" />
              <span class="text-xs font-black uppercase tracking-tight">Outstanding Balance: ₱{{ unpaidBalance.toLocaleString() }}</span>
           </div>
        </div>

        <!-- Decorative BG -->
        <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <!-- Categories Filter -->
      <div class="flex flex-col gap-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter by Category</h3>
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-fade-right">
          <button
            @click="selectedCategory = ''"
            :class="[
              'px-6 py-2.5 text-xs font-black rounded-2xl whitespace-nowrap transition-all border-2 shadow-sm active:scale-95',
              selectedCategory === ''
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-100 hover:border-teal-200'
            ]"
          >
            All Services
          </button>
          <button
            v-for="cat in availableCategories"
            :key="cat"
            @click="selectedCategory = selectedCategory === cat ? '' : cat"
            :class="[
              'px-6 py-2.5 text-xs font-black rounded-2xl whitespace-nowrap transition-all border-2 shadow-sm active:scale-95',
              selectedCategory === cat
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-slate-600 border-slate-100 hover:border-teal-200 font-bold'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Main Interaction Area -->
      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
          <div class="lg:col-span-8 space-y-10">
            <div v-for="i in 2" :key="i" class="h-80 bg-slate-100 rounded-4xl"></div>
          </div>
          <div class="lg:col-span-4 h-96 bg-slate-100 rounded-4xl"></div>
        </div>

        <div v-else key="content" class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <!-- Service Lists -->
          <div class="lg:col-span-8 space-y-12">
            <div v-for="category in orderedCategories" :key="category">
              <div v-if="groupedFilteredServices[category]" class="space-y-6">
                <div class="flex items-center justify-between px-2">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                       <FileText class="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 class="text-lg font-black text-slate-900 tracking-tight">{{ category }}</h3>
                      <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest">{{ groupedFilteredServices[category].length }} Available Tests</p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="service in groupedFilteredServices[category]"
                    :key="service.id"
                    @click="toggleService(service)"
                    :class="[
                      'group relative p-5 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-[0.98]',
                      isServiceSelected(service) 
                        ? 'bg-teal-50 border-teal-500 shadow-xl shadow-teal-500/10' 
                        : 'bg-white border-slate-100 hover:border-teal-200 hover:shadow-lg'
                    ]"
                  >
                    <div class="flex justify-between items-start gap-4">
                      <div class="flex-1">
                        <h4 :class="['text-sm font-black leading-snug transition-colors', isServiceSelected(service) ? 'text-teal-900' : 'text-slate-800']">
                          {{ service.serviceName }}
                        </h4>
                        <div class="flex items-center gap-1.5 mt-2">
                          <CheckCircle2 v-if="isServiceSelected(service)" class="w-3.5 h-3.5 text-teal-600" />
                          <span :class="['text-[11px] font-bold uppercase tracking-tight', isServiceSelected(service) ? 'text-teal-600' : 'text-slate-400']">
                            {{ isServiceSelected(service) ? 'Selected' : 'Available' }}
                          </span>
                        </div>
                      </div>
                      <div class="text-right">
                        <p :class="['text-base font-black', isServiceSelected(service) ? 'text-teal-700' : 'text-slate-900']">
                          ₱{{ service.amount.toLocaleString() }}
                        </p>
                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Net Price</p>
                      </div>
                    </div>
                    
                    <!-- Selection Indicator for Mobile -->
                    <div v-if="isServiceSelected(service)" class="absolute -top-2 -right-2 w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Check class="w-3.5 h-3.5 stroke-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="Object.keys(groupedFilteredServices).length === 0"
              class="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-4xl border-2 border-dashed border-slate-100"
            >
              <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                 <SearchX class="w-10 h-10 opacity-30" />
              </div>
              <p class="text-lg font-black text-slate-900">No matching services</p>
              <p class="text-sm font-bold text-slate-400 mt-1">Try a different search term or category.</p>
              <button @click="searchQuery = ''; selectedCategory = ''" class="mt-8 px-8 py-3 bg-slate-900 text-white font-black text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                Clear all filters
              </button>
            </div>
          </div>

          <!-- Invoice Summary Sticky Sidebar -->
          <div class="lg:col-span-4 sticky top-10">
            <div class="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group/sidebar">
              <!-- Sidebar Visual Flourish -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover/sidebar:bg-teal-500/20 transition-all duration-700"></div>
              
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-8">
                  <h2 class="text-xl font-black flex items-center gap-3">
                    <ListFilter class="w-5 h-5 text-teal-400" />
                    Bill Summary
                  </h2>
                  <div class="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-teal-400 border border-white/5">
                    {{ selectedServices.length }} Items
                  </div>
                </div>

                <div class="space-y-4 min-h-25 max-h-72 overflow-y-auto custom-scroll pr-2 mb-8">
                  <div v-if="selectedServices.length === 0" class="flex flex-col items-center justify-center py-10 opacity-30 text-center space-y-3">
                    <div class="w-12 h-12 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                       <Plus class="w-6 h-6" />
                    </div>
                    <p class="text-xs font-bold leading-relaxed">Select tests from the menu <br/> to start your invoice.</p>
                  </div>
                  
                  <div 
                    v-for="item in selectedServices" 
                    :key="item.id" 
                    class="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl group/item relative overflow-hidden transition-all hover:bg-white/10"
                  >
                    <div class="flex flex-col max-w-[70%]">
                      <span class="text-xs font-black truncate">{{ item.serviceName }}</span>
                      <span class="text-[9px] text-teal-400 uppercase tracking-widest font-black mt-0.5">{{ item.category }}</span>
                    </div>
                    <div class="text-right">
                       <span class="text-xs font-black">₱{{ item.amount.toLocaleString() }}</span>
                       <button @click.stop="toggleService(item)" class="block ml-auto text-[8px] text-rose-400 font-black uppercase tracking-tighter hover:text-rose-300 mt-1 opacity-0 group-hover/item:opacity-100 transition-opacity">Remove</button>
                    </div>
                  </div>
                </div>

                <div class="border-t border-white/10 pt-8 space-y-6">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-400 font-bold uppercase tracking-widest">Total Billable Amount</span>
                    <span class="text-3xl font-black text-teal-400 tracking-tighter">
                      ₱{{ totalComputedAmount.toLocaleString() }}
                    </span>
                  </div>

                  <div class="space-y-3">
                    <button
                      @click="generateInvoice"
                      :disabled="buttonLoading || selectedServices.length === 0"
                      class="w-full py-4.5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 text-sm active:scale-95 group/btn"
                    >
                      <template v-if="buttonLoading">
                        <RefreshCw class="w-5 h-5 animate-spin" />
                        Generating...
                      </template>
                      <template v-else>
                        Generate Invoice
                        <ArrowRight class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </template>
                    </button>
                    
                    <button 
                      v-if="selectedServices.length > 0"
                      @click="selectedServices = []"
                      class="w-full py-3 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[3px] transition-colors"
                    >
                      Discard Selection
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-6 bg-indigo-50 border border-indigo-100 rounded-4xl relative overflow-hidden">
                <div class="relative z-10 flex gap-4">
                    <div class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                       <Info class="w-5 h-5" />
                    </div>
                    <div class="space-y-1">
                        <h4 class="text-xs font-black text-indigo-900 uppercase tracking-widest">What happens next?</h4>
                        <p class="text-[11px] text-indigo-700/80 leading-relaxed font-bold">
                            Generating an invoice creates a digital record. You must then pay and schedule your visit via the <b>"Invoices"</b> tab.
                        </p>
                    </div>
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
  AlertCircle,
  Receipt,
  Check,
  Plus,
  ArrowRight,
  Info,
  ListFilter,
  SearchX
} from "lucide-vue-next";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

import { useAuth } from "@/composables/useAuth";
import { useNotifications } from "@/composables/useNotifications";

export default {
  name: "BillingPage",
  components: { 
    UserLayout, FileText, List, Search, ChevronRight, RefreshCw, 
    CheckCircle2, AlertCircle, Receipt, Check, Plus, ArrowRight, 
    Info, ListFilter, SearchX 
  },
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
      unpaidBalance: 0,
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
    async fetchUnpaidBalance() {
      if (!this.user?.email) return;
      try {
        const q = query(
          collection(db, "invoices"), 
          where("email", "==", this.user.email),
          where("status", "==", "not paid")
        );
        const snap = await getDocs(q);
        this.unpaidBalance = snap.docs.reduce((sum, d) => sum + (Number(d.data().totalAmount) || 0), 0);
      } catch (err) {
        console.error("Balance fetch error:", err);
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
        this.fetchUnpaidBalance();
      } catch (err) {
        this.notifyError("Failed to generate invoice.");
      } finally { 
        this.buttonLoading = false; 
      }
    },
  },
  mounted() {
    this.fetchServices();
    this.fetchUnpaidBalance();
  },
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

.mask-fade-right {
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.rounded-4xl { border-radius: 2rem; }
.py-4\.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
</style>
