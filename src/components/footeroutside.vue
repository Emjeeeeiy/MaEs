<template>
  <footer class="py-4 bg-white">
    <nav class="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm text-gray-600">

      <!-- Features Dropdown -->
      <div class="relative">
        <button class="hover:text-green-700" @click="toggleDropdown('features')">
          Features
        </button>
        <div
          v-show="dropdowns.features"
          class="absolute bottom-full mb-2 bg-white border rounded-md w-32 z-10"
        >
          <ul class="py-1">
            <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer">Dashboard</li>
            <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer">Billing</li>
            <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer">Records</li>
          </ul>
        </div>
      </div>

      <!-- Help Dropdown -->
      <div class="relative">
        <button class="hover:text-green-700" @click="toggleDropdown('help')">
          Help
        </button>
        <div
          v-show="dropdowns.help"
          class="absolute bottom-full mb-2 bg-white border rounded-md w-28 z-10"
        >
          <ul class="py-1">
            <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer">Support</li>
            <li class="px-3 py-1 hover:bg-gray-100 cursor-pointer">FAQs</li>
          </ul>
        </div>
      </div>

      <!-- Static Links -->
      <router-link to="/" class="hover:text-green-700">Home</router-link>
      <a href="#" class="hover:text-green-700">Privacy</a>
      <a href="#" class="hover:text-green-700">Cookie</a>
      <a href="#" class="hover:text-green-700">Terms</a>

    </nav>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
  data() {
    return {
      dropdowns: {
        features: false,
        help: false
      }
    };
  },
  methods: {
    toggleDropdown(name) {
      for (const key in this.dropdowns) {
        if (key !== name) this.dropdowns[key] = false;
      }
      this.dropdowns[name] = !this.dropdowns[name];
    }
  }
};
</script>

<style scoped>
/* Optional: Smooth dropdown transition */
div[ v-show ] {
  transition: all 0.2s ease-in-out;
}
</style>
