import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, CheckSquare, ChevronRight, Clock,
  Gauge, Gavel, Search, Sparkles, TrendingUp, Video,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis } from 'recharts';
import { useAuthStore } from '@/store/auth.store';
import { useMeetings } from '@/features/meetings/hooks/useMeetings';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';
import { formatDateTime, timeAgo } from '@/utils/date.utils';
import { formatDuration } from '@/utils/format.utils';

const statusBadgeClass = (s) => ({
  scheduled: 'bg-blue-500/15 text-blue-400',
  in_progress: 'bg-purple-500/15 text-purple-400',
  completed: 'bg-[oklch(0.696_0.17_162.48/0.18)] text-[oklch(0.696_0.17_162.48)]',
  cancelled: 'bg-zinc-700 text-[#9f9fa9]',
}[s] ?? 'bg-zinc-700 text-[#9f9fa9]');

const statusLabel = (s) => ({
  scheduled: 'Scheduled',
  in_progress: 'Action Required',
  completed: 'Analyzed',
  cancelled: 'Cancelled',
}[s] ?? s);

const chartCfg = {
  meetings: { label: 'Meetings', color: 'oklch(0.646 0.222 41.116)' },
  actions: { label: 'Actions', color: 'oklch(0.769 0.188 70.08)' },
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Fetch notifications to populate the store (used by the Topbar bell badge)
  useNotifications({ limit: 20 });

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.get(ENDPOINTS.ANALYTICS.DASHBOARD).then((r) => r.data.data),
  });

  const { data: meetingsData, isLoading: meetingsLoading } = useMeetings({ limit: 3, sort: '-scheduledAt' });

  const metrics = dashboardData ?? {};
  const actionCounts = metrics.actionItems ?? {};
  const totalActions = actionCounts.total || 0;
  const completedActions = actionCounts.completed || 0;
  const completionPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const STATS = [
    { label: 'Total Meetings', value: String(metrics.meetings ?? '—'), icon: Video, trend: null, bg: 'bg-orange-500/15', color: 'text-orange-500' },
    { label: 'Action Items Open', value: String(actionCounts.pending ?? '—'), icon: CheckSquare, trend: null, bg: 'bg-[oklch(0.769_0.188_70.08/0.18)]', color: 'text-[oklch(0.769_0.188_70.08)]' },
    { label: 'Insights Generated', value: String(metrics.insights ?? '—'), icon: Gavel, trend: null, bg: 'bg-orange-500/15', color: 'text-orange-500' },
    { label: 'Completion Rate', value: `${completionPct}%`, icon: Gauge, trend: null, bg: 'bg-[oklch(0.769_0.188_70.08/0.18)]', color: 'text-[oklch(0.769_0.188_70.08)]' },
  ];

  const pieData = [
    { name: 'done', value: completionPct || 1, fill: 'oklch(0.646 0.222 41.116)' },
    { name: 'left', value: 100 - completionPct || 1, fill: 'oklch(0.769 0.188 70.08)' },
  ];

  // Build area chart from recent meetings (group by week label)
  const meetings = meetingsData?.items ?? [];
  const areaData = meetings.length > 0
    ? meetings.map((m, i) => ({ d: `W${i + 1}`, meetings: 1, actions: 0 }))
    : [{ d: 'W1', meetings: 0, actions: 0 }];

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 min-w-0 sm:max-w-md">
          <Search className="top-1/2 -translate-y-1/2 size-4 text-[#9f9fa9] absolute left-3.5" />
          <Input className="rounded-full bg-zinc-900 border-white/10 pl-10 h-11" placeholder="Search meetings, transcripts, insights..." />
        </div>
        <div className="flex ml-auto items-center gap-3 shrink-0">
          <Avatar className="size-10 ring-2 ring-primary/40">
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">{user?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl sm:text-3xl tracking-tight">Good {greeting()}, {user?.name?.split(' ')[0] ?? 'there'}.<span className="text-primary">✦</span></h1>
        <p className="text-[#9f9fa9] text-sm">
          {actionCounts.overdue > 0
            ? `${actionCounts.overdue} overdue action item${actionCounts.overdue > 1 ? 's' : ''} need attention.`
            : 'All action items are on track.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map(({ label, value, icon: Icon, trend, bg, color }) => (
          <Card key={label} className="bg-zinc-900/70 border-white/10 p-4 sm:p-5 gap-3">
            <CardHeader className="p-0 flex-row justify-between items-center gap-0">
              <div className={`size-9 rounded-lg ${bg} flex justify-center items-center`}><Icon className={`size-[18px] ${color}`} /></div>
              {trend && <span className="text-emerald-400 font-medium text-xs flex items-center gap-0.5"><TrendingUp className="size-3" />{trend}</span>}
            </CardHeader>
            <CardContent className="flex p-0 flex-col gap-0.5">
              <span className="font-bold text-2xl">{value}</span>
              <span className="text-[#9f9fa9] text-xs">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2 bg-zinc-900 border-white/10 p-4 sm:p-6 gap-4 flex flex-col">
          <CardHeader className="p-0 flex-row justify-between items-center gap-0">
            <div className="flex flex-col gap-0.5">
              <CardTitle className="text-base">Recent Meetings</CardTitle>
              <CardDescription className="text-xs">Your latest sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-7" onClick={() => navigate('/meetings')}>
              View all <ChevronRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex p-0 flex-col gap-3">
            {meetingsLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800/50" />
            ))}
            {!meetingsLoading && meetings.length === 0 && (
              <div className="text-center py-8 text-[#9f9fa9] text-sm">No meetings yet. <button onClick={() => navigate('/meetings')} className="text-primary underline">Create one</button>.</div>
            )}
            {!meetingsLoading && meetings.map((m) => (
              <div
                key={m._id}
                onClick={() => navigate(`/meetings/${m._id}`)}
                className="rounded-xl bg-zinc-800/50 border border-white/10 p-4 flex flex-col gap-3 hover:bg-zinc-800/70 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="font-medium text-sm truncate">{m.title}</span>
                    <span className="text-[#9f9fa9] text-xs flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDateTime(m.scheduledAt)}</span>
                      {m.duration && <span className="flex items-center gap-1"><Clock className="size-3" />{formatDuration(m.duration)}</span>}
                    </span>
                  </div>
                  <Badge className={`text-[10px] border-0 shrink-0 ${statusBadgeClass(m.status)}`}>{statusLabel(m.status)}</Badge>
                </div>
                {m.description && <p className="text-[#9f9fa9] text-xs leading-relaxed line-clamp-2">{m.description}</p>}
                <div className="flex items-center gap-2">
                  {m.hasTranscript && <Badge className="text-[10px] border-0 bg-emerald-500/15 text-emerald-400">Transcript</Badge>}
                  {m.hasInsights && <Badge className="text-[10px] border-0 bg-primary/15 text-primary">Insights</Badge>}
                  {m.participants?.length > 0 && (
                    <span className="text-[#9f9fa9] text-[10px] ml-auto">{m.participants.length} participant{m.participants.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-white/10 p-4 sm:p-6 gap-4 flex flex-col flex-1">
            <CardHeader className="p-0 gap-0.5">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="size-4 text-primary" />AI Productivity</CardTitle>
              <CardDescription className="text-xs">Meetings over time</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ChartContainer config={chartCfg} className="w-full h-[180px]">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.5} /><stop offset="95%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="oklch(0.769 0.188 70.08)" stopOpacity={0.4} /><stop offset="95%" stopColor="oklch(0.769 0.188 70.08)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="oklch(1 0 0 / 8%)" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: '#9f9fa9', fontSize: 11 }} />
                  <ChartTooltip />
                  <Area dataKey="meetings" type="monotone" stroke="oklch(0.646 0.222 41.116)" strokeWidth={2} fill="url(#gm)" />
                  <Area dataKey="actions" type="monotone" stroke="oklch(0.769 0.188 70.08)" strokeWidth={2} fill="url(#ga)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-white/10 p-4 sm:p-6 gap-3">
            <CardHeader className="p-0 gap-0.5"><CardTitle className="text-sm">Action Item Completion</CardTitle></CardHeader>
            <CardContent className="relative flex p-0 justify-center items-center">
              <ChartContainer config={{ done: { label: 'Done', color: 'oklch(0.646 0.222 41.116)' }, left: { label: 'Left', color: 'oklch(0.769 0.188 70.08)' } }} className="w-[120px] h-[120px]">
                <PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={55} strokeWidth={0} /></PieChart>
              </ChartContainer>
              <div className="flex absolute flex-col items-center">
                <span className="font-bold text-xl">{completionPct}%</span>
                <span className="text-[#9f9fa9] text-[10px]">Complete</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
