import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, signOut } from "firebase/auth"; // ✅ Import signOut
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

import UserRegister from '@/components/User_Register.vue';
import UserLogin from '@/components/User_Login.vue';
import EditUserProfile from '@/components/EditUserProfile.vue';
import UserDashboard from '@/components/User_Dashboard.vue';
import UserProfileDisplay from '@/components/UserProfileDisplay.vue';
import AdminDashboard from '@/components/Admin_Dashboard.vue';
import ResetPassword from '@/components/ResetPassword.vue';
import AdminManagement from "@/components/AdminManagement.vue";
// import FinancialManagement from '@/components/FinancialManagement.vue';
import settings from './components/settings.vue';
import payments from './components/payments.vue';
import invoices from './components/invoices.vue';
import billing from './components/billing.vue';
import AdminInvoices from './components/AdminInvoices.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', name: 'UserRegister', component: UserRegister },
  { path: '/login', name: 'UserLogin', component: UserLogin },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
  { path: '/dashboard', name: 'UserDashboard', component: UserDashboard, meta: { requiresAuth: true } },
  
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
  { path: "/admin-management", name: "AdminManagement", component: AdminManagement, meta: { requiresAuth: true, role: "admin" } },
  { path: '/AdminInvoices', name: 'AdminInvoices', component: AdminInvoices, meta: { requiresAuth: true, role: 'admin' } },
  
  
  { path: '/edit-profile', name: 'EditUserProfile', component: EditUserProfile, meta: { requiresAuth: true, role: 'user' } },
  { path: '/profile-display', name: 'UserProfileDisplay', component: UserProfileDisplay, meta: { requiresAuth: true, role: 'user' } },
  { path: '/settings', name: 'settings', component: settings, meta: { requiresAuth: true, role: 'user' }}, 
  { path: '/payments', name: 'payments', component: payments, meta: { requiresAuth: true, role: 'user' }},
  { path: '/invoices', name: 'invoices', component: invoices, meta: { requiresAuth: true, role: 'user' }},
  { path: '/billing', name: 'billing', component: billing, meta: { requiresAuth: true, role: 'user'}},
  // { path: "/reports", component: () => import("@/views/Reports.vue")}, 
  // { path: '/financial-management', component: FinancialManagement }, 
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔹 Navigation Guard to Protect Routes
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      next("/login");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userRole = userSnap.data().role;

        if (to.meta.role && to.meta.role !== userRole) {
          alert("Access denied.");
          next("/login"); // ✅ Redirect to login instead of dashboard
          return;
        }

        next();
      } else {
        next("/login");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      next("/login");
    }
  } else {
    next();
  }
});

// 🔹 Logout Function (Uses signOut)
export const logoutUser = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
    alert("You have been logged out.");
    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export default router;
