import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Public pages
import LandingPage from '../pages/LandingPage.vue';
import Login from '@/pages/login.vue';
import Register from '../pages/register.vue';
import reset_password from '../pages/reset_password.vue';

// User pages
import Dashboard from '../pages/user-pages/dashboard.vue';
import Payments from '../pages/user-pages/payments.vue';
import Billing from '../pages/user-pages/billing.vue';
import Invoices from '../pages/user-pages/invoices.vue';
import settings from '../pages/user-pages/settings.vue';
import profile from '../pages/user-pages/profile.vue';
import edit_profile from '../pages/user-pages/edit_profile.vue';
import appointment from '../pages/user-pages/appointment.vue';
import result from '../pages/user-pages/result.vue';

// Admin pages
import AdminDashboard from '../pages/admin-pages/admin_dasboard.vue';
import AdminInvoices from '../pages/admin-pages/admin_invoices.vue';
import admin_management from '../pages/admin-pages/admin_management.vue';
import admin_services from '../pages/admin-pages/admin_services.vue';
import admin_rfa from '../pages/admin-pages/admin_rfa.vue';
import admin_appointment from '../pages/admin-pages/admin_appointment.vue';
import admin_result from '../pages/admin-pages/admin_result.vue';

const routes = [
  // Default route (Landing Page)
  { path: '/', name: 'LandingPage', component: LandingPage },

  // Public routes
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/reset_password', name: 'ResetPassword', component: reset_password },

  // Admin Routes
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true, role: 'admin' },
  },
  {
    path: '/admin-invoices',
    name: 'AdminInvoices',
    component: AdminInvoices,
    meta: { requiresAdmin: true, role: 'admin' },
  },
  {
    path: '/admin-management',
    name: 'AdminManagement',
    component: admin_management,
    meta: { requiresAdmin: true, role: 'admin' },
  },
  {
    path: '/admin-services',
    name: 'AdminServices',
    component: admin_services,
    meta: { requiresAdmin: true, role: 'admin' },
  },
  {
    path: '/admin-rfa',
    name: 'AdminRFA',
    component: admin_rfa,
    meta: { requiresAdmin: true, role: 'admin' },
  },
  {
    path: '/admin-appointment',
    name: 'AdminAppointment',
    component: admin_appointment,
    meta: { requiresAdmin: true, role: 'admin' },
  },
  {
    path: '/admin-result',
    name: 'AdminResult',
    component: admin_result,
    meta: { requiresAdmin: true, role: 'admin' },
  },

  // User Routes
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/payments', name: 'Payments', component: Payments, meta: { requiresAuth: true } },
  { path: '/billing', name: 'Billing', component: Billing, meta: { requiresAuth: true } },
  { path: '/invoices', name: 'Invoices', component: Invoices, meta: { requiresAuth: true } },
  { path: '/settings', name: 'Settings', component: settings, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: profile, meta: { requiresAuth: true } },
  { path: '/edit_profile', name: 'EditProfile', component: edit_profile, meta: { requiresAuth: true } },
  { path: '/appointment', name: 'Appointment', component: appointment, meta: { requiresAuth: true } },
  { path: '/result', name: 'Result', component: result, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔒 Navigation Guards
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // Wait for Firebase auth to resolve current user
  if (auth.currentUser === null) {
    await new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
      });
    });
  }

  const currentUser = auth.currentUser;

  // For admin routes
  if (requiresAdmin) {
    if (!currentUser) return next('/login');

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role === 'admin') {
        return next();
      } else {
        return next('/dashboard');
      }
    } catch (error) {
      console.error('Admin guard error:', error);
      return next('/login');
    }
  }

  // For authenticated user routes
  if (requiresAuth) {
    if (!currentUser) {
      return next('/login');
    }
  }

  // For public routes or landing page
  return next();
});

export default router;
