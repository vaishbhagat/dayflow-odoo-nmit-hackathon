import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, FileEdit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllPayroll } from '@/hooks/usePayroll';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { formatCurrency, getMonthName } from '@/lib/utils';

export default function PayrollControls() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');

  const { data: payroll = [], isLoading } = useAllPayroll(month, year);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const filtered = useMemo(() => {
    return payroll.filter(p => (p.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()));
  }, [payroll, search]);

  const totalRun = filtered.reduce((sum, p) => sum + (p.net_salary || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Payroll Controls" subtitle="Manage and review monthly salary disbursements" />

      {/* Header Controls */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="df-card p-2 flex items-center justify-between sm:col-span-1">
          <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-900">{getMonthName(month)} {year}</div>
          </div>
          <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="df-card p-2 px-4 flex items-center gap-3 sm:col-span-2">
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search employee by name..."
            className="flex-1 bg-transparent border-none text-sm focus:outline-none text-zinc-900 placeholder-zinc-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Stat */}
      <div className="df-card bg-indigo-50/50 border-indigo-100 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-indigo-900">Total Payroll Run</h3>
          <p className="text-xs text-indigo-700 mt-0.5">For {getMonthName(month)} {year} ({filtered.length} employees)</p>
        </div>
        <div className="text-3xl font-bold text-indigo-600 tracking-tight">
          {formatCurrency(totalRun)}
        </div>
      </div>

      {/* Payroll Table */}
      <div className="df-card">
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="text-right">Basic</th>
                <th className="text-right">Allowances</th>
                <th className="text-right">Deductions</th>
                <th className="text-right font-bold">Net Salary</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-zinc-400">Loading payroll data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">No payroll records configured for this month.</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar name={p.profiles?.full_name} size="sm" />
                        <div>
                          <div className="font-medium text-zinc-900 leading-tight">{p.profiles?.full_name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{p.profiles?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-sm text-zinc-600">{formatCurrency(p.basic_salary)}</td>
                    <td className="text-right text-sm text-emerald-600">+{formatCurrency(p.hra + p.allowances)}</td>
                    <td className="text-right text-sm text-red-600">-{formatCurrency(p.deductions)}</td>
                    <td className="text-right text-sm font-bold text-indigo-600 bg-indigo-50/30">{formatCurrency(p.net_salary)}</td>
                    <td className="text-right">
                      <Link to={`/admin/employees/${p.employee_id}`} className="btn-ghost btn-sm inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700">
                        <FileEdit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </td>
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
