export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₦0';
  return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');
};

// export const formatDate = (date) => {
//   if (!date) return '';
//   const d = new Date(date);
//   return d.toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });
// };

// export const formatShortDate = (date) => {
//   if (!date) return '';
//   const d = new Date(date);
//   return d.toLocaleDateString('en-US', {
//     month: '2-digit',
//     day: '2-digit',
//     year: 'numeric'
//   });
// };