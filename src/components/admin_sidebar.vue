<template>
  <div
    class="h-screen w-64 bg-gray-800 text-white border-r shadow-lg flex flex-col"
  >
    <!-- Header -->
    <div
      class="px-6 py-5 text-2xl font-bold text-green-500 border-b border-gray-700 flex-shrink-0"
    >
      MaEs
    </div>

    <!-- Scrollable main content (profile + nav) -->
    <div class="flex-1 overflow-y-auto">
      <!-- Profile Section -->
      <div class="flex flex-col items-center py-6 border-b border-gray-700">
        <div
          class="w-16 h-16 bg-green-600 text-white flex items-center justify-center rounded-full text-xl font-semibold"
        >
          A
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-200">{{ username }}</h3>
        <p class="text-sm text-gray-400 capitalize">{{ role }}</p>
      </div>

      <!-- Navigation Links -->
      <nav class="px-4 py-4 space-y-2">
        <router-link
          to="/admin-dashboard"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
        >
          <HomeIcon class="w-5 h-5" />
          Admin Dashboard
        </router-link>
        <router-link
          to="/admin-management"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
        >
          <UsersIcon class="w-5 h-5" />
          Manage Users
        </router-link>
        <router-link
          to="/admin-invoices"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
        >
          <DocumentTextIcon class="w-5 h-5" />
          Invoice Management
        </router-link>
        <router-link
          to="/admin-services"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
        >
          <Cog6ToothIcon class="w-5 h-5" />
          Service Management
        </router-link>
        <router-link
          to="/admin-feedback"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium"
        >
          <ChatBubbleLeftRightIcon class="w-5 h-5" />
          Feedback
        </router-link>
      </nav>
    </div>

    <!-- Logout -->
    <div class="px-4 py-4 border-t border-gray-700 flex-shrink-0">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white rounded transition font-medium"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5" />
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { getAuth, signOut } from "firebase/auth";

// Heroicons
import { HomeIcon } from "@heroicons/vue/24/outline";
import { UsersIcon } from "@heroicons/vue/24/outline";
import { DocumentTextIcon } from "@heroicons/vue/24/outline";
import { ClipboardDocumentCheckIcon } from "@heroicons/vue/24/outline";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { ArrowLeftOnRectangleIcon } from "@heroicons/vue/24/outline";
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  router.push("/login");
};

// Example user data (replace with real data)
const username = "Admin";
const role = "Administrator";
</script>

<style scoped>
/* Background Color */
.bg-gray-800 {
  background-color: #2d3748;
}

/* Header */
.text-green-500 {
  color: #48bb78;
}

/* Profile Section */
.bg-green-600 {
  background-color: #38a169;
}

/* Navigation Links */
.text-gray-200 {
  color: #e2e8f0;
}

.hover\:bg-green-700:hover {
  background-color: #2f855a;
}

.text-gray-400 {
  color: #cbd5e0;
}

/* Logout Button */
.text-red-500 {
  color: #f56565;
}

.hover\:bg-red-600:hover {
  background-color: #e53e3e;
}
</style>
