export function useFormat() {
  const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = ts.toDate ? ts.toDate() : (ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return {
    formatDate,
    formatCurrency,
  };
}
