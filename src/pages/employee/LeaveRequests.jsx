import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, FileText } from 'lucide-react';
import { useMyLeaves, useSubmitLeave } from '@/hooks/useLeave';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, calcLeaveDays, LEAVE_TYPES } from '@/lib/utils';
import toast from 'react-hot-toast';

const leaveSchema = z.object({
  leave_type: z.enum(['Paid', 'Sick', 'Unpaid']),
  start_date: z.string().min(1, 'Start date required'),
  end_date:   z.string().min(1, 'End date required'),
  remarks:    z.string().optional(),
}).refine(d => d.end_date >= d.start_date, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export default function LeaveRequests() {
  const { data: leaves = [], isLoading } = useMyLeaves();
  const submitLeave = useSubmitLeave();
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leave_type: 'Paid' },
  });

  const startDate = watch('start_date');
  const endDate   = watch('end_date');
  const days = calcLeaveDays(startDate, endDate);

  const onSubmit = async (values) => {
    try {
      await submitLeave.mutateAsync(values);
      toast.success('Leave request submitted!');
      reset();
      setShowForm(false);
    } catch (e) {
      toast.error(e.message || 'Failed to submit');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Leave Requests"
        subtitle="Apply for leave and track your request history"
        action={
          <button onClick={() => setShowForm(v => !v)} className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" />
            {showForm ? 'Cancel' : 'Apply for Leave'}
          </button>
        }
      />

      {/* Application form */}
      {showForm && (
        <div className="df-card p-6 border-indigo-200 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-900">New Leave Application</h3>
            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="df-label">Leave Type</label>
                <select className="df-input" {...register('leave_type')}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t} Leave</option>)}
                </select>
              </div>
              <div>
                <label className="df-label">Start Date</label>
                <input type="date" className="df-input" {...register('start_date')} />
                {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="df-label">End Date</label>
                <input type="date" className="df-input" {...register('end_date')} />
                {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
              </div>
            </div>

            {days > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">
                  {days} working day{days > 1 ? 's' : ''} requested
                </span>
              </div>
            )}

            <div>
              <label className="df-label">Reason / Remarks</label>
              <textarea rows={3} className="df-input resize-none" placeholder="Briefly describe the reason for your leave..." {...register('remarks')} />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary btn-sm">Cancel</button>
              <button type="submit" disabled={submitLeave.isPending} className="btn-primary btn-sm">
                {submitLeave.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave history */}
      <div className="df-card">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Leave History</h3>
          <span className="text-xs text-zinc-400">{leaves.length} requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>HR Comment</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-zinc-400">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-zinc-400 text-sm">No leave requests yet</td></tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id}>
                    <td><StatusBadge status={l.leave_type} /></td>
                    <td className="text-zinc-700 whitespace-nowrap">
                      {formatDate(l.start_date, 'MMM d')} – {formatDate(l.end_date, 'MMM d, yyyy')}
                    </td>
                    <td className="text-zinc-600">{calcLeaveDays(l.start_date, l.end_date)}d</td>
                    <td className="text-zinc-500 max-w-[180px] truncate" title={l.remarks}>{l.remarks || '—'}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="text-zinc-500 max-w-[160px] truncate" title={l.admin_comment}>{l.admin_comment || '—'}</td>
                    <td className="text-zinc-400 whitespace-nowrap">{formatDate(l.created_at, 'MMM d')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
