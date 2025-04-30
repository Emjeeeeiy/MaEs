<template>
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <Sidebar class="w-full lg:w-64 border-r border-gray-200" />
  
      <!-- Main content area -->
      <div class="flex-1 flex flex-col">
        <!-- Topbar -->
        <Topbar class="sticky top-0 z-10 bg-white shadow-sm" />
  
        <!-- Page content -->
        <main class="p-4 flex-1 overflow-y-auto">
          <slot />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import Sidebar from '@/components/Sidebar.vue'
  import Topbar from '@/components/Topbar.vue'
  </script>
  