// composables/useTawk.js
import { auth, db } from '../firebase';
import { getDoc, doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

let tawkInitialized = false;
let tawkLoadTimeout = null;

export function useTawk() {
  // Exclude routes kung saan ayaw mo lumabas ang Tawk widget
  const excludedRoutes = ['/', '/auth', '/login', '/register', '/reset-password'];
  const shouldLoadTawk = (path) => !excludedRoutes.includes(path);

  // 🔐 Kunin ang role ng user mula Firestore
  async function getUserRole() {
    const user = auth.currentUser;
    if (!user) return null;

    const snap = await getDoc(doc(db, 'users', user.uid));
    return snap.exists() ? snap.data().role : null;
  }

  // 📝 Optional logging ng mga Tawk events sa Firestore
  async function logTawkEvent(message, data = {}) {
    console.info('[TAWK EVENT]', message, data);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      await addDoc(collection(db, 'tawkLogs'), {
        userId: user.uid,
        email: user.email || 'unknown',
        message,
        data,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      if (err.code === 'permission-denied') {
        console.warn('[TAWK LOG ERROR] Permission denied. Check Firestore rules.', err.message);
      } else {
        console.warn('[TAWK LOG ERROR]', err.message);
      }
    }
  }

  // ✅ Load Tawk widget (depende sa role ng user)
  const loadTawk = async () => {
    if (tawkInitialized || !auth.currentUser) return;

    const role = await getUserRole();
    if (!['user', 'admin'].includes(role)) {
      logTawkEvent('Tawk skipped due to role restriction', { role });
      return;
    }

    unloadTawk(); // full cleanup bago mag-load ulit

    tawkLoadTimeout = setTimeout(() => {
      window.Tawk_LoadStart = new Date();

      if (typeof window.Tawk_API === 'undefined') {
        window.Tawk_API = {};
      }

      // ✅ Hook para iwas undefined errors
      if (typeof window.Tawk_API.onBeforeLoaded !== 'function') {
        window.Tawk_API.onBeforeLoaded = function () {
          console.debug('[TAWK] onBeforeLoaded hook called');
        };
      }

      // 👉 Dito mo ilalagay yung Tawk embed link galing sa dashboard
      const script = document.createElement('script');
      script.id = 'tawk-script';
      script.src = 'https://embed.tawk.to/682390baa582f719105b0cc6/1ir5eqmhl';
      script.async = true;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');

      script.onload = () => {
        tawkInitialized = true;
        logTawkEvent('✅ Tawk script loaded');

        // Kung may user, iset ang attributes (pang-identify sa Tawk dashboard)
        if (window.Tawk_API?.setAttributes && auth.currentUser) {
          window.Tawk_API.setAttributes({
            name: auth.currentUser.displayName || 'Vue User',
            email: auth.currentUser.email,
          }, (error) => {
            if (error) {
              console.warn('Tawk setAttributes error:', error);
            }
          });
        }
      };

      script.onerror = () => {
        logTawkEvent('❌ Tawk script failed to load', { src: script.src });
      };

      document.body.appendChild(script);
    }, 300);
  };

  // ❌ Unload Tawk (full cleanup)
  const unloadTawk = () => {
    if (!tawkInitialized) return;

    clearTimeout(tawkLoadTimeout);

    try {
      if (window.Tawk_API?.endChat) window.Tawk_API.endChat();
      if (window.Tawk_API?.logout) window.Tawk_API.logout();
      if (window.Tawk_API?.hideWidget) window.Tawk_API.hideWidget();

      logTawkEvent('Tawk fully unloaded and session ended');
    } catch (e) {
      console.warn('[TAWK] API teardown failed:', e);
    }

    document.getElementById('tawk-script')?.remove();
    document.querySelectorAll('[id^="tawk-"], [class*="tawk-"]').forEach(el => el.remove());

    delete window.Tawk_API;
    delete window.Tawk_LoadStart;
    tawkInitialized = false;

    // Clear cookies
    document.cookie.split(';').forEach(c => {
      if (c.trim().startsWith('Tawk_')) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      }
    });

    // Clear storage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('tawk_')) localStorage.removeItem(key);
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('tawk_')) sessionStorage.removeItem(key);
    });
  };

  return { loadTawk, unloadTawk, shouldLoadTawk };
}
