import { useState, useMemo } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import { useAllAttendance } from '@/hooks/useAttendance';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatTime, DEPARTMENTS } from '@/lib/utils';
import { format } from 'date-fns';

export default function AttendanceLogs() {
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deptFilter, setDeptFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: attendance = [], isLoading } = useAllAttendance({ date: dateFilter });

  const filtered = useMemo(() => {
    return attendance.filter(a => {
      const matchDept = deptFilter === 'All' || a.profiles?.department === deptFilter;
      const matchSearch = (a.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [attendance, deptFilter, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Attendance Logs" subtitle="Master supervisor grid for daily check-ins" />

      <div className="df-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <input 
              type="date" 
              className="df-input py-1.5 h-[38px] text-sm font-medium w-40" 
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
          <div className="h-9 w-px bg-zinc-200 hidden sm:block" />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search employee..."
              className="df-input pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select className="df-input py-1.5 h-[38px] text-sm w-44" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="df-card">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Records for {formatDate(dateFilter)}</h3>
          <span className="text-xs text-zinc-500 font-medium">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-400">Loading records...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No attendance records found for this date.</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar name={a.profiles?.full_name} size="sm" />
                        <div>
                          <div className="font-medium text-zinc-900 leading-tight">{a.profiles?.full_name}</div>
                          <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{a.profiles?.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-zinc-600">{a.profiles?.department}</td>
                    <td className="text-sm font-medium text-zinc-700">{a.check_in ? formatTime(a.check_in) : '—'}</td>
                    <td className="text-sm font-medium text-zinc-700">{a.check_out ? formatTime(a.check_out) : '—'}</td>
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
