<template>
  <div>
    <!-- Blurred overlay on mobile -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 backdrop-blur-sm bg-black/10 sm:hidden"
      @click="isMobileSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed sm:static top-0 left-0 h-screen w-64 bg-gray-800 text-white z-50 flex flex-col transition-transform duration-300',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
      ]"
    >
      <!-- Logo/Header -->
      <div class="px-6 py-4 text-2xl font-bold text-green-500 border-b border-gray-700">
        MaEs
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Profile Info -->
        <div class="px-6 py-5 border-b border-gray-700 text-center">
          <div class="mx-auto w-16 h-16 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
            <img
              v-if="profileImageUrl"
              :src="profileImageUrl"
              alt="Profile"
              class="w-full h-full object-cover"
            />
            <div v-else class="text-xl font-semibold text-green-500">
              {{ username.charAt(0).toUpperCase() }}
            </div>
          </div>
          <h3 class="mt-2 text-sm font-semibold text-gray-200">{{ username }}</h3>
          <p class="text-xs text-gray-400">{{ role }}</p>
        </div>

        <!-- Navigation -->
        <nav class="px-4 py-6 space-y-2">
          <router-link
            to="/dashboard"
            class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
          >
            <HomeIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce" />
            Dashboard
          </router-link>

          <router-link
            to="/billing"
            class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
          >
            <ClipboardDocumentCheckIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce" />
            Billing
          </router-link>

          <router-link
            to="/payments"
            class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
          >
            <CreditCardIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce" />
            Payments
          </router-link>

          <router-link
            to="/invoices"
            class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
          >
            <DocumentTextIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce" />
            Invoices
          </router-link>

          <router-link
            to="/appointment"
            class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
          >
            <CalendarIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce" />
            Appointments
          </router-link>

          <router-link
            to="/result"
            class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
          >
            <ChartBarIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce" />
            Results
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- ✅ Toggle Button (mobile only) -->
    <button
      @click="isMobileSidebarOpen = !isMobileSidebarOpen"
      class="fixed top-16 left-4 z-[9999] sm:hidden bg-gray-800 text-white p-1.5 rounded-md shadow-md"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/solid";

const username = ref("User");
const role = ref("Viewer");
const profileImageUrl = ref("");
const isMobileSidebarOpen = ref(false);

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        username.value = data.displayName || user.displayName || "User";
        role.value = data.role || "Viewer";
        profileImageUrl.value = data.photoURL || user.photoURL || "";
      }
    }
  });
});
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
