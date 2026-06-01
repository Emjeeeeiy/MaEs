<template>
  <div id="app" class="min-h-screen bg-white">
    <router-view></router-view>
    <NotificationToast />
  </div>
</template>

<script setup>
import NotificationToast from '@/components/NotificationToast.vue';
</script>
