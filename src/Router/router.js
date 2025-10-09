import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Public pages
import LandingPage from '../pages/LandingPage.vue';
import Login from '@/pages/login.vue';
import Register from '../pages/register.vue';
import ResetPassword from '../pages/reset_password.vue';

// User pages
import Dashboard from '../pages/user-pages/dashboard.vue';
import Payments from '../pages/user-pages/payments.vue';
import Billing from '../pages/user-pages/billing.vue';
import Invoices from '../pages/user-pages/invoices.vue';
import Settings from '../pages/user-pages/settings.vue';
import Profile from '../pages/user-pages/profile.vue';
import EditProfile from '../pages/user-pages/edit_profile.vue';
import Appointment from '../pages/user-pages/appointment.vue';
import Result from '../pages/user-pages/result.vue';

// Admin pages
import AdminDashboard from '../pages/admin-pages/admin_dasboard.vue';
import AdminInvoices from '../pages/admin-pages/admin_invoices.vue';
import AdminManagement from '../pages/admin-pages/admin_management.vue';
import AdminServices from '../pages/admin-pages/admin_services.vue';
import AdminRfa from '../pages/admin-pages/admin_rfa.vue';
import AdminAppointment from '../pages/admin-pages/admin_appointment.vue';
import AdminResult from '../pages/admin-pages/admin_result.vue';

// 404 Page
import NotFound from '../pages/notFound.vue';

const routes = [
  // Default route (Landing Page)
  { path: '/', name: 'LandingPage', component: LandingPage },

  // Public routes
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/reset_password', name: 'ResetPassword', component: ResetPassword },

  // Admin Routes
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-invoices',
    name: 'AdminInvoices',
    component: AdminInvoices,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-management',
    name: 'AdminManagement',
    component: AdminManagement,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-services',
    name: 'AdminServices',
    component: AdminServices,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-rfa',
    name: 'AdminRFA',
    component: AdminRfa,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-appointment',
    name: 'AdminAppointment',
    component: AdminAppointment,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin-result',
    name: 'AdminResult',
    component: AdminResult,
    meta: { requiresAdmin: true },
  },

  // User Routes
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/payments', name: 'Payments', component: Payments, meta: { requiresAuth: true } },
  { path: '/billing', name: 'Billing', component: Billing, meta: { requiresAuth: true } },
  { path: '/invoices', name: 'Invoices', component: Invoices, meta: { requiresAuth: true } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/edit_profile', name: 'EditProfile', component: EditProfile, meta: { requiresAuth: true } },
  { path: '/appointment', name: 'Appointment', component: Appointment, meta: { requiresAuth: true } },
  { path: '/result', name: 'Result', component: Result, meta: { requiresAuth: true } },

  // Catch-all (404)
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Helper: ensure Firebase user is loaded
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        unsub();
        resolve(user);
      },
      reject
    );
  });
}

// 🔒 Navigation Guards
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  const currentUser = await getCurrentUser();

  if (requiresAdmin) {
    if (!currentUser) return next('/login');

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role === 'admin') return next();
      return next('/dashboard'); // redirect non-admins
    } catch (error) {
      console.error('Admin guard error:', error);
      return next('/login');
    }
  }

  if (requiresAuth && !currentUser) {
    return next('/login');
  }

  return next();
});

export default router;
