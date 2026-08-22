import { X, Bell, CheckCheck } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

const TYPE_STYLES = {
  success: 'bg-emerald-50 border-l-2 border-emerald-400',
  error:   'bg-red-50 border-l-2 border-red-400',
  warning: 'bg-amber-50 border-l-2 border-amber-400',
  info:    'bg-zinc-50 border-l-2 border-zinc-300',
};

export function NotificationPanel({ open, onClose, notifications = [] }) {
  const qc = useQueryClient();

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const markRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white border-l border-zinc-200 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">Notifications</h2>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} title="Mark all read" className="text-zinc-400 hover:text-indigo-600 transition-colors">
              <CheckCheck className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="w-8 h-8 text-zinc-300 mb-3" />
              <p className="text-sm text-zinc-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors duration-100',
                  TYPE_STYLES[n.type] || TYPE_STYLES.info,
                  !n.is_read && 'bg-indigo-50/30'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-semibold text-zinc-900 mb-0.5', !n.is_read && 'text-indigo-900')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-zinc-600 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">{formatDate(n.created_at, 'MMM d, h:mm a')}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
