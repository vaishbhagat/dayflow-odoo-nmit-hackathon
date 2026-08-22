import { useState } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeAvatar } from '@/components/shared/EmployeeAvatar';
import { NotificationPanel } from './NotificationPanel';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export function Topbar({ sidebarWidth }) {
  const { profile } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <header
        className="fixed top-0 right-0 h-14 z-20 flex items-center gap-3 px-5 bg-white/90 backdrop-blur-md border-b border-zinc-200/80"
        style={{ left: sidebarWidth }}
      >
        {/* Search bar */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-150"
          />
        </div>

        <div className="flex-1" />

        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-all duration-150"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2 pl-3 border-l border-zinc-200">
          <EmployeeAvatar name={profile?.full_name} imageUrl={profile?.profile_picture_url} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-800 leading-none">{profile?.full_name}</p>
            <p className="text-xs text-zinc-500 leading-none mt-0.5">{profile?.designation}</p>
          </div>
        </div>
      </header>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} />
    </>
  );
}
