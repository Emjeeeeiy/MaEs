<template>
  <aside
    class="w-64 bg-[#2d2d2d] border-r border-gray-700 flex flex-col h-full max-h-screen shadow-lg"
  >
    <!-- Profile Header -->
    <div class="p-6 border-b border-gray-700 flex flex-col items-center relative">
      <div
        class="w-14 h-14 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-lg font-bold shadow-[0_0_10px_rgba(34,197,94,0.5)]"
      >
        A
      </div>
      <h2 class="mt-2 text-gray-100 font-medium text-sm">{{ username }}</h2>
      <p class="text-gray-400 text-xs">{{ role }}</p>

      <!-- Green neon bar -->
      <div
        class="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 shadow-[0_0_6px_1px_rgba(34,197,94,0.6)]"
      ></div>
    </div>

    <!-- Menu Items -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 space-y-5">
      <!-- Main Section -->
      <div>
        <h3
          class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2"
        >
          Main
        </h3>
        <ul class="space-y-1.5">
          <li>
            <RouterLink
              to="/admin-dashboard"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <LayoutDashboard class="w-4 h-4 shrink-0" />
              <span class="truncate">Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-management"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <Users class="w-4 h-4 shrink-0" />
              <span class="truncate">Users</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Manage Section -->
      <div>
        <h3
          class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2"
        >
          Manage
        </h3>
        <ul class="space-y-1.5">
          <li>
            <RouterLink
              to="/admin-invoices"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <FileText class="w-4 h-4 shrink-0" />
              <span class="truncate">Invoice</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-services"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <Settings class="w-4 h-4 shrink-0" />
              <span class="truncate">Service</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Others Section -->
      <div>
        <h3
          class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2"
        >
          Others
        </h3>
        <ul class="space-y-1.5">
          <li>
            <RouterLink
              to="/admin-appointment"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <Calendar class="w-4 h-4 shrink-0" />
              <span class="truncate">Appointment</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-result"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <BarChart class="w-4 h-4 shrink-0" />
              <span class="truncate">Result</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-rfa"
              class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <MessageSquare class="w-4 h-4 shrink-0" />
              <span class="truncate">Request for Assistance</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { RouterLink } from "vue-router";

// Lucide icons
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  BarChart,
  MessageSquare,
} from "lucide-vue-next";

// Replace with actual user info if dynamic
const username = "Admin";
const role = "Administrator";
</script>
