import { ref } from 'vue';
import { db } from '@/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export function useInvoices() {
  const invoices = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchUserInvoices = async (email, status = null) => {
    loading.value = true;
    error.value = null;
    try {
      let q = query(collection(db, 'invoices'), where('email', '==', email));
      if (status) {
        q = query(q, where('status', '==', status));
      }
      const snap = await getDocs(q);
      invoices.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return invoices.value;
    } catch (err) {
      error.value = err;
      console.error('Error fetching invoices:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const calculateTotal = (invoice) => {
    return (invoice.services || []).reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-teal-100 text-teal-700 border border-teal-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'flagged':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-rose-100 text-rose-700 border border-rose-200';
    }
  };

  const submitPayment = async (invoiceIds, email, method, gcashData = {}) => {
    const results = [];
    for (const id of invoiceIds) {
      const paymentData = {
        invoiceId: id,
        email,
        method,
        status: 'pending',
        submittedAt: serverTimestamp(),
        ...gcashData
      };
      const paymentRef = await addDoc(collection(db, 'payments'), paymentData);
      await updateDoc(doc(db, 'invoices', id), { status: 'pending' });
      results.push(paymentRef.id);
    }
    return results;
  };

  return {
    invoices,
    loading,
    error,
    fetchUserInvoices,
    calculateTotal,
    getStatusStyles,
    submitPayment
  };
}
