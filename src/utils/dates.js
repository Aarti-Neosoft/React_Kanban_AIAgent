/**
 * Dates from an HTML date input are calendar dates, not timestamps. Keep them
 * in YYYY-MM-DD form and construct local dates when comparing or displaying.
 */
export const isDateOnly = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const dateFromDateOnly = (value) => {
  if (!isDateOnly(value)) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Reject impossible calendar dates such as 2026-02-30.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

export const formatDueDate = (dueDate) => {
  const date = dateFromDateOnly(dueDate);
  if (!date) return '';

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const isOverdue = (dueDate, status) => {
  if (status === 'done') return false;

  const due = dateFromDateOnly(dueDate);
  if (!due) return false;

  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due < todayAtMidnight;
};
