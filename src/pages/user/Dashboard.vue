<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-10">
      
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p class="text-slate-500 mt-1 font-medium">Welcome back! Monitoring your clinical appointments and invoices.</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="refreshPage"
            class="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-teal-700 bg-white border border-teal-100 rounded-2xl hover:bg-teal-50 transition shadow-sm active:scale-95"
          >
            <RefreshCw :class="{ 'animate-spin': loading }" class="h-4 w-4" />
            Sync Data
          </button>
          <button
            @click="goToAppointments"
            class="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-2xl hover:bg-teal-700 transition shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus class="h-4 w-4" />
            Book Visit
          </button>
        </div>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="loading" class="animate-pulse space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-32 bg-slate-100 rounded-3xl border border-slate-200"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div class="lg:col-span-2 h-96 bg-slate-100 rounded-3xl"></div>
           <div class="lg:col-span-1 h-96 bg-slate-100 rounded-3xl"></div>
        </div>
      </div>

      <div v-else class="space-y-10">
        <!-- Quick Stats Grid -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider">Unpaid Balance</p>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-black text-slate-900">₱{{ unpaidTotalAmount.toLocaleString() }}</p>
              <span class="text-xs font-bold text-rose-500">{{ unpaidClaims }} Invoices</span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <Clock class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Visits</p>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-black text-slate-900">{{ pendingAppointmentsCount }}</p>
              <span class="text-xs font-bold text-amber-500">Awaiting Approval</span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 rounded-2xl bg-teal-50 text-teal-600">
                <CheckCircle2 class="w-6 h-6" />
              </div>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed Tests</p>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-black text-slate-900">{{ paidClaims }}</p>
              <span class="text-xs font-bold text-teal-500">Verified Results</span>
            </div>
          </div>
        </section>

        <!-- Main Dashboard Content -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Appointment Calendar/List Detail -->
          <div class="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <CalendarDays class="w-5 h-5" />
                </div>
                <div>
                  <h2 class="text-lg font-black text-slate-900">Upcoming Schedule</h2>
                  <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Appointment Details</p>
                </div>
              </div>
              <router-link to="/appointment" class="text-xs font-bold text-indigo-600 hover:underline">View All</router-link>
            </div>

            <div class="p-6 space-y-4 max-h-125 overflow-y-auto custom-scroll">
              <div v-if="appointments.length === 0" class="py-20 text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarX class="w-8 h-8 text-slate-300" />
                </div>
                <p class="text-slate-400 font-bold">No appointments scheduled.</p>
              </div>

              <div
                v-for="appt in recentAppointments"
                :key="appt.id"
                class="group bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div class="space-y-3 flex-1">
                    <div class="flex items-center gap-3">
                      <span :class="['px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider', getStatusStyle(appt.status)]">
                        {{ appt.status }}
                      </span>
                      <span class="text-sm font-black text-slate-900">{{ formattedDate(appt.date) }}</span>
                    </div>
                    
                    <div>
                      <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selected Services</h4>
                      <div class="flex flex-wrap gap-2">
                        <span 
                          v-for="s in appt.services" 
                          :key="s.id"
                          class="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 shadow-sm"
                        >
                          {{ s.serviceName }}
                        </span>
                      </div>
                    </div>

                    <div v-if="appt.notes" class="bg-white/50 border border-slate-100 p-3 rounded-xl">
                      <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Notes</p>
                      <p class="text-xs text-slate-600 leading-relaxed italic">"{{ appt.notes }}"</p>
                    </div>
                  </div>

                  <div class="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0">
                    <div class="text-right">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booked On</p>
                      <p class="text-xs font-bold text-slate-700">{{ formatFullTimestamp(appt.createdAt) }}</p>
                    </div>
                    <button @click="goToAppointments" class="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                      <ChevronRight class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Side Panel: Recent Invoices -->
          <div class="lg:col-span-4 space-y-8">
            <div class="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 overflow-hidden">
               <div class="flex items-center justify-between mb-6">
                  <h2 class="text-lg font-black text-slate-900">Recent Bills</h2>
                  <router-link to="/invoices" class="text-xs font-bold text-teal-600 hover:underline">History</router-link>
               </div>

               <div class="space-y-4">
                  <div 
                    v-for="inv in recentInvoices" 
                    :key="inv.id"
                    @click="goToInvoices"
                    class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div class="flex items-center gap-3">
                      <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', inv.status?.toLowerCase() === 'paid' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600']">
                        <CreditCard class="w-5 h-5" />
                      </div>
                      <div>
                        <p class="text-xs font-black text-slate-900">#{{ inv.id.slice(-6).toUpperCase() }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ formatDateOnly(inv.createdAt) }}</p>
                      </div>
                    </div>
                    <p class="text-sm font-black text-slate-900">₱{{ calculateInvoiceTotal(inv).toLocaleString() }}</p>
                  </div>

                  <div v-if="invoices.length === 0" class="py-10 text-center text-slate-400 text-xs font-bold">
                    No recent billing activity.
                  </div>
               </div>
            </div>

            <!-- Promotion/Help Card -->
            <div class="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
              <div class="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl group-hover:bg-teal-500/30 transition-all duration-500"></div>
              <div class="relative z-10">
                <h3 class="text-xl font-black mb-2">Need Assistance?</h3>
                <p class="text-slate-400 text-xs leading-relaxed mb-6">Our medical staff is ready to help you with your laboratory inquiries and results interpretation.</p>
                <button @click="router.push('/profile')" class="w-full py-3 bg-white text-slate-900 font-black rounded-2xl text-xs hover:bg-teal-50 transition-all active:scale-95 shadow-xl shadow-white/5">
                  Contact Support
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import UserLayout from "@/components/UserLayout.vue";
import { useAuth } from "@/composables/useAuth";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Plus,
  CalendarDays,
  CalendarX,
  CreditCard,
  ChevronRight
} from "lucide-vue-next";

const router = useRouter();
const { user, loading: authLoading } = useAuth();

const invoices = ref([]);
const appointments = ref([]);
const dataLoading = ref(false);
const loading = computed(() => authLoading.value || dataLoading.value);

const unpaidTotalAmount = ref(0);
const unpaidClaims = ref(0);
const paidClaims = ref(0);

const fetchInvoicesByEmail = async (email) => {
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    invoices.value = docs;

    unpaidTotalAmount.value = 0;
    unpaidClaims.value = 0;
    paidClaims.value = 0;

    for (const inv of docs) {
      const status = (inv.status || "").toLowerCase();
      const amt = Number(inv.totalAmount || inv.services?.reduce((s, it) => s + (it.amount || 0), 0) || 0);

      if (status === "paid") paidClaims.value++;
      else {
        unpaidClaims.value++;
        unpaidTotalAmount.value += amt;
      }
    }
  } catch (err) {
    console.error("Error fetching invoices:", err);
  }
};

const fetchAppointmentsByEmail = async (email) => {
  try {
    const q = query(collection(db, "appointments"), where("email", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    appointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};

const initData = async () => {
  if (user.value?.email) {
    dataLoading.value = true;
    await Promise.all([
      fetchInvoicesByEmail(user.value.email),
      fetchAppointmentsByEmail(user.value.email)
    ]);
    dataLoading.value = false;
  }
};

onMounted(initData);
watch(user, (newUser) => {
  if (newUser?.email) initData();
});

const calculateInvoiceTotal = (inv) =>
  inv.services?.reduce((s, it) => s + (Number(it.amount) || 0), 0) || Number(inv.totalAmount || 0);

const formattedDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatFullTimestamp = (ts) => {
  if (!ts?.seconds) return "-";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatDateOnly = (ts) => {
  if (!ts?.seconds) return "-";
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes('approve') || s.includes('confirm')) return 'bg-teal-100 text-teal-700';
  if (s.includes('decline') || s.includes('cancel')) return 'bg-rose-100 text-rose-700';
  return 'bg-amber-100 text-amber-700';
};

const pendingAppointmentsCount = computed(() => 
  appointments.value.filter(a => a.status?.toLowerCase() === 'pending').length
);

const recentAppointments = computed(() => appointments.value.slice(0, 5));
const recentInvoices = computed(() => invoices.value.slice(0, 4));

const goToInvoices = () => router.push("/invoices");
const goToAppointments = () => router.push("/appointment");

const refreshPage = async () => {
  await initData();
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
