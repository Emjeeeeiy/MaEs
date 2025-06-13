<template>
  <div
    class="fixed inset-y-0 left-0 bg-gray-800 text-white border-r shadow-lg flex flex-col
           w-64 sm:w-64 w-full sm:static z-30"
  >
    <!-- Logo/Header -->
    <div class="px-6 py-5 text-2xl font-bold text-green-500 border-b border-gray-700 flex-shrink-0">
      MaEs
    </div>

    <!-- Scrollable content wrapper -->
    <div class="flex-1 overflow-y-auto">
      <!-- Profile Section -->
      <div class="px-6 py-5 border-b border-gray-700 text-center">
        <div
          class="mx-auto w-16 h-16 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center"
        >
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
          <HomeIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce transition" />
          Dashboard
        </router-link>

        <router-link
          to="/billing"
          class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
        >
          <ClipboardDocumentCheckIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce transition" />
          Billing
        </router-link>

        <router-link
          to="/payments"
          class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
        >
          <CreditCardIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce transition" />
          Payments
        </router-link>

        <router-link
          to="/invoices"
          class="flex items-center px-4 py-2 rounded-lg text-gray-200 hover:bg-green-600 hover:text-white transition group"
        >
          <DocumentTextIcon class="w-5 h-5 mr-3 text-white group-hover:animate-bounce transition" />
          Invoices
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// Heroicons
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/vue/24/solid";

const username = ref("User");
const role = ref("Viewer");
const profileImageUrl = ref("");

const auth = getAuth();

onMounted(() => {
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
.bg-gray-800 {
  background-color: #2d3748;
}
.text-green-500 {
  color: #48bb78;
}
.bg-gray-600 {
  background-color: #4a5568;
}
.hover\:bg-green-600:hover {
  background-color: #38a169;
}
.text-gray-200 {
  color: #e2e8f0;
}
.text-gray-400 {
  color: #cbd5e0;
}

/* Ensure the layout fills full height */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
