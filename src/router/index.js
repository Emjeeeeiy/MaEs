import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Public pages
import LandingPage from '../pages/LandingPage.vue';
const Login = () => import('../pages/Login.vue');
const Register = () => import('../pages/Register.vue');
const ResetPassword = () => import('../pages/ResetPassword.vue');

// User pages
const UserDashboard = () => import('../pages/user/Dashboard.vue');
const UserPayments = () => import('../pages/user/Payments.vue');
const UserBilling = () => import('../pages/user/Billing.vue');
const UserInvoices = () => import('../pages/user/Invoices.vue');
const UserProfile = () => import('../pages/user/Profile.vue');
const UserEditProfile = () => import('../pages/user/EditProfile.vue');
const UserAppointment = () => import('../pages/user/Appointment.vue');
const UserResult = () => import('../pages/user/Result.vue');

// Admin pages
const AdminDashboard = () => import('../pages/admin/Dashboard.vue');
const AdminInvoices = () => import('../pages/admin/Invoices.vue');
const AdminManagement = () => import('../pages/admin/Management.vue');
const AdminServices = () => import('../pages/admin/Services.vue');
const AdminRfa = () => import('../pages/admin/Rfa.vue');
const AdminAppointment = () => import('../pages/admin/Appointment.vue');
const AdminResult = () => import('../pages/admin/Result.vue');

// 404 Page
const NotFound = () => import('../pages/NotFound.vue');

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
  { path: '/dashboard', name: 'Dashboard', component: UserDashboard, meta: { requiresAuth: true } },
  { path: '/payments', name: 'Payments', component: UserPayments, meta: { requiresAuth: true } },
  { path: '/billing', name: 'Billing', component: UserBilling, meta: { requiresAuth: true } },
  { path: '/invoices', name: 'Invoices', component: UserInvoices, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: UserProfile, meta: { requiresAuth: true } },
  { path: '/edit_profile', name: 'EditProfile', component: UserEditProfile, meta: { requiresAuth: true } },
  { path: '/appointment', name: 'Appointment', component: UserAppointment, meta: { requiresAuth: true } },
  { path: '/result', name: 'Result', component: UserResult, meta: { requiresAuth: true } },

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

  const hasAccount = localStorage.getItem('hasAccount'); // true if they already signed up

  // Logic for landing page redirect
  if (to.name === 'LandingPage' && hasAccount) {
    // If user already has an account, redirect to login
    return next('/login');
  }

  // Admin-only guard
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

  // Auth-only pages
  if (requiresAuth && !currentUser) {
    return next('/login');
  }

  return next();
});

export default router;
