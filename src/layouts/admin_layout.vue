<template>
  <div class="min-h-screen flex bg-gray-50 text-gray-800">
    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm z-40"
    >
      <AdminSidebar />
    </aside>

    <!-- Main wrapper -->
    <div class="flex-1 flex flex-col ml-64">
      <!-- Topbar -->
      <header
        class="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-30"
      >
        <AdminTopbar />
      </header>

      <!-- Page content -->
      <main class="flex-1 pt-16 p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from "@/components/AdminSidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue";
</script>

<style>
/* optional: nice scrollbars */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>
