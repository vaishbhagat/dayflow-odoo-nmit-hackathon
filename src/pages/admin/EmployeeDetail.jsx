import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Save, User, Wallet, Calendar, FileText } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useEmployeePayroll, useUpsertPayroll } from '@/hooks/usePayroll';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DEPARTMENTS, DESIGNATIONS, EMPLOYMENT_STATUSES, ROLES, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profile_picture_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  department: z.string(),
  designation: z.string(),
  role: z.string(),
  employment_status: z.string(),
});

const payrollSchema = z.object({
  basic_salary: z.coerce.number().min(0),
  hra: z.coerce.number().min(0),
  allowances: z.coerce.number().min(0),
  deductions: z.coerce.number().min(0),
});

import { supabase } from '@/lib/supabase';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data: profile, isLoading } = useProfile(id);
  const { data: payroll } = useEmployeePayroll(id, currentMonth, currentYear);
  const updateProfile = useUpdateProfile();
  const upsertPayroll = useUpsertPayroll();

  const { register: regProfile, handleSubmit: submitProfile, reset: resetProfile, formState: { isDirty: isProfileDirty } } = useForm({
    resolver: zodResolver(profileSchema)
  });

  const { register: regPayroll, handleSubmit: submitPayroll, reset: resetPayroll, watch: watchPayroll, formState: { isDirty: isPayrollDirty } } = useForm({
    resolver: zodResolver(payrollSchema)
  });

  useEffect(() => {
    if (profile) resetProfile(profile);
  }, [profile, resetProfile]);

  useEffect(() => {
    if (payroll) resetPayroll(payroll);
    else resetPayroll({ basic_salary: 0, hra: 0, allowances: 0, deductions: 0 });
  }, [payroll, resetPayroll]);

  const onProfileSave = async (values) => {
    try {
      await updateProfile.mutateAsync({ id, updates: values });
      toast.success('Profile updated successfully');
    } catch (e) {
      toast.error(e.message || 'Update failed');
    }
  };

  const onPayrollSave = async (values) => {
    try {
      await upsertPayroll.mutateAsync({ employee_id: id, month: currentMonth, year: currentYear, ...values });
      
      // Notification Alert
      await supabase.from('notifications').insert({
        recipient_id: id,
        title: 'Payroll Updated',
        message: `Your salary structure for ${now.toLocaleString('default', { month: 'long' })} ${currentYear} has been updated by HR.`,
        type: 'info'
      });

      toast.success('Payroll structure saved');
    } catch (e) {
      toast.error(e.message || 'Save failed');
    }
  };

  // Live net salary calculation
  const wBasic = parseFloat(watchPayroll('basic_salary') || 0);
  const wHra = parseFloat(watchPayroll('hra') || 0);
  const wAll = parseFloat(watchPayroll('allowances') || 0);
  const wDed = parseFloat(watchPayroll('deductions') || 0);
  const liveNet = wBasic + wHra + wAll - wDed;

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-red-500">Employee not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/employees')} className="btn-ghost p-2 -ml-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <PageHeader title={profile.full_name} subtitle={profile.employee_id} className="mb-0" />
      </div>

      <div className="df-card p-6 flex items-start gap-5">
        <EmployeeAvatar name={profile.full_name} imageUrl={profile.profile_picture_url} size="xl" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-zinc-900">{profile.full_name}</h2>
          <p className="text-sm text-zinc-500">{profile.designation} • {profile.department}</p>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={profile.employment_status} />
            <StatusBadge status={profile.role} />
          </div>
        </div>
      </div>

      <div className="df-card overflow-hidden">
        <div className="flex border-b border-zinc-100">
          {[
            { id: 'profile', label: 'Profile Settings', icon: User },
            { id: 'payroll', label: 'Payroll Configuration', icon: Wallet },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'profile' && (
            <form onSubmit={submitProfile(onProfileSave)} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="df-label">Full Name</label>
                  <input className="df-input" {...regProfile('full_name')} />
                </div>
                <div>
                  <label className="df-label">Email</label>
                  <input type="email" className="df-input" {...regProfile('email')} />
                </div>
                <div>
                  <label className="df-label">Phone</label>
                  <input className="df-input" {...regProfile('phone')} />
                </div>
                <div>
                  <label className="df-label">Profile Picture URL</label>
                  <input type="url" className="df-input" placeholder="https://..." {...regProfile('profile_picture_url')} />
                </div>
                <div className="col-span-2">
                  <label className="df-label">Address</label>
                  <input className="df-input" {...regProfile('address')} />
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="df-label">Department</label>
                  <select className="df-input" {...regProfile('department')}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="df-label">Designation</label>
                  <select className="df-input" {...regProfile('designation')}>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="df-label">Role</label>
                  <select className="df-input" {...regProfile('role')}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="df-label">Status</label>
                  <select className="df-input" {...regProfile('employment_status')}>
                    {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={!isProfileDirty || updateProfile.isPending} className="btn-primary">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          )}

          {tab === 'payroll' && (
            <div className="max-w-2xl">
              <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900">Current Month Configuration</h3>
                  <p className="text-xs text-indigo-700 mt-0.5">Editing values for {now.toLocaleString('default', { month: 'long' })} {currentYear}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-indigo-700 font-medium uppercase tracking-wide">Live Net Salary</div>
                  <div className="text-2xl font-bold text-indigo-600">{formatCurrency(liveNet)}</div>
                </div>
              </div>

              <form onSubmit={submitPayroll(onPayrollSave)} className="space-y-6">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide border-b border-zinc-100 pb-2">Earnings</h4>
                    <div>
                      <label className="df-label">Basic Salary (₹)</label>
                      <input type="number" className="df-input font-mono" {...regPayroll('basic_salary')} />
                    </div>
                    <div>
                      <label className="df-label">HRA (₹)</label>
                      <input type="number" className="df-input font-mono" {...regPayroll('hra')} />
                    </div>
                    <div>
                      <label className="df-label">Other Allowances (₹)</label>
                      <input type="number" className="df-input font-mono" {...regPayroll('allowances')} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide border-b border-zinc-100 pb-2">Deductions</h4>
                    <div>
                      <label className="df-label">Total Deductions (₹)</label>
                      <input type="number" className="df-input font-mono text-red-600" {...regPayroll('deductions')} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-100">
                  <button type="submit" disabled={!isPayrollDirty || upsertPayroll.isPending} className="btn-primary">
                    <Save className="w-4 h-4" /> Save Payroll Configuration
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
