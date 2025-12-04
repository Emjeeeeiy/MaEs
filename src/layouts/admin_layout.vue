<template>
  <div class="min-h-screen flex bg-gray-50 text-gray-800">

    <!-- Sidebar (desktop) -->
    <aside
      class="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm z-40"
    >
      <AdminSidebar />
    </aside>

    <!-- Sidebar (mobile) -->
    <transition name="slide">
      <aside
        v-if="mobileSidebarOpen"
        class="md:hidden fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50"
      >
        <AdminSidebar @close="mobileSidebarOpen = false" />

        <!-- Overlay -->
        <div
          @click="mobileSidebarOpen = false"
          class="fixed inset-0 bg-black bg-opacity-40"
        ></div>
      </aside>
    </transition>

    <!-- Main wrapper -->
    <div class="flex-1 flex flex-col md:ml-64">

      <!-- Topbar -->
      <header
        class="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30 flex items-center"
      >
        <AdminTopbar @openMenu="mobileSidebarOpen = true" />
      </header>

      <!-- Page content -->
      <main class="flex-1 pt-16 p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AdminSidebar from "@/components/AdminSidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue";

const mobileSidebarOpen = ref(false);
</script>

<style>
/* Smooth mobile sidebar slide */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* Scrollbar */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
