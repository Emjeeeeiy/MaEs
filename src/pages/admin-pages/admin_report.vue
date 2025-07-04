<template>
  <div class="flex min-h-screen bg-gray-100 text-gray-800">
    <admin_sidebar />

    <div class="flex-1 flex flex-col max-h-screen">
      <AdminTopbar />

      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <LoadingAnimation />
        <!-- Add your main content here -->
      </div>
    </div>
  </div>
</template>

<script setup>
import admin_sidebar from "@/components/admin_sidebar.vue";
import AdminTopbar from "@/components/AdminTopbar.vue";
import LoadingAnimation from "@/components/loading_animation.vue";
</script>
