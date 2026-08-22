import { useMemo } from 'react';
import { Download, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useAllProfiles } from '@/hooks/useProfile';
import { useAllPayroll } from '@/hooks/usePayroll';
import { PageHeader } from '@/components/shared/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, DEPARTMENTS } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const { data: profiles = [] } = useAllProfiles();
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const { data: payroll = [] } = useAllPayroll(month, year);

  // Department distribution
  const deptData = useMemo(() => {
    const counts = {};
    profiles.forEach(p => { counts[p.department] = (counts[p.department] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [profiles]);

  // Payroll by department
  const payrollByDept = useMemo(() => {
    const costs = {};
    payroll.forEach(p => {
      const dept = p.profiles?.department || 'Unknown';
      costs[dept] = (costs[dept] || 0) + p.net_salary;
    });
    return Object.entries(costs).map(([name, cost]) => ({ name, cost })).sort((a, b) => b.cost - a.cost);
  }, [payroll]);

  const handleExport = async () => {
    const reportElement = document.getElementById('report-container');
    if (!reportElement) return;
    
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dayflow_Report_${year}_${month}.pdf`);
      toast.success('Report downloaded', { id: toastId });
    } catch (e) {
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Exportable organization metrics"
        action={
          <button onClick={handleExport} className="btn-primary btn-sm">
            <Download className="w-4 h-4" /> Export to PDF
          </button>
        }
      />

      <div id="report-container" className="space-y-6 bg-zinc-50 pb-4">
        {/* Header for PDF only visible slightly */}
        <div className="hidden pdf-only:block p-6 bg-white border-b border-zinc-200">
          <h1 className="text-2xl font-bold text-zinc-900">Dayflow HRMS — Organization Report</h1>
          <p className="text-sm text-zinc-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Dept Pie */}
          <div className="df-card p-6 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg"><PieChartIcon className="w-5 h-5 text-indigo-600" /></div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Headcount by Department</h3>
                <p className="text-xs text-zinc-500">Distribution of active employees</p>
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {deptData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-3xl font-bold text-zinc-900">{profiles.length}</div>
                  <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Bar */}
          <div className="df-card p-6 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Payroll by Department</h3>
                <p className="text-xs text-zinc-500">Net salary costs for current month</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollByDept} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e4e7" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#52525b' }} width={90} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="cost" fill="#10b981" radius={[0, 4, 4, 0]}>
                    {payrollByDept.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="df-card bg-white">
          <div className="px-6 py-5 border-b border-zinc-100">
            <h3 className="text-base font-semibold text-zinc-900">Department Summary</h3>
          </div>
          <div className="overflow-x-auto p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-500">Department</th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-500">Headcount</th>
                  <th className="px-4 py-3 text-right font-semibold text-zinc-500">Payroll Cost</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENTS.map(d => {
                  const hc = profiles.filter(p => p.department === d).length;
                  const pr = payroll.filter(p => p.profiles?.department === d).reduce((s, p) => s + p.net_salary, 0);
                  if (hc === 0) return null;
                  return (
                    <tr key={d} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-zinc-900">{d}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{hc}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatCurrency(pr)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                <tr>
                  <td className="px-4 py-3 text-zinc-900">Organization Total</td>
                  <td className="px-4 py-3 text-right text-zinc-900">{profiles.length}</td>
                  <td className="px-4 py-3 text-right text-indigo-600">{formatCurrency(payroll.reduce((s, p) => s + p.net_salary, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
