import { useState } from 'react';
import { Check, X, MessageSquare } from 'lucide-react';
import { useAllLeaves, useUpdateLeave } from '@/hooks/useLeave';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, calcLeaveDays } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function LeaveApprovals() {
  const [filter, setFilter] = useState('Pending');
  const { data: leaves = [], isLoading } = useAllLeaves(filter);
  const updateLeave = useUpdateLeave();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction] = useState(null); // 'Approved' | 'Rejected'
  const [comment, setComment] = useState('');

  const handleActionClick = (leave, type) => {
    setSelectedLeave(leave);
    setAction(type);
    setComment('');
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedLeave) return;
    try {
      await updateLeave.mutateAsync({
        id: selectedLeave.id,
        status: action,
        admin_comment: comment
      });

      // Send notification to employee
      await supabase.from('notifications').insert({
        recipient_id: selectedLeave.employee_id,
        title: `Leave ${action}`,
        message: `Your ${selectedLeave.leave_type} leave from ${formatDate(selectedLeave.start_date)} to ${formatDate(selectedLeave.end_date)} was ${action.toLowerCase()}. ${comment ? `Note: ${comment}` : ''}`,
        type: action === 'Approved' ? 'success' : 'error'
      });

      toast.success(`Leave ${action.toLowerCase()} successfully`);
      setModalOpen(false);
    } catch (e) {
      toast.error(e.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <PageHeader title="Leave Approvals" subtitle="Review and manage employee leave requests" />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${filter === f ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          >
            {f} Requests
          </button>
        ))}
      </div>

      <div className="df-card">
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Duration & Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Loading...</td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">No {filter.toLowerCase()} requests found.</td></tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar name={l.profiles?.full_name} imageUrl={l.profiles?.profile_picture_url} size="sm" />
                        <div>
                          <div className="font-semibold text-zinc-900 leading-tight">{l.profiles?.full_name}</div>
                          <div className="text-xs text-zinc-500">{l.profiles?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={l.leave_type} /></td>
                    <td>
                      <div className="text-sm text-zinc-700">{formatDate(l.start_date, 'MMM d')} – {formatDate(l.end_date, 'MMM d, yy')}</div>
                      <div className="text-xs text-zinc-400">{calcLeaveDays(l.start_date, l.end_date)} day(s)</div>
                    </td>
                    <td className="max-w-[200px]">
                      <div className="text-sm text-zinc-700 truncate" title={l.remarks}>{l.remarks || '—'}</div>
                      {l.admin_comment && <div className="text-[10px] text-zinc-400 truncate mt-0.5" title={`HR Note: ${l.admin_comment}`}>HR: {l.admin_comment}</div>}
                    </td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="text-right">
                      {l.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleActionClick(l, 'Approved')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleActionClick(l, 'Rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal (Simplified Custom Implementation) */}
      {modalOpen && selectedLeave && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${action === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {action === 'Approved' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Confirm {action}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  You are about to <strong className={action === 'Approved' ? 'text-emerald-600' : 'text-red-600'}>{action.toLowerCase()}</strong> the leave request for {selectedLeave.profiles?.full_name}.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-zinc-50 rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-1"><span className="text-zinc-500">Dates</span><span className="font-medium text-zinc-900">{formatDate(selectedLeave.start_date)} - {formatDate(selectedLeave.end_date)}</span></div>
                <div className="flex justify-between mb-1"><span className="text-zinc-500">Type</span><span className="font-medium text-zinc-900">{selectedLeave.leave_type}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Reason</span><span className="font-medium text-zinc-900 text-right max-w-[60%] truncate">{selectedLeave.remarks || '—'}</span></div>
              </div>
              
              <div>
                <label className="df-label flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Optional Note</label>
                <textarea 
                  className="df-input resize-none" 
                  rows={2} 
                  placeholder="Add a comment for the employee..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={confirmAction} disabled={updateLeave.isPending} className={action === 'Approved' ? 'btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-[0_1px_2px_rgba(5,150,105,0.3)]' : 'btn-danger'}>
                {updateLeave.isPending ? 'Processing...' : `Confirm ${action}`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
