import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileText, Wallet, BarChart3,
  ClipboardCheck, Settings, LogOut, ChevronRight, Layers,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const EMPLOYEE_NAV = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/profile',   icon: Users,           label: 'My Profile' },
  { to: '/employee/attendance', icon: Calendar,        label: 'Attendance' },
  { to: '/employee/leaves',    icon: FileText,         label: 'Leave Requests' },
  { to: '/employee/payroll',   icon: Wallet,           label: 'Payroll' },
];

const ADMIN_NAV = [
  { to: '/admin/dashboard',   icon: LayoutDashboard,  label: 'Dashboard' },
  { to: '/admin/employees',   icon: Users,             label: 'Employees' },
  { to: '/admin/leaves',      icon: ClipboardCheck,    label: 'Leave Approvals' },
  { to: '/admin/attendance',  icon: Calendar,          label: 'Attendance Logs' },
  { to: '/admin/payroll',     icon: Wallet,            label: 'Payroll Controls' },
  { to: '/admin/reports',     icon: BarChart3,         label: 'Reports' },
];

export function Sidebar({ collapsed, onToggle }) {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? ADMIN_NAV : EMPLOYEE_NAV;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-zinc-950 border-r border-zinc-800/60 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800/60 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-white font-bold text-base tracking-tight">Dayflow</span>
            <span className="block text-zinc-500 text-[10px] leading-none tracking-widest uppercase mt-0.5">HRMS</span>
          </div>
        )}
      </div>

      {/* Nav section label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-1">
          <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            {isAdmin ? 'Administration' : 'My Workspace'}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 pt-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/6'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-indigo-400' : '')} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2 border-t border-zinc-800/60">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/6 transition-all duration-150 text-xs font-medium"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronRight className={cn('w-4 h-4 transition-transform duration-300', !collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* User info + sign out */}
      <div className="p-3 border-t border-zinc-800/60">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <EmployeeAvatar name={profile?.full_name} imageUrl={profile?.profile_picture_url} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile?.full_name}</p>
              <p className="text-zinc-500 text-[10px] truncate">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="text-zinc-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="w-full flex items-center justify-center py-2 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
