<template>
  <div class="h-screen w-64 bg-[#1a1a1a] text-white border-r border-gray-700 shadow-lg flex flex-col">
    <!-- Logo Header (Slightly Reduced Height) -->
    <!-- <div class="px-6 py-4 text-2xl font-bold text-green-500 border-b border-gray-700">
      MaEs
    </div> -->

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Profile Section -->
      <div class="flex flex-col items-center py-6 border-b border-gray-700">
        <div class="w-16 h-16 bg-green-600 flex items-center justify-center rounded-full text-xl font-semibold">
          A
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-200">{{ username }}</h3>
        <p class="text-sm text-gray-400 capitalize">{{ role }}</p>
      </div>

      <!-- Navigation Menu -->
      <nav class="px-4 py-4 space-y-2">
        <router-link
          to="/admin-dashboard"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <HomeIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:rotate-6 transition duration-300" />
          Admin Dashboard
        </router-link>

        <router-link
          to="/admin-management"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <UsersIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:-rotate-6 transition duration-300" />
          Manage Users
        </router-link>

        <router-link
          to="/admin-invoices"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <DocumentTextIcon class="w-5 h-5 transform group-hover:scale-105 group-hover:rotate-3 transition duration-300" />
          Invoice 
        </router-link>

        <router-link
          to="/admin-services"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <Cog6ToothIcon class="w-5 h-5 transform group-hover:rotate-90 transition duration-300" />
          Service 
        </router-link>

        <router-link
          to="/admin-appointment"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <CalendarDaysIcon class="w-5 h-5 transform group-hover:scale-105 group-hover:-rotate-3 transition duration-300" />
          Appointment
        </router-link>

        <router-link
          to="/admin-result"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <ChartBarIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:rotate-2 transition duration-300" />
          Result 
        </router-link>

        <router-link
          to="/admin-rfa"
          class="flex items-center gap-2 px-4 py-2 rounded text-gray-200 hover:bg-green-700 hover:text-white transition font-medium group"
        >
          <ChatBubbleLeftRightIcon class="w-5 h-5 transform group-hover:scale-110 group-hover:-rotate-3 transition duration-300" />
          Request for Assistance
        </router-link>
      </nav>
    </div>

    <!-- Logout Button -->
    <div class="px-4 py-4 border-t border-gray-700">
      <button
        @click="logout"
        class="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white rounded transition font-medium group"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5 transform group-hover:-translate-x-1 transition duration-300" />
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { getAuth, signOut } from "firebase/auth";

// Icons from Heroicons
import { HomeIcon } from "@heroicons/vue/24/outline";
import { UsersIcon } from "@heroicons/vue/24/outline";
import { DocumentTextIcon } from "@heroicons/vue/24/outline";
import { Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";
import { ChartBarIcon } from "@heroicons/vue/24/outline";
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";
import { ArrowLeftOnRectangleIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  router.push("/login");
};

// Static placeholders (replace with actual data if using Firebase auth/user info)
const username = "Admin";
const role = "Administrator";
</script>
