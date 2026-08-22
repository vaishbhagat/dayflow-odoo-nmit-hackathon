import { cn } from '@/lib/utils';

const STATUS_MAP = {
  // Attendance
  Present:    { label: 'Present',    cls: 'badge-present' },
  Absent:     { label: 'Absent',     cls: 'badge-absent' },
  'Half-day': { label: 'Half-day',   cls: 'badge-halfday' },
  Leave:      { label: 'On Leave',   cls: 'badge-leave' },
  // Leave requests
  Pending:    { label: 'Pending',    cls: 'badge-pending' },
  Approved:   { label: 'Approved',   cls: 'badge-approved' },
  Rejected:   { label: 'Rejected',   cls: 'badge-rejected' },
  // Employment
  Active:         { label: 'Active',       cls: 'badge-active' },
  'On Leave':     { label: 'On Leave',     cls: 'badge-onleave' },
  Terminated:     { label: 'Terminated',   cls: 'badge-terminated' },
  // Leave types
  Paid:   { label: 'Paid',   cls: 'bg-sky-50 text-sky-700 border border-sky-200/60' },
  Sick:   { label: 'Sick',   cls: 'bg-rose-50 text-rose-700 border border-rose-200/60' },
  Unpaid: { label: 'Unpaid', cls: 'bg-zinc-100 text-zinc-600 border border-zinc-200' },
  // Roles
  'HR/Admin': { label: 'HR/Admin',  cls: 'bg-violet-50 text-violet-700 border border-violet-200/60' },
  Employee:   { label: 'Employee',  cls: 'bg-zinc-100 text-zinc-600 border border-zinc-200' },
};

export function StatusBadge({ status, className }) {
  const config = STATUS_MAP[status] || { label: status, cls: 'bg-zinc-100 text-zinc-600' };
  return (
    <span className={cn('badge', config.cls, className)}>
      {config.label}
    </span>
  );
}
