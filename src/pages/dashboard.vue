<template>
    <div class="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div class="flex-1 p-6">
        <!-- Dashboard Cards -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h3 class="text-gray-600 text-sm mb-2">Total Revenue</h3>
            <p class="text-2xl font-semibold text-green-600">${{ totalRevenue.toLocaleString() }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h3 class="text-gray-600 text-sm mb-2">Pending Claims</h3>
            <p class="text-2xl font-semibold text-yellow-500">{{ pendingClaims }}</p>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
            <h3 class="text-gray-600 text-sm mb-2">Outstanding Payments</h3>
            <p class="text-2xl font-semibold text-red-500">${{ outstandingPayments.toLocaleString() }}</p>
          </div>
        </section>
  
        <!-- Invoices Section -->
        <section class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Recent Invoices</h3>
        <div class="overflow-x-auto">
            <table class="min-w-full table-auto border-collapse">
            <thead>
                <tr class="bg-gray-100 text-gray-700 text-left text-sm">
                <th class="px-4 py-3">Invoice #</th>
                <th class="px-4 py-3">Amount</th>
                <th class="px-4 py-3">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr
                v-for="invoice in invoices"
                :key="invoice.id"
                class="border-t hover:bg-gray-50 transition text-gray-800"
                >
                <td class="px-4 py-3 font-medium">{{ invoice.id }}</td>
                <td class="px-4 py-3 font-medium">${{ invoice.totalAmount?.toLocaleString() }}</td>
                <td class="px-4 py-3 font-medium" :class="getStatusClass(invoice.status)">
                    {{ invoice.status }}
                </td>
                </tr>
                <tr v-if="invoices.length === 0">
                <td colspan="3" class="px-4 py-4 text-center text-gray-400">No invoices found.</td>
                </tr>
            </tbody>
            </table>
        </div>
        </section>
      </div>
    </div>
  </template>
  
  <script setup>
  import Sidebar from '../components/sidebar.vue'
  import { ref, onMounted } from 'vue'
  import { getAuth, onAuthStateChanged } from 'firebase/auth'
  import { db } from '../firebase'
  import { collection, query, where, getDocs } from 'firebase/firestore'
  
  const totalRevenue = ref(1200000)
  const pendingClaims = ref(45)
  const outstandingPayments = ref(250000)
  const invoices = ref([])
  
  const auth = getAuth()
  
  // Fetch invoices from Firestore for current user's email
  const fetchInvoicesByEmail = async (email) => {
    try {
      const q = query(collection(db, 'invoices'), where('email', '==', email))
      const querySnapshot = await getDocs(q)
      invoices.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }
  
  // Listen for auth state and fetch invoices if user is logged in
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        fetchInvoicesByEmail(user.email)
      }
    })
  })
  
  // Return status classes
  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid':
        return 'text-green-600'
      case 'pending':
        return 'text-yellow-600'
      case 'overdue':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }
  </script>
  