export function fullName(user) {
  if (!user) return '-';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function money(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function percent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}
