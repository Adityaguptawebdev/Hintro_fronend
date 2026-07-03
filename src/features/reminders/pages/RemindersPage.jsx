import {
  Bot, CalendarClock, Check, CheckCircle2, Circle, Hash,
  Mail, Send, Sparkles, Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/features/notifications/hooks/useNotifications';
import { useAuthStore } from '@/store/auth.store';
import { timeAgo } from '@/utils/date.utils';

const WORKFLOW = [
  { icon: Video, label: 'Meeting Analyzed', active: false },
  { icon: Sparkles, label: 'AI Extracts Action Items', active: false },
  { icon: CalendarClock, label: 'Reminder Scheduled', active: false },
  { icon: Send, label: 'Delivered via Slack / Telegram', active: true },
];

const notifBorderColor = (type) => ({
  action_item_overdue: 'border-l-destructive',
  meeting_reminder: 'border-l-primary',
  action_item_due: 'border-l-amber-500',
  insight_ready: 'border-l-[oklch(0.696_0.17_162.48)]',
  transcript_processed: 'border-l-[oklch(0.769_0.188_70.08)]',
}[type] ?? 'border-l-primary');

const notifBadge = (type) => ({
  action_item_overdue: { label: 'Overdue', cls: 'bg-[#ff6467]/20 text-[#ff6467]' },
  meeting_reminder: { label: 'Reminder', cls: 'bg-primary/20 text-primary' },
  action_item_due: { label: 'Due Soon', cls: 'bg-amber-500/20 text-amber-400' },
  insight_ready: { label: 'Insight', cls: 'bg-emerald-500/20 text-emerald-400' },
  transcript_processed: { label: 'Transcript', cls: 'bg-primary/20 text-primary' },
}[type] ?? { label: 'Notification', cls: 'bg-primary/20 text-primary' });

export default function RemindersPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useNotifications({ limit: 20 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const notifications = data?.items ?? [];
  const timelineItems = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  const telegramConnected = user?.integrations?.telegram?.isConnected ?? false;
  const slackConnected = user?.integrations?.slack?.isConnected ?? false;

  const CHANNELS = [
    { name: 'Telegram', icon: Bot, iconColor: 'text-[#3BB3E8]', bg: 'bg-[#229ED9]/20', connected: telegramConnected },
    { name: 'Slack', icon: Hash, iconColor: 'text-[#E01E5A]', bg: 'bg-[#4A154B]/30', connected: slackConnected },
    { name: 'Email', icon: Mail, iconColor: 'text-[#9f9fa9]', bg: 'bg-zinc-800', connected: false },
  ];

  return (
    <div className="overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-8 min-h-screen">
      <header className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl sm:text-3xl tracking-tight">Reminders</h1>
        <p className="text-[#9f9fa9] text-sm">Automated follow-ups and smart reminders delivered to your team.</p>
      </header>

      {/* Channels */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold uppercase text-[#9f9fa9] text-sm tracking-wider">Active Reminder Channels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHANNELS.map(({ name, icon: Icon, iconColor, bg, connected }) => (
            <Card key={name} className="backdrop-blur-md bg-zinc-900/60 border-white/10 p-6 gap-4">
              <CardHeader className="flex p-0 flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className={`size-10 rounded-xl ${bg} flex justify-center items-center`}><Icon className={`size-5 ${iconColor}`} /></div>
                  <span className="font-semibold">{name}</span>
                </div>
                <Switch defaultChecked={connected} disabled={!connected} />
              </CardHeader>
              <CardContent className="flex p-0 justify-between items-center gap-2">
                {connected
                  ? <span className="text-emerald-400 text-xs flex items-center gap-1.5"><CheckCircle2 className="size-3.5" />Connected</span>
                  : <span className="text-[#9f9fa9] text-xs flex items-center gap-1.5"><Circle className="size-3.5" />Not Connected</span>
                }
                <Link to="/settings" className="font-medium text-primary text-xs hover:underline">Configure</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Notifications / Reminders */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold uppercase text-[#9f9fa9] text-sm tracking-wider">Notifications</h2>
          {notifications.some((n) => !n.isRead) && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-[#9f9fa9] hover:text-neutral-50 h-7 px-3"
              onClick={() => markAllRead()}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? 'Marking...' : 'Mark all read'}
            </Button>
          )}
        </div>
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-800" />)}
          </div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center rounded-xl bg-zinc-900/40 border border-white/10">
            <Bot className="size-8 text-[#9f9fa9]" />
            <p className="text-[#9f9fa9] text-sm">No notifications yet.</p>
            <p className="text-[#9f9fa9]/60 text-xs">Reminders appear here when action items are overdue or meetings are upcoming.</p>
          </div>
        )}
        {!isLoading && (
          <div className="flex flex-col gap-3">
            {notifications.map((notif) => {
              const { label, cls } = notifBadge(notif.type);
              return (
                <Card key={notif._id} className={`backdrop-blur-md bg-zinc-900/60 border-l-4 ${notifBorderColor(notif.type)} border-r border-t border-b border-white/10 p-4 gap-3 ${notif.isRead ? 'opacity-60' : ''}`}>
                  <CardContent className="flex p-0 items-start gap-3">
                    <div className="size-9 shrink-0 rounded-full bg-[#229ED9]/20 flex justify-center items-center">
                      <Bot className="size-5 text-[#3BB3E8]" />
                    </div>
                    <div className="flex flex-col flex-1 gap-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{notif.title}</span>
                        <Badge className={`${cls} text-[10px] border-0`}>{label}</Badge>
                        <span className="text-[#9f9fa9] text-xs ml-auto">{timeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="rounded-lg bg-zinc-800 text-sm p-3">{notif.body}</p>
                      {!notif.isRead && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[#9f9fa9] border-white/10 gap-1 h-7"
                            onClick={() => markRead(notif._id)}
                          >
                            <Check className="size-3" />Mark Read
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom grid */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Timeline */}
        <Card className="lg:col-span-3 backdrop-blur-md bg-zinc-900/60 border-white/10 p-6 gap-4">
          <CardHeader className="p-0 gap-1">
            <CardTitle className="text-base">Notification History</CardTitle>
            <CardDescription className="text-xs">Recent delivery events</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {timelineItems.length === 0 ? (
              <p className="text-[#9f9fa9] text-sm py-4 text-center">No history yet.</p>
            ) : (
              <div className="relative overflow-x-auto pb-2 scrollbar-hide">
                <div className="relative min-w-[560px] flex pt-2 items-start gap-8">
                  <div className="bg-gradient-to-r from-primary via-primary to-primary/30 shadow-[0_0_8px_2px_oklch(0.646_0.222_41.116_/_0.6)] absolute inset-x-2 top-3.5 h-0.5" />
                  {timelineItems.map((notif) => {
                    const { label } = notifBadge(notif.type);
                    return (
                      <div key={notif._id} className="relative flex flex-col items-center gap-2 w-36">
                        <div className={`size-4 ring-4 ring-primary/30 z-10 rounded-full ${notif.isRead ? 'bg-primary' : 'bg-[#9f9fa9]'}`} />
                        <div className="rounded-lg bg-zinc-800/70 border border-white/10 flex p-2 flex-col gap-1 w-full">
                          <div className="flex items-center gap-1"><Send className="size-3 text-[#3BB3E8]" /><span className="font-medium text-[10px]">{label}</span></div>
                          <p className="text-[#9f9fa9] text-[10px] leading-tight line-clamp-2">{notif.title}</p>
                          <span className={`text-[10px] flex items-center gap-0.5 ${notif.isRead ? 'text-emerald-400' : 'text-[#9f9fa9]'}`}>
                            {notif.isRead ? <Check className="size-3" /> : <Circle className="size-3" />}
                            {notif.isRead ? 'Read' : 'Unread'}
                          </span>
                          <span className="text-[#9f9fa9] text-[9px]">{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automation workflow */}
        <Card className="lg:col-span-2 backdrop-blur-md bg-zinc-900/60 border-white/10 p-6 gap-4">
          <CardHeader className="p-0 gap-1">
            <CardTitle className="text-base">Automation Workflow</CardTitle>
            <CardDescription className="text-xs">How reminders are generated</CardDescription>
          </CardHeader>
          <CardContent className="flex p-0 flex-col gap-0">
            {WORKFLOW.map(({ icon: Icon, label, active }, i) => (
              <div key={label}>
                <div className={`rounded-xl ${active ? 'bg-primary/15 border-primary/40' : 'bg-zinc-800/70 border-white/10'} border flex p-3 items-center gap-3`}>
                  <div className={`size-8 shrink-0 rounded-lg ${active ? 'bg-primary/30' : 'bg-primary/20'} flex justify-center items-center`}>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{label}</span>
                </div>
                {i < WORKFLOW.length - 1 && (
                  <div className="shadow-[0_0_6px_1px_oklch(0.646_0.222_41.116_/_0.7)] bg-primary ml-7 w-0.5 h-5" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
