<template>
  <AdminLayout>
    <div class="min-h-screen bg-gray-50/50 dark:bg-[#121212] p-6 text-gray-900 dark:text-gray-100 font-sans">
      
      <!-- Section Workspaces Title Block -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200/60 dark:border-gray-800/60">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Patient Diagnostic Matrix
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 border border-gray-200/40 dark:border-gray-800/40">
              {{ Object.keys(groupedInvoices).length }} Account{{ Object.keys(groupedInvoices).length !== 1 ? 's' : '' }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Suriin ang mga account ng pasyente, tingnan ang kanilang mga invoice, at ilagay ang kaukulang mga medical o service results.</p>
        </div>
      </header>

      <!-- Search Control Input Toolbar -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl p-4 shadow-2xs mb-6">
        <div class="relative w-full max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search accounts by patient email address..."
            class="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200/60 dark:border-gray-800/60 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition"
          />
          <SearchIcon class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <!-- Patients Accounts Master Ledger Table -->
      <div class="bg-white dark:bg-[#1a1a1a] border border-gray-200/70 dark:border-gray-800/70 rounded-xl shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500 font-medium">
                <th class="px-6 py-3.5 font-medium">Registered Patient Email</th>
                <th class="px-6 py-3.5 font-medium text-right pr-8">Record Ledger</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800/40 text-gray-700 dark:text-gray-300">
              <tr
                v-for="(group, email) in groupedInvoices"
                :key="email"
                class="hover:bg-gray-50/40 dark:hover:bg-[#222]/10 transition"
              >
                <!-- Email Identity Block -->
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2.5">
                  <div class="p-1 rounded-md bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-gray-800/60">
                    <User2Icon class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <span>{{ email }}</span>
                </td>
                
                <!-- Quick Navigation Action -->
                <td class="px-6 py-4 text-right pr-8 whitespace-nowrap">
                  <button
                    @click="openInvoiceList(email)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 font-medium transition shadow-2xs active:scale-98"
                  >
                    <ClipboardListIcon class="w-3.5 h-3.5 text-gray-400" />
                    <span>View Invoices</span>
                  </button>
                </td>
              </tr>

              <!-- Nested Matrix Empty State Wrapper -->
              <tr v-if="Object.keys(groupedInvoices).length === 0">
                <td colspan="2" class="text-center py-12 text-gray-400 bg-gray-50/20 dark:bg-transparent">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <InboxIcon class="w-5 h-5 text-gray-300" />
                    <span>No verified patient accounts tracked inside this query.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ================= MODAL MASTER STAGE 1: LIST OF INVOICES ================= -->
      <transition name="fade">
        <div
          v-if="selectedEmail"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-xs px-4"
          @click="selectedEmail = null"
        >
          <div 
            class="bg-white dark:bg-[#1a1a1a] w-full max-w-xl p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl relative animate-fadeIn space-y-4"
            @click.stop
          >
            <!-- Modal Header Block -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <ClipboardListIcon class="w-4 h-4 text-gray-400" />
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Invoices Registry</h3>
                  <p class="text-[11px] text-gray-400 mt-0.5">{{ selectedEmail }}</p>
                </div>
              </div>
              <button @click="selectedEmail = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-xs">✕</button>
            </div>

            <!-- Scrollable Content Stack -->
            <div class="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-for="invoice in groupedInvoices[selectedEmail]"
                :key="invoice.id"
                @click="openResultModal(invoice)"
                class="group p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/30 dark:bg-[#222]/10 cursor-pointer transition flex items-center justify-between gap-4"
              >
                <div class="space-y-1">
                  <p class="text-[11px] text-gray-400 uppercase tracking-wider font-mono">ID: #{{ invoice.id.substring(0, 8) || 'N/A' }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    Issued On: <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(invoice.createdAt) }}</span>
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <!-- Modernized Status Chips context -->
                  <span
                    class="inline-flex items-center px-2 py-0.5 text-[10px] rounded font-semibold tracking-wide uppercase"
                    :class="{
                      'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20': invoice.status === 'Paid',
                      'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20': invoice.status === 'Pending',
                      'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/20': invoice.status === 'Not Paid',
                    }"
                  >
                    {{ invoice.status || 'N/A' }}
                  </span>
                  
                  <ChevronRightIcon class="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- ================= MODAL MASTER STAGE 2: ENTER DIAGNOSTIC RESULTS ================= -->
      <transition name="fade">
        <div
          v-if="selectedInvoice"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-xs px-4"
          @click="selectedInvoice = null"
        >
          <div 
            class="bg-white dark:bg-[#1a1a1a] w-full max-w-xl p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl relative animate-fadeIn space-y-4"
            @click.stop
          >
            <!-- Modal Header Block -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <Edit3Icon class="w-4 h-4 text-gray-400" />
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Encode Technical Results</h3>
                  <p class="text-[11px] text-gray-400 mt-0.5">Ipasok ang mga kaukulang datus para sa bawat serbisyo sa ibaba.</p>
                </div>
              </div>
              <button @click="selectedInvoice = null" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-xs">✕</button>
            </div>

            <!-- Scrollable Dynamic Form Workspace Inputs -->
            <div class="space-y-4 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              <div
                v-for="svc in selectedInvoice.services"
                :key="svc.serviceName"
                class="space-y-1.5"
              >
                <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  {{ svc.serviceName }}
                </label>
                <textarea
                  v-model="results[selectedInvoice.id + '_' + svc.serviceName]"
                  placeholder="Provide explicit parameters, diagnostic records, or completions metrics for this track..."
                  rows="3"
                  class="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            <!-- Form Control Action Footers -->
            <div class="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                @click="selectedInvoice = null"
                class="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-[#222] border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 transition"
              >
                Cancel
              </button>
              <button
                @click="submitResults(selectedInvoice)"
                class="inline-flex items-center gap-1 px-4 py-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-xs font-medium transition active:scale-97"
              >
                <CheckIcon class="w-3.5 h-3.5" /> 
                <span>Save Report</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, updateDoc, doc, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import AdminLayout from "@/components/AdminLayout.vue";
import { 
  User2 as User2Icon, 
  ClipboardList as ClipboardListIcon, 
  Edit3 as Edit3Icon, 
  Check as CheckIcon,
  Search as SearchIcon,
  Inbox as InboxIcon,
  ChevronRight as ChevronRightIcon
} from "lucide-vue-next";
import { useNotifications } from "@/composables/useNotifications";

const invoices = ref([]);
const searchQuery = ref("");
const selectedEmail = ref(null);
const selectedInvoice = ref(null);
const results = ref({});
const { success: notifySuccess, error: notifyError } = useNotifications();

const fetchInvoices = async () => {
  const snap = await getDocs(query(collection(db, "invoices"), orderBy("createdAt", "desc")));
  invoices.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

onMounted(fetchInvoices);

const groupedInvoices = computed(() => {
  const grouped = {};
  invoices.value.forEach((inv) => {
    if (!inv.email) return;
    const email = inv.email.toLowerCase();
    if (!grouped[email]) grouped[email] = [];
    grouped[email].push(inv);
  });

  const filtered = {};
  const search = searchQuery.value.toLowerCase();
  Object.entries(grouped).forEach(([email, data]) => {
    if (email.includes(search)) filtered[email] = data;
  });

  return filtered;
});

const formatDate = (ts) => {
  if (!ts?.toDate) return "N/A";
  return ts.toDate().toISOString().split("T")[0];
};

const openInvoiceList = (email) => {
  selectedEmail.value = email;
};

const openResultModal = (invoice) => {
  selectedInvoice.value = invoice;
  invoice.services.forEach((svc) => {
    results.value[invoice.id + "_" + svc.serviceName] = svc.result || "";
  });
};

const submitResults = async (invoice) => {
  const updatedServices = invoice.services.map((svc) => ({
    ...svc,
    result: results.value[invoice.id + "_" + svc.serviceName] || "",
  }));

  try {
    await updateDoc(doc(db, "invoices", invoice.id), { services: updatedServices });
    
    // Send Notification to User
    await addDoc(collection(db, 'notifications'), {
      userEmail: invoice.email,
      type: 'result-updated',
      message: `Your medical results for ${updatedServices.map(s => s.serviceName).join(', ')} have been updated.`,
      createdAt: serverTimestamp(),
      read: false
    })

    invoice.services = updatedServices;
    selectedInvoice.value = null;
    notifySuccess("Results saved successfully!");
  } catch (err) {
    notifyError("Error saving results: " + err.message);
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
</style>
