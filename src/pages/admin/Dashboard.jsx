import { useMemo } from 'react';
import { Users, UserCheck, CalendarDays, Wallet, TrendingUp, FolderOpen, CalendarClock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAllProfiles } from '@/hooks/useProfile';
import { useAllAttendance } from '@/hooks/useAttendance';
import { useAllLeaves } from '@/hooks/useLeave';
import { useAllPayroll } from '@/hooks/usePayroll';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { startOfMonth, subDays, format } from 'date-fns';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const { data: profiles = [] } = useAllProfiles();
  const today = format(new Date(), 'yyyy-MM-dd');
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  const { data: attendance = [] } = useAllAttendance();
  const { data: leaves = [] } = useAllLeaves('Pending');
  const { data: payroll = [] } = useAllPayroll(month, year);

  // Stats calculation
  const totalEmployees = profiles.length;
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;
  const onLeaveToday = todayAttendance.filter(a => a.status === 'Leave').length;
  const pendingLeavesCount = leaves.length;
  const totalPayroll = payroll.reduce((sum, p) => sum + p.net_salary, 0);

  // Charts Data Prep
  const deptData = useMemo(() => {
    const counts = {};
    profiles.forEach(p => { counts[p.department] = (counts[p.department] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [profiles]);

  const attTrendData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayAtt = attendance.filter(a => a.date === d);
      data.push({
        date: format(subDays(new Date(), i), 'MMM d'),
        Present: dayAtt.filter(a => a.status === 'Present').length,
        Absent: dayAtt.filter(a => a.status === 'Absent').length,
        Leave: dayAtt.filter(a => a.status === 'Leave').length,
      });
    }
    return data;
  }, [attendance]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Command Center" subtitle="Company overview and critical metrics" />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="df-card p-4 lg:col-span-2 hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total Employees</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900">{totalEmployees}</div>
          <div className="text-xs text-zinc-500 mt-1">Active workforce</div>
        </div>

        <div className="df-card p-4 hover:shadow-card-hover transition-all bg-emerald-50/50 border-emerald-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Present</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{presentToday}</div>
          <div className="text-[10px] text-emerald-600/80 mt-1 uppercase font-semibold">Today</div>
        </div>

        <div className="df-card p-4 hover:shadow-card-hover transition-all bg-red-50/50 border-red-100">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Absent</span>
            <UserCheck className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700">{absentToday}</div>
          <div className="text-[10px] text-red-600/80 mt-1 uppercase font-semibold">Today</div>
        </div>

        <div className="df-card p-4 hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Pending Leaves</span>
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900">{pendingLeavesCount}</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold">Requires Action</div>
        </div>

        <div className="df-card p-4 hover:shadow-card-hover transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Payroll Run</span>
            <Wallet className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-xl font-bold text-zinc-900 tracking-tight">{formatCurrency(totalPayroll)}</div>
          <div className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold">Current Month Net</div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/employees" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><Users className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">Directory</div><div className="text-xs text-zinc-500">Employee List</div></div>
        </Link>
        <Link to="/admin/attendance" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CalendarClock className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">Attendance Log</div><div className="text-xs text-zinc-500">Daily Records</div></div>
        </Link>
        <Link to="/admin/leaves" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><FolderOpen className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">Leave Approvals</div><div className="text-xs text-zinc-500">Manage Requests</div></div>
        </Link>
        <Link to="/admin/payroll" className="df-card p-4 hover:border-indigo-300 hover:shadow-card-hover transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700"><CreditCard className="w-5 h-5" /></div>
          <div><div className="text-sm font-semibold text-zinc-900">Payroll</div><div className="text-xs text-zinc-500">Run & Edit</div></div>
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Attendance Trend */}
        <div className="lg:col-span-2 df-card p-5">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-900">Attendance Trend (7 Days)</h3>
            <p className="text-xs text-zinc-500">Daily workforce presence</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="Present" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="df-card p-5">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-zinc-900">Departments</h3>
            <p className="text-xs text-zinc-500">Employee distribution</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {deptData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-zinc-600 truncate" title={d.name}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Pending Leaves List */}
      <div className="df-card">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Action Required: Pending Leaves</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-zinc-400 text-sm">No pending requests</td></tr>
              ) : (
                leaves.slice(0, 5).map(l => (
                  <tr key={l.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600">
                          {l.profiles?.full_name?.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 leading-none">{l.profiles?.full_name}</p>
                          <p className="text-[10px] text-zinc-500 mt-1">{l.profiles?.department}</p>
                        </div>
                      </div>
                    </td>
                    <td><StatusBadge status={l.leave_type} /></td>
                    <td className="text-sm text-zinc-600">{formatDate(l.start_date)} – {formatDate(l.end_date)}</td>
                    <td className="text-sm text-zinc-500">{formatDate(l.created_at)}</td>
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
