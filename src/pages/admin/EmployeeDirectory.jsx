import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, FileEdit } from 'lucide-react';
import { useAllProfiles } from '@/hooks/useProfile';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DEPARTMENTS, EMPLOYMENT_STATUSES } from '@/lib/utils';

export default function EmployeeDirectory() {
  const { data: profiles = [], isLoading } = useAllProfiles();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      const matchSearch = p.full_name.toLowerCase().includes(search.toLowerCase()) || p.employee_id.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'All' || p.department === deptFilter;
      const matchStatus = statusFilter === 'All' || p.employment_status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [profiles, search, deptFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Employee Directory" subtitle="Manage your organization's workforce" />

      {/* Filters */}
      <div className="df-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="df-input pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select className="df-input py-1.5 h-[38px] text-sm" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <select className="df-input py-1.5 h-[38px] text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="df-card">
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Role & Dept</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Loading directory...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">No employees found matching criteria.</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar name={p.full_name} imageUrl={p.profile_picture_url} size="md" />
                        <div>
                          <div className="font-semibold text-zinc-900 leading-tight">{p.full_name}</div>
                          <div className="text-xs text-zinc-500">{p.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-zinc-500">{p.employee_id}</td>
                    <td>
                      <div className="text-sm font-medium text-zinc-700">{p.department}</div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5">{p.role}</div>
                    </td>
                    <td>
                      <div className="text-sm text-zinc-600">{p.email}</div>
                      <div className="text-xs text-zinc-400">{p.phone || '—'}</div>
                    </td>
                    <td><StatusBadge status={p.employment_status} /></td>
                    <td className="text-right">
                      <Link to={`/admin/employees/${p.id}`} className="btn-ghost btn-sm inline-flex">
                        <FileEdit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-zinc-100 text-xs text-zinc-500 text-right">
          Showing {filtered.length} of {profiles.length} employees
        </div>
      </div>
    </div>
  );
}
