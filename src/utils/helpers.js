export function dateKey(d = new Date()) {
  return d.toISOString().split('T')[0];
}

export function getWeekDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function getPastWeekDates() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function getMonthDays(year, month) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d).toISOString().split('T')[0]);
  }
  return days;
}

export function getDaysInRange(startDate, count) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export function calculateStreak(logs) {
  let count = 0;
  const d = new Date();
  while (true) {
    const key = dateKey(d);
    const entry = logs[key];
    if (!entry || (typeof entry === 'object' && entry.count === 0)) break;
    if (entry === true || (typeof entry === 'object' && entry.count > 0)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return count;
}

export function calculateBestStreak(logs) {
  const sorted = Object.keys(logs).sort();
  if (sorted.length === 0) return 0;
  let best = 0;
  let current = 0;
  const today = dateKey();
  for (let i = 0; i < sorted.length; i++) {
    const entry = logs[sorted[i]];
    const completed = entry === true || (typeof entry === 'object' && entry.count > 0);
    if (completed) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

export function totalCompletions(logs) {
  return Object.values(logs).filter(
    (entry) => entry === true || (typeof entry === 'object' && entry.count > 0)
  ).length;
}

export function weeklyCompletionRate(logs) {
  const week = getWeekDates();
  let completed = 0;
  for (const date of week) {
    const entry = logs[date];
    if (entry === true || (typeof entry === 'object' && entry.count > 0)) {
      completed++;
    }
  }
  return week.length > 0 ? Math.round((completed / week.length) * 100) : 0;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function isToday(dateStr) {
  return dateStr === dateKey();
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
