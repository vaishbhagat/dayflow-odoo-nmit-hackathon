import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyAttendance, useTodayAttendance, useCheckIn, useCheckOut } from '@/hooks/useAttendance';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate, formatTime } from '@/lib/utils';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  Present:  'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  Absent:   'bg-red-100 text-red-600 hover:bg-red-200',
  'Half-day': 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  Leave:    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
};

export default function EmployeeAttendance() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year  = currentDate.getFullYear();

  const { data: records = [], isLoading } = useMyAttendance(month, year);
  const { data: todayAtt } = useTodayAttendance();
  const checkIn  = useCheckIn();
  const checkOut = useCheckOut();

  // Build a map keyed by date string
  const recordMap = records.reduce((acc, r) => { acc[r.date] = r; return acc; }, {});

  // Calendar days
  const firstDay = startOfMonth(currentDate);
  const lastDay  = endOfMonth(currentDate);
  const days     = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startPad = getDay(firstDay); // 0=Sun

  // Current week calculation
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleCheckIn = async () => {
    try { await checkIn.mutateAsync(); toast.success('Checked in!'); }
    catch (e) { toast.error(e.message); }
  };
  const handleCheckOut = async () => {
    if (!todayAtt?.id) return;
    try { await checkOut.mutateAsync(todayAtt.id); toast.success('Checked out!'); }
    catch (e) { toast.error(e.message); }
  };

  const presentDays = records.filter(r => r.status === 'Present').length;
  const absentDays  = records.filter(r => r.status === 'Absent').length;
  const halfDays    = records.filter(r => r.status === 'Half-day').length;
  const leaveDays   = records.filter(r => r.status === 'Leave').length;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Attendance" subtitle="Track your daily check-ins and monthly overview" />

      {/* Quick check-in panel */}
      <div className="df-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Today — {formatDate(new Date(), 'EEEE, MMM d')}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-zinc-500">In: <span className="text-zinc-900 font-medium">{todayAtt?.check_in ? formatTime(todayAtt.check_in) : '—'}</span></span>
              <span className="text-zinc-300">|</span>
              <span className="text-zinc-500">Out: <span className="text-zinc-900 font-medium">{todayAtt?.check_out ? formatTime(todayAtt.check_out) : '—'}</span></span>
              {todayAtt && <StatusBadge status={todayAtt.status} />}
            </div>
          </div>
          <div className="flex gap-2">
            {!todayAtt?.check_in ? (
              <button onClick={handleCheckIn} disabled={checkIn.isPending} className="btn-primary btn-sm">
                <Clock className="w-3.5 h-3.5" /> Check In
              </button>
            ) : !todayAtt?.check_out ? (
              <button onClick={handleCheckOut} disabled={checkOut.isPending} className="btn-secondary btn-sm">
                Check Out
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Complete
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Present', count: presentDays, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Absent',  count: absentDays,  cls: 'bg-red-50 border-red-200 text-red-600' },
          { label: 'Half-day', count: halfDays,   cls: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Leave',   count: leaveDays,   cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${cls}`}>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Current Week Summary */}
      <div className="df-card p-5">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Current Week Overview</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const record = recordMap[dateStr];
            const isTodayDay = dateStr === today;
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;
            
            return (
              <div key={dateStr} className={`rounded-xl p-3 flex flex-col items-center justify-center border ${isTodayDay ? 'border-indigo-200 bg-indigo-50/30' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <span className="text-[10px] font-semibold uppercase text-zinc-400 mb-1">{format(day, 'EEE')}</span>
                <span className={`text-lg font-bold mb-2 ${isTodayDay ? 'text-indigo-600' : 'text-zinc-900'}`}>{format(day, 'd')}</span>
                {record ? (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[record.status]}`}>{record.status === 'Half-day' ? 'Half' : record.status}</span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 text-zinc-400">{isWeekend ? 'Off' : '—'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar */}
      <div className="df-card p-5">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-zinc-900">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-ghost p-2">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-secondary btn-sm px-3">Today</button>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-ghost p-2">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-zinc-400 py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for start padding */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const record  = recordMap[dateStr];
            const isToday = dateStr === today;
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;

            return (
              <div
                key={dateStr}
                title={record ? `${record.status}` : isWeekend ? 'Weekend' : 'No record'}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all duration-100 cursor-default
                  ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                  ${record ? STATUS_COLORS[record.status] || 'bg-zinc-100 text-zinc-500' : isWeekend ? 'bg-zinc-50 text-zinc-300' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}
                `}
              >
                <span>{format(day, 'd')}</span>
                {record && (
                  <span className="text-[8px] mt-0.5 opacity-70 hidden sm:block">
                    {record.status === 'Half-day' ? '½' : record.status.charAt(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-100">
          {[
            { label: 'Present', cls: 'bg-emerald-100' },
            { label: 'Absent',  cls: 'bg-red-100' },
            { label: 'Half-day', cls: 'bg-amber-100' },
            { label: 'Leave',   cls: 'bg-indigo-100' },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <div className={`w-3 h-3 rounded-sm ${cls}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* History table */}
      <div className="df-card">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-sm font-semibold text-zinc-900">Attendance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="df-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-zinc-400 text-sm">No records for this month</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium text-zinc-800">{formatDate(r.date, 'MMM d, yyyy')}</td>
                    <td className="text-zinc-500">{formatDate(r.date, 'EEEE')}</td>
                    <td className="text-zinc-600">{formatTime(r.check_in)}</td>
                    <td className="text-zinc-600">{formatTime(r.check_out)}</td>
                    <td><StatusBadge status={r.status} /></td>
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
