<template>
  <UserLayout>
    <div class="max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-950">Property Hub</h1>
          <p class="text-base text-slate-600 mt-1">Hello, Here is your real-time property insight.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative group">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <input
              type="text"
              placeholder="Search properties, invoices..."
              class="pl-11 pr-4 py-2.5 text-sm border border-slate-100 rounded-xl bg-slate-50/70 focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white outline-none w-full sm:w-80 transition-all shadow-inner"
            />
          </div>
          <button
            @click="refreshPage"
            class="inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-xl hover:bg-teal-100 transition shadow-sm"
          >
            <RefreshCw :class="{ 'animate-spin': loading }" class="h-4 w-4" />
            Update Data
          </button>
        </div>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="loading" class="animate-pulse space-y-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-1 flex flex-col gap-6">
            <div v-for="i in 3" :key="i" class="bg-slate-100 border border-slate-200 p-6 rounded-2xl min-h-35 flex flex-col justify-between">
              <div class="h-5 bg-slate-200 rounded w-1/2"></div>
              <div class="h-8 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
          <div class="lg:col-span-2 bg-slate-100 border border-slate-200 rounded-2xl min-h-100"></div>
        </div>
        <div class="bg-slate-100 border border-slate-200 rounded-3xl min-h-62.5"></div>
      </div>

      <section v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-1 flex flex-col gap-6">
          <div class="bg-white border border-neutral-300 p-6 rounded-2xl transition-all flex flex-col justify-between min-h-40">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="p-3.5 rounded-xl bg-red-50 text-red-600">
                  <AlertCircle class="w-6 h-6" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">Spent This Month</p>
                  <p class="text-xs text-slate-500">Unsettled Invoices</p>
                </div>
              </div>
              <div class="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">+2.45%</div>
            </div>
            <div class="mt-4 flex items-end justify-between">
                <p class="text-3xl font-extrabold text-slate-950">
                  ₱{{ unpaidTotalAmount.toLocaleString('en-US',{ minimumFractionDigits: 2 }) }}
                </p>
                <div class="flex gap-1 items-end h-10 w-20">
                  <div class="w-2.5 h-6 bg-red-100 rounded-full"></div>
                  <div class="w-2.5 h-8 bg-red-100 rounded-full"></div>
                  <div class="w-2.5 h-10 bg-red-200 rounded-full"></div>
                  <div class="w-2.5 h-7 bg-red-100 rounded-full"></div>
                </div>
            </div>
          </div>

          <div class="bg-white border border-neutral-300 p-6 rounded-2xl transition-all flex items-center gap-6">
            <div class="p-4 rounded-xl bg-amber-50 text-amber-600">
              <Clock class="w-7 h-7" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">New Claims</p>
              <p class="text-2xl font-bold text-amber-700 mt-0.5">{{ unpaidClaims }} <span class="text-xs text-amber-500 font-medium">Pending</span></p>
            </div>
            <svg class="w-16 h-8 text-amber-200 ml-auto" viewBox="0 0 100 30">
                <polyline fill="none" stroke="currentColor" stroke-width="2" points="0,20 15,10 30,25 45,5 60,15 75,5 90,25" />
             </svg>
          </div>

          <div class="bg-white border border-neutral-300 p-6 rounded-2xl transition-all flex items-center gap-6">
            <div class="p-4 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 class="w-7 h-7" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">Total Settled Invoices</p>
              <p class="text-2xl font-bold text-teal-800 mt-0.5">{{ paidClaims }} <span class="text-xs text-teal-600 font-medium">Verified</span></p>
            </div>
             <svg class="w-16 h-8 text-teal-200 ml-auto" viewBox="0 0 100 30">
                <polyline fill="none" stroke="currentColor" stroke-width="2" points="0,25 15,15 30,20 45,5 60,15 75,10 90,5" />
             </svg>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white border border-neutral-300 rounded-2xl overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                <CalendarDays class="w-6 h-6" />
              </div>
              <h2 class="text-lg font-bold text-slate-900">Calendar</h2>
            </div>
            <button
              @click="goToAppointments"
              class="text-xs font-semibold text-teal-700 hover:text-teal-800 transition px-4 py-2 rounded-xl bg-teal-50 border border-teal-100"
            >
              Schedule New Appointment
            </button>
          </div>

          <div class="p-7 flex-1">
            <div v-if="appointments.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <div class="p-5 bg-slate-50 rounded-full mb-4">
                <CalendarX class="w-12 h-12 text-slate-300" />
              </div>
              <p class="font-semibold text-lg">No appointments found.</p>
              <p class="text-sm">Click the button above to schedule.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                v-for="appt in recentAppointments"
                :key="appt.id"
                class="relative p-5 border border-slate-100 rounded-2xl hover:border-teal-100 transition cursor-pointer flex flex-col h-full bg-slate-50/20"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" :class="getModernStatusPointClass(appt.status)"></span>
                    <h3 class="font-bold text-slate-900 text-base truncate">{{ appt.department }}</h3>
                  </div>
                   <div 
                    class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    :class="getModernStatusClass(appt.status)"
                  >
                    {{ appt.status }}
                  </div>
                </div>
                <p class="text-xs text-slate-500 mb-2 font-medium">{{ formattedDate(appt.date) }}</p>
                <p class="text-xs text-slate-600 grow italic leading-relaxed">
                  "{{ appt.notes || 'No specific notes for this appointment.' }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div class="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div class="p-7 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                        <CreditCard class="w-7 h-7 text-teal-600"/>
                        <div>
                            <h2 class="text-xl font-bold text-slate-950">Invoices & Activity</h2>
                            <p class="text-sm text-slate-500 mt-0.5">Summary of all transactions</p>
                        </div>
                    </div>
                    <button @click="goToInvoices" class="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors">
                        View All History
                        <ChevronRight class="w-4 h-4"/>
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-100 text-slate-500 text-xs font-semibold">
                                <th class="px-7 py-5">Invoice ID</th>
                                <th class="px-7 py-5">Services</th>
                                <th class="px-7 py-5">Status</th>
                                <th class="px-7 py-5">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50/50">
                            <tr
                                v-for="inv in recentInvoices"
                                :key="inv.id"
                                class="hover:bg-teal-50/20 transition-colors cursor-pointer"
                                @click="goToInvoices"
                            >
                                <td class="px-7 py-5 font-mono text-xs text-teal-700 font-semibold">
                                    #{{ inv.shortId }}
                                </td>
                                <td class="px-7 py-5 text-sm text-slate-800 font-medium">
                                    {{ inv.services?.map(s => s.serviceName).join(', ') || 'Facility Use' }}
                                </td>
                                <td class="px-7 py-5">
                                    <div class="flex items-center gap-2.5">
                                       <component
                                        :is="statusIcon(inv.status).icon"
                                        :class="statusIcon(inv.status).class"
                                      />
                                      <span class="text-xs font-semibold capitalize" :class="statusIcon(inv.status).textClass">
                                        {{ inv.status }}
                                      </span>
                                    </div>
                                </td>
                                <td class="px-7 py-5 font-bold text-slate-950 text-base">
                                    ₱{{ calculateInvoiceTotal(inv).toLocaleString('en-US',{ minimumFractionDigits: 2 }) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-sm p-7 flex flex-col justify-between hover:shadow-lg transition-all">
                <div>
                    <h2 class="text-xl font-bold text-slate-950">Payment Cards</h2>
                    <p class="text-sm text-slate-500 mt-1">Manage cards in your digital wallet</p>
                </div>

                <div class="relative h-28 my-6 w-full flex justify-center">
                    <div class="absolute w-40 h-24 bg-slate-900 rounded-xl shadow-lg border border-slate-800 transform rotate-[ -5deg ] translate-x-3 translate-y-3 z-0 opacity-80"></div>
                    <div class="absolute w-40 h-24 bg-teal-950 rounded-xl shadow-lg border border-teal-900 transform rotate-[ -2deg ] translate-x-1.5 translate-y-1.5 z-10"></div>
                    <div class="absolute w-40 h-24 bg-slate-100 rounded-xl shadow-lg border border-slate-200 z-20 flex flex-col p-3 justify-between">
                        <div class="w-7 h-5 bg-teal-600 rounded"></div>
                        <div class="space-y-1">
                            <div class="w-full h-1.5 bg-slate-300 rounded"></div>
                            <div class="w-2/3 h-1.5 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>

                <button class="w-full py-3 bg-teal-600 text-white font-bold rounded-2xl text-sm hover:bg-teal-700 transition flex items-center justify-center gap-2">
                    + Add New Payment Method
                </button>
            </div>
        </div>
      </section>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import UserLayout from "@/components/UserLayout.vue";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  XCircle,
  CalendarDays,
  CalendarX,
  CreditCard,
  ChevronRight
} from "lucide-vue-next";

const router = useRouter();
const auth = getAuth();

const invoices = ref([]);
const appointments = ref([]);
const loading = ref(false);

const unpaidTotalAmount = ref(0);
const unpaidClaims = ref(0);
const paidClaims = ref(0);

const fetchInvoicesByEmail = async (email) => {
  loading.value = true;
  try {
    const q = query(collection(db, "invoices"), where("email", "==", email));
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
  } finally {
    loading.value = false;
  }
};

const fetchAppointmentsByEmail = async (email) => {
  const q = query(collection(db, "appointments"), where("email", "==", email));
  const snap = await getDocs(q);
  appointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user?.email) {
      await fetchInvoicesByEmail(user.email);
      await fetchAppointmentsByEmail(user.email);
    }
  });
});

const calculateInvoiceTotal = (inv) =>
  inv.services?.reduce((s, it) => s + (Number(it.amount) || 0), 0) || Number(inv.totalAmount || 0);

const formattedDate = (ts) =>
  ts?.toDate ? ts.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-";

const goToInvoices = () => router.push("/invoices");
const goToAppointments = () => router.push("/appointment");
const refreshPage = () => {
  loading.value = true;
  setTimeout(() => window.location.reload(), 300);
};

const recentAppointments = computed(() => appointments.value.slice(0, 3));
const recentInvoices = computed(() => invoices.value.slice(0, 5));

const getModernStatusClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes('confirm')) return 'bg-teal-50 text-teal-700 border border-teal-100';
  if (s.includes('cancel')) return 'bg-red-50 text-red-600 border border-red-100';
  return 'bg-amber-50 text-amber-600 border border-amber-100';
}

const getModernStatusPointClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes('confirm')) return 'bg-teal-400';
  if (s.includes('cancel')) return 'bg-red-400';
  return 'bg-amber-400';
}

const statusIcon = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "paid") return { icon: CheckCircle2, class: "w-4 h-4 text-teal-600", textClass: "text-teal-900" };
  if (s === "not paid") return { icon: XCircle, class: "w-4 h-4 text-red-600", textClass: "text-red-900" };
  return { icon: Clock, class: "w-4 h-4 text-amber-600", textClass: "text-amber-900" };
};
</script>
