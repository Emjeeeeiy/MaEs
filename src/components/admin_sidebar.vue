<template>
  <div class="h-screen w-64 bg-gray-800 text-white border-r shadow-lg flex flex-col">
    <!-- Header -->
    <div class="px-6 py-5 text-2xl font-bold text-green-500 border-b border-gray-700 flex-shrink-0">
      MaEs
    </div>

    <!-- Scrollable main content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Profile -->
      <div class="flex flex-col items-center py-6 border-b border-gray-700">
        <div class="w-16 h-16 bg-green-600 text-white flex items-center justify-center rounded-full text-xl font-semibold">
          A
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-200">{{ username }}</h3>
        <p class="text-sm text-gray-400 capitalize">{{ role }}</p>
      </div>

      <!-- Navigation -->
      <nav class="px-4 py-4 space-y-2">
        <router-link
          to="/admin-dashboard"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <HomeIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:rotate-6 transition duration-300 ease-in-out" />
          Admin Dashboard
        </router-link>

        <router-link
          to="/admin-management"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <UsersIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:-rotate-6 transition duration-300 ease-in-out" />
          Manage Users
        </router-link>

        <router-link
          to="/admin-invoices"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <DocumentTextIcon class="w-5 h-5 transform group-hover:scale-105 group-hover:rotate-3 transition duration-300 ease-in-out" />
          Invoice Management
        </router-link>

        <router-link
          to="/admin-services"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <Cog6ToothIcon class="w-5 h-5 transform group-hover:rotate-100 transition duration-300 ease-in-out" />
          Service Management
        </router-link>

        <router-link
          to="/admin-appointment"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <CalendarDaysIcon class="w-5 h-5 transform group-hover:scale-105 group-hover:-rotate-3 transition duration-300 ease-in-out" />
          Appointment Management
        </router-link>

        <router-link
          to="/admin-feedback"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <ChatBubbleLeftRightIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:-rotate-3 transition duration-300 ease-in-out" />
          Feedback
        </router-link>
      </nav>
    </div>

    <!-- Logout -->
    <div class="px-4 py-4 border-t border-gray-700 flex-shrink-0">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white rounded transition font-medium group"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5 transform group-hover:-translate-x-1 transition duration-300 ease-in-out" />
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
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { ArrowLeftOnRectangleIcon } from "@heroicons/vue/24/outline";
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline"; // new icon

const router = useRouter();

const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  router.push("/login");
};

// Replace with real user info
const username = "Admin";
const role = "Administrator";
</script>

<style scoped>
.bg-gray-800 {
  background-color: #2d3748;
}
.text-green-500 {
  color: #48bb78;
}
.bg-green-600 {
  background-color: #38a169;
}
.text-gray-200 {
  color: #e2e8f0;
}
.text-gray-400 {
  color: #cbd5e0;
}
.hover\:bg-green-700:hover {
  background-color: #2f855a;
}
.text-red-500 {
  color: #f56565;
}
.hover\:bg-red-600:hover {
  background-color: #e53e3e;
}
</style>
