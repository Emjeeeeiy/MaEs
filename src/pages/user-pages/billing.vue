<template>
  <div class="flex flex-col h-screen bg-gray-50 text-gray-800 overflow-hidden">
    <!-- Fixed Topbar -->
    <div class="flex-shrink-0 z-10 bg-white shadow-sm border-b border-gray-200">
      <Topbar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />
    </div>

    <!-- Mobile Sidebar -->
    <Sidebar
      :is-mobile-sidebar-open="isMobileSidebarOpen"
      @close-sidebar="isMobileSidebarOpen = false"
      class="sm:hidden"
    />

    <!-- Desktop Sidebar + Main Content -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar (desktop) -->
      <aside class="w-64 flex-shrink-0 hidden sm:flex flex-col bg-white shadow-md">
        <Sidebar :is-mobile-sidebar-open="true" />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto h-full p-4 sm:p-6 space-y-4 bg-gray-50">
        <transition name="fade" mode="out-in">
          <!-- Loading State -->
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[250px]">
            <LoadingAnimation />
          </div>

          <!-- Main Content -->
          <div v-else key="content" class="space-y-4 animate-fade-in flex flex-col">

            <!-- ========================= SEARCH & FILTER SECTION ========================= -->
            <section class="bg-white p-3 sm:p-4 rounded-xl shadow-sm space-y-2">
              <!-- Mobile Search Icon -->
              <div class="sm:hidden flex justify-start mb-1">
                <button @click="toggleMobileSearch" class="p-2 rounded-full hover:bg-gray-100 transition">
                  <Search class="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <!-- Mobile Search Input -->
              <transition name="slide-down">
                <div v-if="showMobileSearch" class="sm:hidden mb-1">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search service..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-xs shadow-sm"
                  />
                </div>
              </transition>

              <!-- Category Pills -->
              <div class="sticky top-0 bg-gray-50 pt-2 pb-2 z-20 overflow-x-auto no-scrollbar flex gap-2">
                <button
                  v-for="cat in availableCategories"
                  :key="cat"
                  @click="selectedCategory = selectedCategory === cat ? '' : cat"
                  :class="[ 
                    'flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-xs transition-all whitespace-nowrap shadow-sm hover:scale-105 hover:shadow-md',
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-blue-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ cat }}
                </button>
              </div>
            </section>

            <!-- ========================= SERVICES GRID SECTION ========================= -->
            <section class="space-y-3">
              <div v-for="category in orderedCategories" :key="category" class="space-y-1">
                <div v-if="groupedFilteredServices[category]">
                  <h3 class="flex items-center gap-1.5 text-xs font-semibold text-green-600 mt-2 mb-1 py-1 border-b">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    <List class="w-3 h-3" /> {{ category }}
                  </h3>

                  <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <label
                      v-for="service in groupedFilteredServices[category]"
                      :key="service.id"
                      class="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-white hover:shadow-md cursor-pointer transition"
                    >
                      <div class="flex items-center gap-1">
                        <input
                          type="checkbox"
                          :value="service"
                          v-model="selectedServices"
                          class="form-checkbox text-blue-600 h-4 w-4"
                        />
                        <span class="text-xs text-gray-800 font-medium flex items-center gap-1">
                          <FileText class="w-3 h-3 text-gray-500" /> {{ service.serviceName }}
                        </span>
                      </div>
                      <span class="text-xs font-semibold text-gray-700">
                        ₱{{ service.amount }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- No Results -->
              <p v-if="Object.keys(groupedFilteredServices).length === 0" class="text-xs text-gray-500 text-center py-2">
                No services found.
              </p>
            </section>

            <!-- ========================= GENERATE INVOICE BUTTON ========================= -->
            <div class="pt-2 flex justify-center">
              <button
                @click="generateInvoice"
                :disabled="buttonLoading"
                class="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md shadow-md transition"
              >
                <svg
                  v-if="buttonLoading"
                  class="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l3 3-3 3v-4a8 8 0 01-8-8z"></path>
                </svg>
                {{ buttonLoading ? "Generating..." : "Generate Invoice" }}
              </button>
            </div>

          </div>
        </transition>
      </main>
    </div>

    <!-- Toast Notification -->
    <transition name="slide-fade">
      <div
        v-if="toast.show"
        class="fixed top-5 right-5 px-3 py-2 rounded-md shadow-xl border border-gray-300 text-xs font-medium z-50 flex items-center gap-1.5"
        :class="toast.type === 'success' ? 'text-green-700 bg-white' : 'text-red-700 bg-white'"
      >
        <svg v-if="toast.type === 'success'" class="w-4 h-4 text-green-600" fill="none" stroke="currentColor"
             stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        <svg v-else class="w-4 h-4 text-red-600" fill="none" stroke="currentColor"
             stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>

        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import Topbar from "@/components/topbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
import { FileText, List, Search } from "lucide-vue-next";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "BillingPage",
  components: { Sidebar, Topbar, LoadingAnimation, FileText, List, Search },
  data() {
    return {
      services: [],
      selectedServices: [],
      searchQuery: "",
      selectedCategory: "",
      loading: true,
      userEmail: null,
      showMobileSearch: false,
      buttonLoading: false,
      isMobileSidebarOpen: false,
      toast: { show: false, message: "", type: "success" },
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
        const matchesQuery = s.serviceName.toLowerCase().includes(query) || (s.category || "").toLowerCase().includes(query);
        const matchesCategory = this.selectedCategory ? s.category === this.selectedCategory : true;
        return matchesQuery && matchesCategory;
      });
    },
    groupedFilteredServices() {
      return this.filteredServices.reduce((groups, s) => {
        const cat = s.category || "Uncategorized";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(s);
        return groups;
      }, {});
    },
  },
  methods: {
    toggleMobileSearch() { this.showMobileSearch = !this.showMobileSearch; },
    showToast(message, type = "success") {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      setTimeout(() => (this.toast.show = false), 2500);
    },
    async fetchServices() {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        this.services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error(err);
        this.showToast("Failed to fetch services", "error");
      } finally { this.loading = false; }
    },
    generateShortId() { return `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`; },
    async generateInvoice() {
      if (!this.selectedServices.length) return this.showToast("Select at least one service.", "error");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return this.showToast("You must be logged in.", "error");

      this.buttonLoading = true;
      try {
        const shortId = this.generateShortId();
        const totalAmount = this.selectedServices.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        await addDoc(collection(db, "invoices"), {
          email: user.email,
          services: this.selectedServices,
          totalAmount,
          status: "not paid",
          createdAt: serverTimestamp(),
          shortId,
        });
        this.selectedServices = [];
        this.showToast(`Invoice ${shortId} generated!`, "success");
      } catch (err) {
        console.error(err);
        this.showToast("Failed to generate invoice.", "error");
      } finally { this.buttonLoading = false; }
    },
  },
  mounted() {
    this.fetchServices();
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) this.userEmail = user.email;
  },
};
</script>

<style scoped>
/* Animations */
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }
.animate-fade-in { animation: fadeIn 0.25s ease-in-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(6px);} to {opacity:1; transform:translateY(0);} }

.slide-fade-enter-active { transition: all 0.25s ease-out; }
.slide-fade-leave-active { transition: all 0.25s ease-in; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity:0; transform:translateX(30px); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s ease; }
.slide-down-enter-from, .slide-down-leave-to { max-height:0; opacity:0; padding-top:0; padding-bottom:0; }
.slide-down-enter-to, .slide-down-leave-from { max-height:80px; opacity:1; padding-top:0.25rem; padding-bottom:0.25rem; }

.no-scrollbar::-webkit-scrollbar { display: none; }

@media (max-width: 640px) {
  main { padding-bottom: 5rem; }
  input, select, button { font-size: 12px; }
}
</style>
