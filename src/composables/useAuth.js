import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Global state to share across components
const user = ref(null);
const role = ref(null);
const loading = ref(true);
const error = ref(null);
let initialized = false;

export function useAuth() {
  const fetchRole = async (firebaseUser) => {
    try {
      // Prioritize Custom Claims
      const token = await firebaseUser.getIdTokenResult();
      if (token.claims.role) {
        role.value = token.claims.role;
        return;
      }

      // Fallback to Firestore if claims aren't set yet
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        role.value = userDoc.data().role;
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      error.value = err;
    }
  };

  if (!initialized) {
    initialized = true;
    const auth = getAuth();
    onAuthStateChanged(auth, async (firebaseUser) => {
      loading.value = true;
      if (firebaseUser) {
        user.value = firebaseUser;
        await fetchRole(firebaseUser);
      } else {
        user.value = null;
        role.value = null;
      }
      loading.value = false;
    });
  }

  return {
    user,
    role,
    loading,
    error,
    isAdmin: () => role.value === 'admin',
    isAuthenticated: () => !!user.value,
  };
}
