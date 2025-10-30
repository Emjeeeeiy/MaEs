<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { watch } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useTawk } from "./composables/useTawk";

const route = useRoute();
const { loadTawk, unloadTawk } = useTawk();

let tawkLoaded = false;

// ❌ Routes na bawal magpakita ng Tawk
const blockedRoutes = ["/", "/login", "/register", "/reset_password"];

// Detect admin route (kahit subpath)
const isAdminRoute = (path) => path.startsWith("/admin");

// Helper: tanggalin talaga yung injected iframe ng Tawk
const removeTawkWidget = () => {
  const iframe = document.querySelector('iframe[src*="tawk.to"]');
  if (iframe?.parentNode) iframe.parentNode.removeChild(iframe);

  const script = document.querySelector('script[src*="tawk.to"]');
  if (script?.parentNode) script.parentNode.removeChild(script);

  // Clear global object
  window.Tawk_API = undefined;
  tawkLoaded = false;
};

// ✅ 2025 FIX – Tawk.to widget auto-adjust position (desktop & mobile)
const setTawkPositionRight = () => {
  const moveTawkWidget = () => {
    const iframe = document.querySelector("iframe[title='chat widget']");
    if (iframe) {
      const isMobile = window.innerWidth <= 768;

      // ✅ Desktop & Mobile position (bottom-right)
      iframe.style.position = "fixed";
      iframe.style.bottom = isMobile ? "50px" : "20px"; // ⬆️ itaas sa mobile para di matakpan
      iframe.style.right = "20px"; // ➡️ lipat sa kanan
      iframe.style.left = "auto";
      iframe.style.transition = "all 0.3s ease";
      iframe.style.zIndex = "999999"; // siguradong nasa ibabaw
      iframe.style.transform = "scale(0.85)"; // 🔹 adjust 0.5–1.0 depende sa gusto mong laki

      console.log("✅ Tawk widget moved to bottom-right successfully");
    } else {
      // ⏳ retry kung di pa loaded ang iframe
      setTimeout(moveTawkWidget, 500);
    }
  };

  moveTawkWidget();

  // 🔁 Reposition on window resize
  window.addEventListener("resize", moveTawkWidget);
};

// 🔥 Run automatically after page load
window.addEventListener("load", () => {
  // wait a bit para sure loaded na si Tawk iframe
  setTimeout(setTawkPositionRight, 2000);
});


// 🔥 Call mo to after Tawk script is loaded
window.addEventListener("load", () => {
  setTimeout(setTawkPositionLeft, 2000); // wait 2s para sure loaded ang iframe
});

// Main checker
const checkTawkStatus = () => {
  const user = auth.currentUser;
  const path = route.path;

  // ❌ Blocked routes (login, register, reset_password, landing, admin)
  if (isAdminRoute(path) || blockedRoutes.includes(path)) {
    unloadTawk();
    removeTawkWidget();
    return;
  }

  // ✅ User logged in at hindi admin/blocked → load Tawk
  if (user && !tawkLoaded) {
    removeTawkWidget();
    loadTawk();
    tawkLoaded = true;

    // Gumamit ng Tawk onLoad event para sure na ma-apply ang position
    const waitForTawk = setInterval(() => {
      if (window.Tawk_API && typeof window.Tawk_API.onLoad === "function") {
        window.Tawk_API.onLoad = function () {
          setTawkPositionLeft();
        };
        clearInterval(waitForTawk);
      }
    }, 500);

    return;
  }

  // ❌ Guest user → tanggalin Tawk
  if (!user) {
    unloadTawk();
    removeTawkWidget();
  }
};

// 🔁 Watch route changes
watch(
  () => route.path,
  () => {
    checkTawkStatus();
  },
  { immediate: true }
);

// 👤 React to auth state changes
onAuthStateChanged(auth, () => {
  checkTawkStatus();
});
</script>

<script>
export default {
  name: "App",
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e2e5e8;
}

main {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
