<template>
    <div class="flex min-h-screen bg-gray-50">
      <AdminSidebar class="w-full lg:w-64 border-r border-gray-200" />
      <div class="flex-1 p-4">
        <!-- Main content goes here -->
        <router-view />
      </div>
    </div>
  </template>
  
  <script setup>
  import AdminSidebar from '@/components/admin_sidebar.vue'
  </script>
  