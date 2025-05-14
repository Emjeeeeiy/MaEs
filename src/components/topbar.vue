<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo / Title -->
        <div class="text-xl font-bold text-green-700">
          Dashboard
        </div>

        <!-- Navigation with Icons -->
        <nav class="flex gap-6 text-gray-700">
          <router-link to="/profile" class="hover:text-green-600">
            <UserIcon class="w-6 h-6" />
          </router-link>
          <router-link to="/report" class="hover:text-green-600">
            <ChartBarIcon class="w-6 h-6" />
          </router-link>
          <router-link to="/feedback" class="hover:text-green-600">
            <ChatBubbleBottomCenterTextIcon class="w-6 h-6" />
          </router-link>
          <router-link to="/settings" class="hover:text-green-600">
            <Cog6ToothIcon class="w-6 h-6" />
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import {
  UserIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";
</script>
