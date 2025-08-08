// src/composables/useTawk.js
export function useTawk() {
  const loadTawk = (user) => {
    if (!window.Tawk_API) {
      window.Tawk_API = {};
      window.Tawk_LoadStart = new Date();

      const s1 = document.createElement("script");
      s1.src = "https://embed.tawk.to/682390baa582f719105b0cc6/1ir5eqmhl";
      s1.async = true;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");

      document.body.appendChild(s1);
    }

    if (user) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.visitor = {
        name: user.displayName || "User",
        email: user.email,
      };
    }
  };

  const removeTawk = () => {
    const tawkScript = document.querySelector('script[src^="https://embed.tawk.to/"]');
    if (tawkScript) {
      tawkScript.remove();
    }

    const tawkDiv = document.querySelector("#tawkchat-container");
    if (tawkDiv) {
      tawkDiv.remove();
    }

    delete window.Tawk_API;
    delete window.Tawk_LoadStart;
  };

  return { loadTawk, removeTawk };
}
