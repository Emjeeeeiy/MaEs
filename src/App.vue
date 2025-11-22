<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { watch, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useTawk } from "./composables/useTawk";

const route = useRoute();
const { loadTawk, unloadTawk } = useTawk();

let tawkLoaded = false;

// ❌ Routes na hindi dapat may Tawk
const blockedRoutes = ["/", "/login", "/register", "/reset_password"];

// ❌ Remove widget
const removeTawkWidget = () => {
  document.querySelectorAll("iframe[src*='tawk']").forEach((el) => el.remove());
  document.querySelectorAll("script[src*='tawk']").forEach((el) => el.remove());
  window.Tawk_API = undefined;
  tawkLoaded = false;
};

/*  
==========================================================================
🔥 100% WORKING TAWK WIDGET FIX
- Targets ALL possible widget containers
- Overrides ALL inline styles with !important
- Forces new bottom offset & size
- MutationObserver keeps reapplying the fix
==========================================================================
*/
const fixTawkWidget = () => {
  const applyFix = () => {
    const widgets = [
      ...document.querySelectorAll("iframe[title='chat widget']"),
      ...document.querySelectorAll("iframe[src*='tawk']"),
      ...document.querySelectorAll("#tawk-root div"),
      ...document.querySelectorAll("div[id*='tawk'], div[class*='tawk']")
    ];

    const isMobile = window.innerWidth <= 768;

    widgets.forEach((el) => {
      el.style.setProperty("position", "fixed", "important");
      el.style.setProperty("right", "10px", "important");
      el.style.setProperty("left", "auto", "important");

      // ⬆️ RAISE HIGHER (this is the actual fix)
      el.style.setProperty("bottom", isMobile ? "90px" : "130px", "important");

      // ⬇️ SMALLER WIDGET
      el.style.setProperty("transform-origin", "bottom right", "important");
      el.style.setProperty("transform", "scale(0.72)", "important");

      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("z-index", "99999999", "important");
    });

    if (widgets.length) {
      console.log("🔥 Tawk widget forced reposition applied");
      return true;
    }

    return false;
  };

  // Try immediately
  if (applyFix()) return;

  // Keep watching for injected containers
  const observer = new MutationObserver(() => {
    applyFix();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Reapply on resize
  window.addEventListener("resize", applyFix);

  // Reapply every 500ms (Tawk overwrites styles)
  setInterval(applyFix, 600);
};

// Main control
const checkTawkStatus = () => {
  const user = auth.currentUser;
  const path = route.path;

  if (!user || blockedRoutes.includes(path) || path.startsWith("/admin")) {
    unloadTawk();
    removeTawkWidget();
    return;
  }

  if (user && !tawkLoaded) {
    removeTawkWidget();
    loadTawk();
    tawkLoaded = true;

    const wait = setInterval(() => {
      if (window.Tawk_API) {
        window.Tawk_API.onLoad = () => {
          setTimeout(fixTawkWidget, 400);
        };
        clearInterval(wait);
      }
    }, 300);
  }
};

// Watchers
watch(() => route.path, checkTawkStatus, { immediate: true });
onAuthStateChanged(auth, checkTawkStatus);

// Extra insurance: start fix on mount
onMounted(() => {
  setTimeout(fixTawkWidget, 800);
});
</script>
