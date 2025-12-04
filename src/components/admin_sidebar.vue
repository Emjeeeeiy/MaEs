<template>
  <aside
    class="w-60 bg-[#2d2d2d] border-r border-gray-700 flex flex-col h-full max-h-screen shadow-lg"
  >
    <!--Header -->
    <div class="p-4 border-b border-gray-700 flex flex-col items-center relative">
      <h2 class="mt-1 text-gray-100 font-medium text-xs truncate">Admin</h2>
      <p class="text-gray-400 text-[9px] truncate">{{ role }}</p>
    </div>

    <!-- Menu Items -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-4">
      <!-- Main Section -->
      <div>
        <h3
          class="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Main
        </h3>
        <ul class="space-y-1">
          <li>
            <RouterLink
              to="/admin-dashboard"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <LayoutDashboard class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-management"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <Users class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Users</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Manage Section -->
      <div>
        <h3
          class="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Manage
        </h3>
        <ul class="space-y-1">
          <li>
            <RouterLink
              to="/admin-invoices"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <FileText class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Invoice</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-services"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <Settings class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Service</span>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Others Section -->
      <div>
        <h3
          class="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1"
        >
          Others
        </h3>
        <ul class="space-y-1">
          <li>
            <RouterLink
              to="/admin-appointment"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <Calendar class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Appointment</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-result"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <BarChart class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">Result</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/admin-rfa"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-200 text-xs hover:bg-green-900/30 hover:text-green-400 transition-all duration-200 truncate"
              active-class="bg-green-900/50 text-green-400 font-semibold"
            >
              <MessageSquare class="w-3.5 h-3.5 shrink-0" />
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
