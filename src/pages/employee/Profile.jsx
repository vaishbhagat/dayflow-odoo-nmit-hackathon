import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3, Save, X, User, Briefcase, Wallet, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useMyPayroll } from '@/hooks/usePayroll';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const editSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  profile_picture_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'job',      label: 'Job Info', icon: Briefcase },
  { id: 'salary',   label: 'Salary',   icon: Wallet },
  { id: 'docs',     label: 'Documents', icon: FileText },
];

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-zinc-900">{value || '—'}</dd>
    </div>
  );
}

export default function EmployeeProfile() {
  const { profile, refreshProfile } = useAuth();
  const [tab, setTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const update = useUpdateProfile();
  const now = new Date();
  const { data: payroll } = useMyPayroll(now.getMonth() + 1, now.getFullYear());

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { phone: profile?.phone || '', address: profile?.address || '', profile_picture_url: profile?.profile_picture_url || '' },
  });

  const onSubmit = async (values) => {
    try {
      await update.mutateAsync({ id: profile.id, updates: values });
      await refreshProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Profile" subtitle="View and edit your personal information" />

      {/* Profile card header */}
      <div className="df-card p-6">
        <div className="flex items-start gap-5">
          <EmployeeAvatar name={profile.full_name} imageUrl={profile.profile_picture_url} size="xl" />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-zinc-900">{profile.full_name}</h2>
            <p className="text-sm text-zinc-500">{profile.designation}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={profile.employment_status} />
              <StatusBadge status={profile.role} />
              <span className="text-xs text-zinc-400">{profile.department}</span>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">{profile.employee_id}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="df-card overflow-hidden">
        <div className="flex border-b border-zinc-100 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setEditing(false); }}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 flex-shrink-0 ${
                tab === id
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* PERSONAL TAB */}
          {tab === 'personal' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-zinc-900">Personal Information</h3>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary btn-sm gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); reset(); }} className="btn-ghost btn-sm">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button form="profile-form" type="submit" className="btn-primary btn-sm">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full Name" value={profile.full_name} />
                  <Field label="Email" value={profile.email} />
                  <Field label="Phone" value={profile.phone} />
                  <Field label="Address" value={profile.address} />
                  <Field label="Employee ID" value={profile.employee_id} />
                  <Field label="Joined" value={formatDate(profile.joining_date)} />
                </dl>
              ) : (
                <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                  <div>
                    <label className="df-label">Profile Picture URL</label>
                    <input type="url" className="df-input" placeholder="https://example.com/photo.jpg" {...register('profile_picture_url')} />
                    {errors.profile_picture_url && <p className="text-xs text-red-500 mt-1">{errors.profile_picture_url.message}</p>}
                  </div>
                  <div>
                    <label className="df-label">Phone</label>
                    <input className="df-input" placeholder="+91 98765 43210" {...register('phone')} />
                  </div>
                  <div>
                    <label className="df-label">Address</label>
                    <textarea rows={3} className="df-input resize-none" placeholder="Your full address..." {...register('address')} />
                  </div>
                  <p className="text-xs text-zinc-400">Only phone, address, and profile picture can be edited. Contact HR for other changes.</p>
                </form>
              )}
            </div>
          )}

          {/* JOB TAB */}
          {tab === 'job' && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Department" value={profile.department} />
              <Field label="Designation" value={profile.designation} />
              <Field label="Role" value={profile.role} />
              <Field label="Joining Date" value={formatDate(profile.joining_date)} />
              <Field label="Employment Status" value={profile.employment_status} />
              <Field label="Employee ID" value={profile.employee_id} />
            </dl>
          )}

          {/* SALARY TAB */}
          {tab === 'salary' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 mb-4">Salary information is read-only. Contact HR for adjustments.</p>
              {payroll ? (
                <div className="max-w-sm space-y-3">
                  {[
                    { label: 'Basic Salary', value: payroll.basic_salary },
                    { label: 'HRA',          value: payroll.hra },
                    { label: 'Allowances',   value: payroll.allowances },
                    { label: 'Deductions',   value: -payroll.deductions },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-zinc-100">
                      <span className="text-sm text-zinc-600">{label}</span>
                      <span className={`text-sm font-medium ${value < 0 ? 'text-red-600' : 'text-zinc-900'}`}>
                        {value < 0 ? `- ${formatCurrency(-value)}` : formatCurrency(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-semibold text-zinc-900">Net Salary</span>
                    <span className="text-base font-bold text-indigo-600">{formatCurrency(payroll.net_salary)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No payroll data available for current month.</p>
              )}
            </div>
          )}

          {/* DOCS TAB */}
          {tab === 'docs' && (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-zinc-500">No documents uploaded</h3>
              <p className="text-xs text-zinc-400 mt-1">Contact your HR officer to upload documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
