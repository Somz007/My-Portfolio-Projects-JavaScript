// pure utility functions — no DOM, no storage

// converts a "YYYY-MM-DD" string to a display label + CSS class
// returns null if no date is set
export function formatDueDate(dateStr) {
  if (!dateStr) return null;

  const due   = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due - today) / 86_400_000);

  if (diffDays < 0)   return { label: 'Overdue',  cls: 'overdue'  };
  if (diffDays === 0) return { label: 'Today',     cls: 'today'    };
  if (diffDays === 1) return { label: 'Tomorrow',  cls: 'tomorrow' };

  return {
    label: due.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    cls:   'future',
  };
}

// truncates a string and adds ellipsis if over the max length
export function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
