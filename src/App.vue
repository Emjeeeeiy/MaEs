<template>
  <div :class="darkMode ? 'dark' : ''">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const darkMode = ref(localStorage.getItem("darkMode") === "true");

    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value;
      localStorage.setItem("darkMode", darkMode.value);
      document.documentElement.classList.toggle("dark", darkMode.value);
    };

    onMounted(() => {
      document.documentElement.classList.toggle("dark", darkMode.value);
    });

    return { darkMode, toggleDarkMode };
  },
};
</script>


<style>
/* ✅ Make the App Responsive */
body {
  background-color: white;
  color: black;
  transition: background-color 0.3s, color 0.3s;
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* ✅ Dark Mode */
.dark body {
  background-color: #121212;
  color: white;
}

/* ✅ Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark .app-header {
  background: #333;
}

/* ✅ Improve Responsiveness */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
