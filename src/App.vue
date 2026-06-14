<template>
  <div id="app" class="min-h-screen bg-white">
    <router-view></router-view>
    <NotificationToast />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import NotificationToast from '@/components/NotificationToast.vue';
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();

let offlineTimeout = null;

const updatePresence = async (status) => {
  if (!user.value?.uid) return;
  try {
    const userRef = doc(db, 'users', user.value.uid);
    await updateDoc(userRef, {
      onlineStatus: status,
      lastActive: serverTimestamp()
    });
  } catch (err) {
    console.debug('Presence sync suppressed');
  }
};

const handleVisibilityChange = () => {
  if (!user.value) return;
  
  if (document.visibilityState === 'visible') {
    if (offlineTimeout) {
      clearTimeout(offlineTimeout);
      offlineTimeout = null;
    }
    updatePresence('online');
  } else {
    // Set offline only if hidden for more than 30 seconds
    // This avoids flickering during redirects or quick tab switches
    offlineTimeout = setTimeout(() => {
      if (document.visibilityState === 'hidden') {
        updatePresence('offline');
      }
    }, 30000); 
  }
};

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Also handle window close
  window.addEventListener('beforeunload', () => {
    if (user.value) updatePresence('offline');
  });

  if (user.value) updatePresence('online');
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  if (offlineTimeout) clearTimeout(offlineTimeout);
});

// Sync presence when user state changes (Login)
watch(user, (newUser) => {
  if (newUser) {
    updatePresence('online');
  }
}, { immediate: true });
</script>
