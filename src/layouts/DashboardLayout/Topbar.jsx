import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';
import { useNotifications, useMarkNotificationRead } from '@/features/notifications/hooks/useNotifications';
import { timeAgo } from '@/utils/date.utils';
import { cn } from '@/utils/cn';

const TYPE_ICON = {
  insight_ready: '✨',
  transcript_processed: '📝',
  meeting_reminder: '🗓',
  action_item_overdue: '⚠️',
  action_item_due: '🔔',
};

export default function Topbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const prevUnreadRef = useRef(unreadCount);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  // Poll every 30 s
  useNotifications({ limit: 20 }, { refetchInterval: 30_000 });
  const { mutate: markRead } = useMarkNotificationRead();

  // Toast when new unread notifications arrive
  useEffect(() => {
    const prev = prevUnreadRef.current;
    if (unreadCount > prev) {
      const diff = unreadCount - prev;
      toast(
        (t) => (
          <div className="flex items-start gap-3">
            <span className="text-lg">🔔</span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-neutral-50">
                {diff} new notification{diff > 1 ? 's' : ''}
              </p>
              <button
                className="text-xs text-primary hover:underline text-left"
                onClick={() => { toast.dismiss(t.id); navigate('/reminders'); }}
              >
                View all →
              </button>
            </div>
          </div>
        ),
        { duration: 5000, style: { background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f5' } }
      );
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, navigate]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recent = notifications.slice(0, 8);
  const hasUnread = unreadCount > 0;

  return (
    <header className="relative z-50 h-14 shrink-0 border-b border-white/[0.06] bg-zinc-900/80 backdrop-blur-md flex items-center justify-between lg:justify-end px-4 sm:px-6 gap-3 overflow-visible">
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="size-10 rounded-xl flex items-center justify-center text-[#9f9fa9] hover:bg-zinc-800 hover:text-neutral-50 transition-colors"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-bold text-base tracking-tight text-neutral-50">Hintro</span>
      </div>

      {/* Notification bell */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'relative size-11 rounded-xl flex items-center justify-center transition-colors',
            open
              ? 'bg-zinc-700 text-neutral-50 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
              : 'text-[#9f9fa9] hover:bg-zinc-800 hover:text-neutral-50'
          )}
        >
          <Bell className="size-5" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-[11px] font-bold text-white shadow-[0_0_10px_oklch(0.646_0.222_41.116/0.7)] leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown — fixed so it's never clipped by overflow */}
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />

            <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-[calc(100%+8px)] w-auto sm:w-[420px] max-w-[420px] mx-auto sm:mx-0 rounded-2xl bg-zinc-900 border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.7)] z-[100] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <span className="font-semibold text-sm">Notifications</span>
                {hasUnread && (
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <div className="size-12 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Bell className="size-5 text-[#9f9fa9]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#9f9fa9]">All caught up</p>
                      <p className="text-xs text-zinc-600 mt-0.5">No notifications yet</p>
                    </div>
                  </div>
                ) : (
                  recent.map((notif) => (
                    <div
                      key={notif._id}
                      className={cn(
                        'flex items-start gap-3.5 px-5 py-3.5 border-b border-white/[0.05] hover:bg-zinc-800/50 transition-colors group',
                        !notif.isRead && 'bg-white/[0.03]'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'size-9 shrink-0 rounded-xl flex items-center justify-center text-base mt-0.5',
                        !notif.isRead ? 'bg-zinc-700' : 'bg-zinc-800/60'
                      )}>
                        {TYPE_ICON[notif.type] ?? '🔔'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            'text-sm font-medium leading-snug',
                            notif.isRead ? 'text-[#9f9fa9]' : 'text-neutral-50'
                          )}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(notif._id); }}
                              className="shrink-0 size-6 rounded-lg flex items-center justify-center text-[#9f9fa9] opacity-0 group-hover:opacity-100 hover:text-neutral-50 hover:bg-zinc-700 transition-all"
                              title="Mark read"
                            >
                              <Check className="size-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-[#9f9fa9] mt-1 line-clamp-2 leading-relaxed">{notif.body}</p>
                        <p className="text-[11px] text-zinc-600 mt-1.5">{timeAgo(notif.createdAt)}</p>
                      </div>

                      {/* Unread dot */}
                      {!notif.isRead && (
                        <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <button
                onClick={() => { setOpen(false); navigate('/reminders'); }}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm text-[#9f9fa9] hover:text-neutral-50 hover:bg-zinc-800/60 transition-colors border-t border-white/[0.07]"
              >
                View all notifications
                <ExternalLink className="size-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
