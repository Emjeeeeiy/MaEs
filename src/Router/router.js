import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

import Login from '@/pages/login.vue';
import Register from '../pages/register.vue';
import Dashboard from '../pages/user-pages/dashboard.vue';
import Payments from '../pages/user-pages/payments.vue';
import Billing from '../pages/user-pages/billing.vue';
import Invoices from '../pages/user-pages/invoices.vue';
import AdminDashboard from '../pages/admin-pages/admin_dasboard.vue';
import AdminInvoices from '../pages/admin-pages/admin_invoices.vue';
import admin_management from '../pages/admin-pages/admin_management.vue';
import settings from '../pages/user-pages/settings.vue';
import profile from '../pages/user-pages/profile.vue';
import report from '../pages/user-pages/report.vue';
import admin_claims from '../pages/admin-pages/admin_claims.vue';
import feedback from '../pages/user-pages/feedback.vue';
import admin_services from '../pages/admin-pages/admin_services.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  // User Routes
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/payments', name: 'Payments', component: Payments },
  { path: '/billing', name: 'Billing', component: Billing },
  { path: '/invoices', name: 'Invoices', component: Invoices },
  { path: '/settings', name: 'Settings', component: settings },
  { path: '/profile', name: 'Profile', component: profile },
  { path : '/report', name: 'Report', component: report },
  { path: '/feedback', name: 'Feedback', component: feedback },

  // Admin Routes
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-invoices', name: 'AdminInvoices', component: AdminInvoices, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-management', name: 'AdminManagement', component: admin_management, meta: { requiresAdmin: true, role: 'admin' },},
  { path: '/admin-claims', name: 'AdminClaims', component: admin_claims, meta: { requiresAdmin: true, role: 'admin' },},  
  { path: '/admin-services', name: 'AdminServices', component: admin_services, meta: { requiresAdmin: true, role: 'admin' },},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔒 Navigation Guard for Admin Access
router.beforeEach(async (to, from, next) => {
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (!requiresAdmin) return next();

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return next('/login');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;

    if (role === 'admin') {
      next();
    } else {
      next('/dashboard'); // Redirect regular users
    }
  } catch (err) {
    console.error('Route guard error:', err);
    next('/login');
  }
});

export default router;
