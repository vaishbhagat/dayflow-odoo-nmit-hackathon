import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr, fmt = 'MMM d, yyyy') {
  if (!dateStr) return '—';
  try {
    return format(typeof dateStr === 'string' ? parseISO(dateStr) : dateStr, fmt);
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(typeof dateStr === 'string' ? parseISO(dateStr) : dateStr, 'hh:mm a');
  } catch {
    return '—';
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calcLeaveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return Math.max(0, differenceInDays(end, start) + 1);
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getMonthName(month) {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
}

export const DEPARTMENTS = ['Engineering', 'Marketing', 'HR', 'Finance', 'Sales', 'Operations'];
export const DESIGNATIONS = [
  'Senior Software Engineer', 'Software Engineer', 'DevOps Engineer', 'QA Engineer',
  'Marketing Manager', 'Content Strategist', 'Sales Executive', 'Finance Analyst',
  'CFO', 'HR Officer', 'Product Manager', 'Designer',
];
export const LEAVE_TYPES = ['Paid', 'Sick', 'Unpaid'];
export const EMPLOYMENT_STATUSES = ['Active', 'On Leave', 'Terminated'];
export const ROLES = ['Employee', 'HR/Admin'];

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
];

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function MONTHS() {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  }));
}
