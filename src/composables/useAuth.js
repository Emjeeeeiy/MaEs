import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useAuth() {
  const user = ref(null);
  const role = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        role.value = userDoc.data().role;
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      error.value = err;
    }
  };

  onMounted(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (firebaseUser) => {
      loading.value = true;
      if (firebaseUser) {
        user.value = firebaseUser;
        await fetchRole(firebaseUser.uid);
      } else {
        user.value = null;
        role.value = null;
      }
      loading.value = false;
    });
  });

  return {
    user,
    role,
    loading,
    error,
    isAdmin: () => role.value === 'admin',
    isAuthenticated: () => !!user.value,
  };
}
