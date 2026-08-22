import { useState } from 'react';
import { Clock, TrendingUp, Calendar, CheckCircle2, AlertCircle, Coffee, User, CalendarDays, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTodayAttendance, useCheckIn, useCheckOut, useMyAttendance } from '@/hooks/useAttendance';
import { useMyLeaves } from '@/hooks/useLeave';
import { useNotifications } from '@/hooks/useNotifications';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { SkeletonCard } from '@/components/shared/Skeletons';
import { formatTime, formatDate, getGreeting } from '@/lib/utils';
import toast from 'react-hot-toast';

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="stat-card hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function EmployeeDashboard() {
  const { profile, signOut } = useAuth();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: todayAtt, isLoading: attLoading } = useTodayAttendance();
  const { data: monthAtt = [] } = useMyAttendance(month, year);
  const { data: leaves = [] } = useMyLeaves();
  const { data: notifications = [] } = useNotifications();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const presentDays = monthAtt.filter((a) => a.status === 'Present').length;
  const absentDays  = monthAtt.filter((a) => a.status === 'Absent').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;

  const handleCheckIn = async () => {
    try {
      await checkIn.mutateAsync();
      toast.success('Checked in successfully!');
    } catch (e) {
      toast.error(e.message || 'Check-in failed');
    }
  };
  const handleCheckOut = async () => {
    if (!todayAtt?.id) return;
    try {
      await checkOut.mutateAsync(todayAtt.id);
      toast.success('Checked out successfully!');
    } catch (e) {
      toast.error(e.message || 'Check-out failed');
    }
  };

  const isCheckedIn  = !!todayAtt?.check_in;
  const isCheckedOut = !!todayAtt?.check_out;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`${getGreeting()}, ${profile?.full_name?.split(' ')[0]} 👋`}
        subtitle={formatDate(new Date(), "EEEE, MMMM d, yyyy")}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present Days" value={presentDays} sub={`out of ${monthAtt.length} tracked`} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Absent Days" value={absentDays} sub="this month" icon={AlertCircle} color="bg-red-50 text-red-500" />
        <StatCard label="Pending Leaves" value={pendingLeaves} sub="awaiting HR approval" icon={Calendar} color="bg-amber-50 text-amber-600" />
        <StatCard label="Leaves Approved" value={approvedLeaves} sub="this year" icon={TrendingUp} color="bg-indigo-50 text-indigo-600" />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/employee/profile" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><User className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">My Profile</div><div className="text-xs text-zinc-500">View & Edit</div></div>
        </Link>
        <Link to="/employee/attendance" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><Calendar className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">Attendance</div><div className="text-xs text-zinc-500">History & Log</div></div>
        </Link>
        <Link to="/employee/leaves" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><CalendarDays className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">Leave Requests</div><div className="text-xs text-zinc-500">Apply Time-off</div></div>
        </Link>
        <button onClick={signOut} className="df-card p-4 hover:border-red-300 hover:shadow-card-hover transition-all flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><LogOut className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-red-600">Logout</div><div className="text-xs text-red-400">Sign out securely</div></div>
        </button>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Check-in console */}
        <div className="lg:col-span-2 df-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Today&apos;s Attendance</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{formatDate(new Date(), 'EEEE, MMM d')}</p>
            </div>
            {todayAtt && <StatusBadge status={todayAtt.status} />}
          </div>

          {/* Time display */}
          <div className="bg-zinc-950 rounded-xl p-6 text-center mb-5">
            <div className="text-3xl font-bold text-white font-mono tracking-tight">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <p className="text-zinc-500 text-xs mt-1">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
          </div>

          {/* Check-in/out times */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-zinc-50 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">Check-in</div>
              <div className="text-sm font-semibold text-zinc-900">
                {todayAtt?.check_in ? formatTime(todayAtt.check_in) : '—'}
              </div>
            </div>
            <div className="bg-zinc-50 rounded-lg p-3">
              <div className="text-xs text-zinc-500 mb-1">Check-out</div>
              <div className="text-sm font-semibold text-zinc-900">
                {todayAtt?.check_out ? formatTime(todayAtt.check_out) : '—'}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex gap-3">
            {!isCheckedIn ? (
              <button
                id="checkin-btn"
                onClick={handleCheckIn}
                disabled={checkIn.isPending || attLoading}
                className="btn-primary flex-1 justify-center py-2.5"
              >
                {checkIn.isPending ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking in...</>
                ) : (
                  <><Clock className="w-4 h-4" /> Check In</>
                )}
              </button>
            ) : !isCheckedOut ? (
              <button
                id="checkout-btn"
                onClick={handleCheckOut}
                disabled={checkOut.isPending}
                className="btn-secondary flex-1 justify-center py-2.5"
              >
                {checkOut.isPending ? (
                  <><div className="w-3.5 h-3.5 border-2 border-zinc-400/30 border-t-zinc-600 rounded-full animate-spin" /> Checking out...</>
                ) : (
                  <><Coffee className="w-4 h-4" /> Check Out</>
                )}
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Day complete! Great work.
              </div>
            )}
          </div>
        </div>

        {/* Notifications feed */}
        <div className="df-card p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">Recent Activity</h3>
          <div className="flex-1 space-y-2 overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No recent activity</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg text-xs space-y-0.5 border transition-colors ${n.is_read ? 'bg-zinc-50 border-zinc-100' : 'bg-indigo-50/50 border-indigo-100'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-900 leading-snug">{n.title}</span>
                    {!n.is_read && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-zinc-500 leading-relaxed">{n.message}</p>
                  <p className="text-zinc-400">{formatDate(n.created_at, 'MMM d')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="df-card">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">This Month&apos;s Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthAtt.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-zinc-400 text-sm">No attendance records this month</td></tr>
              ) : (
                monthAtt.slice(0, 10).map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-zinc-800">{formatDate(a.date, 'EEE, MMM d')}</td>
                    <td className="text-zinc-600">{formatTime(a.check_in)}</td>
                    <td className="text-zinc-600">{formatTime(a.check_out)}</td>
                    <td><StatusBadge status={a.status} /></td>
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
