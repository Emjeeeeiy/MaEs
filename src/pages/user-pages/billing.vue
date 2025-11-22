<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 overflow-hidden">
    <!-- Fixed Topbar -->
    <div class="flex-shrink-0 z-10 border-b border-gray-200 bg-white shadow-sm">
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
      <aside class="w-64 flex-shrink-0 hidden sm:block border-r bg-white shadow-sm">
        <Sidebar :is-mobile-sidebar-open="true" />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto h-full scroll-smooth">
        <transition name="fade" mode="out-in">
          <!-- LOADING STATE -->
          <div v-if="loading" key="loading" class="flex justify-center items-center min-h-[250px]">
            <LoadingAnimation />
          </div>

          <!-- MAIN CONTENT -->
          <div v-else key="content" class="space-y-4 sm:space-y-6 animate-fade-in flex flex-col">
            <!-- Mobile Search Icon on Left -->
            <div class="sm:hidden flex justify-start mb-2">
              <button @click="toggleMobileSearch" class="p-2 rounded-md hover:bg-gray-100 transition">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"/>
                </svg>
              </button>
            </div>

            <!-- Mobile Search Input -->
            <transition name="slide-down">
              <div v-if="showMobileSearch" class="sm:hidden mb-2">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                />
              </div>
            </transition>

            <!-- Category Filter Pills -->
            <div class="flex overflow-x-auto gap-2 py-2 sm:py-0">
              <button
                v-for="cat in availableCategories"
                :key="cat"
                @click="selectedCategory = selectedCategory === cat ? '' : cat"
                class="flex-shrink-0 px-4 py-1 rounded-full text-sm font-medium transition"
                :class="selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'"
              >
                {{ cat }}
              </button>
            </div>

            <!-- Services Grid -->
            <div class="flex-1 space-y-3">
              <div v-for="category in orderedCategories" :key="category" class="space-y-1">
                <div v-if="groupedFilteredServices[category]">
                  <h3 class="flex items-center gap-2 text-sm font-semibold text-green-600 mt-1 mb-1 py-1 border-b">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    {{ category }}
                  </h3>

                  <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <label
                      v-for="service in groupedFilteredServices[category]"
                      :key="service.id"
                      class="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                    >
                      <div class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          :value="service"
                          v-model="selectedServices"
                          class="form-checkbox text-blue-600 h-4 w-4"
                        />
                        <span class="text-sm text-gray-800 text-left leading-tight">
                          {{ service.serviceName }}
                        </span>
                      </div>
                      <span class="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        ₱{{ service.amount }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <p v-if="Object.keys(groupedFilteredServices).length === 0" class="text-sm text-gray-500 text-center py-4">
                No services found.
              </p>
            </div>

            <!-- Generate Invoice Button -->
            <div class="pt-3 flex justify-center">
              <button
                @click="generateInvoice"
                :disabled="buttonLoading"
                class="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2 rounded-md shadow-md transition"
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
        class="fixed top-5 right-5 px-4 py-3 rounded-md shadow-xl border border-gray-300 text-sm font-medium z-50 flex items-center gap-2"
        :class="toast.type === 'success' ? 'text-green-700 bg-white' : 'text-red-700 bg-white'"
      >
        <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
             stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>

        <svg v-else class="w-5 h-5 text-red-600" fill="none" stroke="currentColor"
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
import { db } from "@/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "BillingPage",
  components: { Sidebar, Topbar, LoadingAnimation },

  data() {
    return {
      services: [],
      selectedServices: [],
      searchQuery: "",
      selectedCategory: "",
      loading: true,
      userEmail: null,
      showMobileSearch: false, // ✅ Fixed: added this

      toast: { show: false, message: "", type: "success" },

      buttonLoading: false,
      isMobileSidebarOpen: false,

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
      const q = this.searchQuery.toLowerCase();
      return this.services.filter((s) => {
        const matchesQuery =
          s.serviceName.toLowerCase().includes(q) ||
          (s.category || "").toLowerCase().includes(q);
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
    toggleMobileSearch() {
      this.showMobileSearch = !this.showMobileSearch; // ✅ toggler method
    },

    showToast(message, type = "success") {
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      setTimeout(() => (this.toast.show = false), 2500);
    },

    async fetchServices() {
      const snapshot = await getDocs(collection(db, "services"));
      this.services = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
    },

    generateShortId() {
      return `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    },

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
        this.showToast(`Invoice ${shortId} generated!`, "success");
        this.selectedServices = [];
      } catch (err) {
        this.showToast("Failed to generate invoice.", "error");
      } finally {
        this.buttonLoading = false;
      }
    },
  },

  mounted() {
    this.fetchServices();
    const auth = getAuth();
    if (auth.currentUser) this.userEmail = auth.currentUser.email;
  },
};
</script>

<style scoped>
/* Fade animation */
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:translateY(0);} }

/* Toast animation */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.3s ease-in; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity:0; transform:translateX(50px); }

/* Slide-down animation */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { max-height:0; opacity:0; padding-top:0; padding-bottom:0; }
.slide-down-enter-to, .slide-down-leave-from { max-height:100px; opacity:1; padding-top:0.5rem; padding-bottom:0.5rem; }

@media (max-width: 640px) {
  main { padding-bottom: 6rem; }
  input, select, button { font-size: 14px; }
}
</style>
