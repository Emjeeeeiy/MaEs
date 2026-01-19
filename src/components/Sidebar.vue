<template>
  <div class="flex">
    <!-- DESKTOP SIDEBAR -->
    <aside
      class="hidden sm:flex flex-col bg-white h-screen w-20 group"
    >
      <nav class="flex flex-col mt-4 space-y-2">
        <router-link to="/dashboard" :class="iconLink('/dashboard')">
          <HomeIcon class="icon" />
          <span class="sidebar-text">Dashboard</span>
        </router-link>

        <router-link to="/billing" :class="iconLink('/billing')">
          <ClipboardDocumentCheckIcon class="icon" />
          <span class="sidebar-text">Billing</span>
        </router-link>

        <router-link to="/payments" :class="iconLink('/payments')">
          <CreditCardIcon class="icon" />
          <span class="sidebar-text">Payments</span>
        </router-link>

        <router-link to="/invoices" :class="iconLink('/invoices')">
          <DocumentTextIcon class="icon" />
          <span class="sidebar-text">Invoices</span>
        </router-link>

        <router-link to="/appointment" :class="iconLink('/appointment')">
          <CalendarIcon class="icon" />
          <span class="sidebar-text">Appointments</span>
        </router-link>

        <router-link to="/result" :class="iconLink('/result')">
          <ChartBarIcon class="icon" />
          <span class="sidebar-text">Results</span>
        </router-link>

        <router-link to="/profile" :class="iconLink('/profile')">
          <UserCircleIcon class="icon" />
          <span class="sidebar-text">Profile</span>
        </router-link>
      </nav>
    </aside>

    <!-- MOBILE NAV -->
    <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white flex justify-around h-16 items-center">
      <router-link to="/dashboard"><HomeIcon class="w-6 h-6" /></router-link>
      <router-link to="/billing"><ClipboardDocumentCheckIcon class="w-6 h-6" /></router-link>
      <router-link to="/payments"><CreditCardIcon class="w-6 h-6" /></router-link>
      <router-link to="/invoices"><DocumentTextIcon class="w-6 h-6" /></router-link>
      <router-link to="/appointment"><CalendarIcon class="w-6 h-6" /></router-link>
      <router-link to="/result"><ChartBarIcon class="w-6 h-6" /></router-link>
      <router-link to="/profile"><UserCircleIcon class="w-6 h-6" /></router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  HomeIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  ChartBarIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/solid'

const route = useRoute()

function iconLink(path) {
  return [
    'flex items-center gap-2 px-4 py-3 text-gray-800 hover:bg-gray-50 transition whitespace-nowrap rounded-lg',
    route.path === path ? 'text-green-600 font-medium' : ''
  ]
}
</script>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* Sidebar text hidden by default */
.sidebar-text {
  opacity: 0;
  font-size: 0.55rem; /* smaller font */
  white-space: nowrap;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

/* Show text on hover of sidebar */
.group:hover .sidebar-text {
  opacity: 1;
  pointer-events: auto;
}
</style>
