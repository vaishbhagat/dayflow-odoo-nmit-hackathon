import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useMyPayroll } from '@/hooks/usePayroll';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PayslipDocument } from '@/components/pdf/PayslipDocument';
import { formatCurrency, getMonthName, MONTHS } from '@/lib/utils';

function SalaryRow({ label, value, isBold, isDeduction, isTotal }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${isTotal ? 'border-t-2 border-zinc-200 pt-4 mt-1' : 'border-b border-zinc-100'}`}>
      <span className={`text-sm ${isBold || isTotal ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}>{label}</span>
      <span className={`text-sm font-medium ${isTotal ? 'text-lg font-bold text-indigo-600' : isDeduction ? 'text-red-600' : 'text-zinc-900'}`}>
        {isDeduction ? `- ${formatCurrency(value)}` : formatCurrency(value)}
      </span>
    </div>
  );
}

export default function EmployeePayroll() {
  const { profile } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());

  const { data: payroll, isLoading } = useMyPayroll(month, year);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payroll"
        subtitle="View your monthly salary breakdown and download payslips"
      />

      {/* Month navigator */}
      <div className="df-card p-4">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center">
            <div className="text-base font-semibold text-zinc-900">{getMonthName(month)} {year}</div>
            {isCurrentMonth && <div className="text-xs text-indigo-600 font-medium">Current Month</div>}
          </div>
          <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="df-card p-8 text-center text-zinc-400 text-sm">Loading payroll data...</div>
      ) : !payroll ? (
        <div className="df-card p-10 text-center">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-zinc-500">No payroll data</h3>
          <p className="text-xs text-zinc-400 mt-1">No salary record found for {getMonthName(month)} {year}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Salary breakdown */}
          <div className="lg:col-span-2 df-card p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Salary Breakdown</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{getMonthName(month)} {year}</p>
              </div>
              {payroll && (
                <PDFDownloadLink
                  document={<PayslipDocument payroll={payroll} profile={profile} month={month} year={year} />}
                  fileName={`payslip_${profile?.employee_id}_${getMonthName(month)}_${year}.pdf`}
                >
                  {({ loading }) => (
                    <button id="download-payslip-btn" className="btn-secondary btn-sm">
                      <Download className="w-3.5 h-3.5" />
                      {loading ? 'Preparing...' : 'Download Payslip'}
                    </button>
                  )}
                </PDFDownloadLink>
              )}
            </div>

            <div className="space-y-0">
              <div className="bg-zinc-50 rounded-lg px-4 py-2 mb-3">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Earnings</span>
              </div>
              <SalaryRow label="Basic Salary"  value={payroll.basic_salary} />
              <SalaryRow label="House Rent Allowance (HRA)" value={payroll.hra} />
              <SalaryRow label="Other Allowances" value={payroll.allowances} />

              <div className="bg-zinc-50 rounded-lg px-4 py-2 mt-4 mb-3">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Deductions</span>
              </div>
              <SalaryRow label="Total Deductions" value={payroll.deductions} isDeduction />

              <SalaryRow label="Net Salary (Take-home)" value={payroll.net_salary} isTotal isBold />
            </div>
          </div>

          {/* Summary card */}
          <div className="space-y-4">
            <div className="df-card p-5 text-center">
              <p className="text-xs text-zinc-500 mb-1">Net Take-home</p>
              <p className="text-3xl font-bold text-zinc-900 tracking-tight">{formatCurrency(payroll.net_salary)}</p>
              <p className="text-xs text-zinc-400 mt-1">{getMonthName(month)} {year}</p>
            </div>

            <div className="df-card p-5 space-y-3">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Summary</h4>
              <div className="space-y-2">
                {[
                  { label: 'Gross Earnings', value: payroll.basic_salary + payroll.hra + payroll.allowances, cls: 'text-emerald-600' },
                  { label: 'Total Deductions', value: payroll.deductions, cls: 'text-red-600' },
                  { label: 'Net Salary', value: payroll.net_salary, cls: 'text-indigo-600 font-bold' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-zinc-600">{label}</span>
                    <span className={cls}>{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="df-card p-5 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Employee Details</h4>
              <div className="space-y-1 text-sm">
                <div className="text-zinc-600">ID: <span className="text-zinc-900 font-mono">{profile?.employee_id}</span></div>
                <div className="text-zinc-600">Dept: <span className="text-zinc-900">{profile?.department}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
