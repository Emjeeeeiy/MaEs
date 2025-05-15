<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo / Title -->
        <div class="text-xl font-bold text-green-700">
          Dashboard
        </div>

        <!-- Navigation with Icons -->
        <nav class="flex gap-6 text-gray-700 relative">
          <!-- Profile Dropdown -->
          <div class="relative" ref="profileDropdownRef">
            <button @click="toggleDropdown" class="focus:outline-none">
              <UserIcon class="w-6 h-6 cursor-pointer hover:text-green-600" />
            </button>

            <transition name="fade">
              <div
                v-if="dropdownOpen"
                class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-green-100"
                  @click="closeDropdown"
                >
                  Profile
                </router-link>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-green-100"
                >
                  Logout
                </button>
              </div>
            </transition>
          </div>

          <!-- Other icons -->
          <router-link to="/report" class="hover:text-green-600">
            <ChartBarIcon class="w-6 h-6 cursor-pointer" />
          </router-link>
          <router-link to="/feedback" class="hover:text-green-600">
            <ChatBubbleBottomCenterTextIcon class="w-6 h-6 cursor-pointer" />
          </router-link>
          <router-link to="/settings" class="hover:text-green-600">
            <Cog6ToothIcon class="w-6 h-6 cursor-pointer" />
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { getAuth, signOut } from "firebase/auth";

import {
  UserIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

const dropdownOpen = ref(false);
const profileDropdownRef = ref(null);
const router = useRouter();
const auth = getAuth();

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    closeDropdown();
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Close dropdown if clicked outside
const handleClickOutside = (event) => {
  if (
    profileDropdownRef.value &&
    !profileDropdownRef.value.contains(event.target)
  ) {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
