import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AudioLines, Calendar, CalendarClock, CalendarPlus, CheckCircle2,
  CheckSquare, ChevronRight, Clock, Download, FileText, Gavel, Loader2, Search, Sparkles, Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMeeting, MEETING_KEYS } from '../hooks/useMeetings';
import { useInsights, useSummary, INSIGHT_KEYS } from '@/features/ai-insights/hooks/useInsights';
import { useActionItems, ACTION_ITEM_KEYS } from '@/features/action-items/hooks/useActionItems';
import { useAnalyzeAll } from '@/features/ai-insights/hooks/useAI';
import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';
import { formatDate, formatDateTime } from '@/utils/date.utils';

const priorityClass = (p) => ({
  low: 'bg-zinc-800 text-neutral-50',
  medium: 'bg-[oklch(0.769_0.188_70.08/.2)] text-[oklch(0.769_0.188_70.08)]',
  high: 'bg-[#ff6467]/20 text-[#ff6467]',
  critical: 'bg-[#ff6467]/30 text-[#ff6467]',
}[p] ?? 'bg-zinc-800 text-neutral-50');

const initials = (name) => name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: meeting, isLoading: meetingLoading } = useMeeting(id);
  const { data: transcript, isLoading: transcriptLoading } = useQuery({
    queryKey: ['transcript', id],
    queryFn: () => api.get(ENDPOINTS.TRANSCRIPTS.GET(id)).then((r) => r.data.data),
    enabled: !!id,
  });
  const { data: summary, isLoading: summaryLoading } = useSummary(id);
  const { data: insights = [], isLoading: insightsLoading } = useInsights(id);
  const { data: actionItemsData, isLoading: actionsLoading } = useActionItems({ meetingId: id, limit: 50 });

  const { mutate: runAnalysis, isPending: analyzing } = useAnalyzeAll(id);

  const actionItems = actionItemsData?.items ?? [];
  const decisions = insights.filter((i) => i.type === 'key_decision');
  const followups = insights.filter((i) => i.type === 'followup');

  // Split summary content into bullet points
  const summaryBullets = summary?.content
    ? summary.content.split(/\.\s+/).filter(Boolean).map((s) => s.endsWith('.') ? s : s + '.')
    : [];

  const handleDownloadTranscript = () => {
    if (!transcript) return;
    const body = transcript.segments?.length
      ? transcript.segments.map((seg) => {
          const time = seg.startTime != null
            ? `[${String(Math.floor(seg.startTime / 60)).padStart(2, '0')}:${String(Math.floor(seg.startTime % 60)).padStart(2, '0')}] `
            : '';
          return `${time}${seg.speaker}: ${seg.text}`;
        }).join('\n')
      : transcript.rawText ?? '';

    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(meeting?.title ?? 'transcript').replace(/[^\w\- ]/g, '').trim() || 'transcript'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRunAnalysis = () => {
    runAnalysis({}, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: INSIGHT_KEYS.summary(id) });
        qc.invalidateQueries({ queryKey: INSIGHT_KEYS.insights(id) });
        qc.invalidateQueries({ queryKey: ACTION_ITEM_KEYS.lists() });
        qc.invalidateQueries({ queryKey: MEETING_KEYS.detail(id) });
      },
    });
  };

  if (meetingLoading) {
    return (
      <div className="p-8 flex flex-col gap-6">
        <div className="h-20 animate-pulse rounded-xl bg-zinc-800" />
        <div className="flex gap-6" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="w-[55%] h-full animate-pulse rounded-xl bg-zinc-800" />
          <div className="w-[45%] flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-800" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-8 flex-col gap-6 min-h-screen">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-2">
        <div className="text-[#9f9fa9] text-sm flex items-center gap-1">
          <button onClick={() => navigate('/meetings')} className="hover:text-white transition-colors">Meetings</button>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-neutral-50">{meeting?.title ?? '...'}</span>
        </div>
        <div className="flex justify-between items-center gap-3 flex-wrap">
          <h1 className="font-semibold text-2xl tracking-tight">{meeting?.title}</h1>
          <div className="flex items-center gap-2">
            {/* Start / Join meeting room */}
            {meeting?.status !== 'completed' && meeting?.status !== 'cancelled' && (
              <Button
                onClick={() => navigate(`/meetings/${id}/room`)}
                className="bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 hover:from-emerald-500 hover:to-emerald-600 text-white gap-1.5 rounded-full text-xs h-8 px-4 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <Video className="size-3.5" />
                {meeting?.status === 'in_progress' ? 'Rejoin Meeting' : 'Start Meeting'}
              </Button>
            )}

            {meeting?.hasInsights ? (
              <div className="shadow-[0_0_18px_oklch(0.646_0.222_41.116/.35)] font-medium rounded-full bg-primary/15 text-primary text-xs border border-primary/40 flex px-3 py-1 items-center gap-1.5">
                <Sparkles className="size-3.5" />AI Analyzed
              </div>
            ) : (
              <Button
                onClick={handleRunAnalysis}
                disabled={analyzing || !meeting?.hasTranscript}
                className="bg-primary text-orange-50 gap-1.5 rounded-full text-xs h-8 px-4"
                title={!meeting?.hasTranscript ? 'Upload a transcript first' : ''}
              >
                {analyzing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                {analyzing ? 'Analysing…' : 'Run Analysis'}
              </Button>
            )}
          </div>
        </div>
        <div className="text-[#9f9fa9] text-sm flex items-center gap-4 flex-wrap">
          {meeting?.duration && <span className="flex items-center gap-1.5"><Clock className="size-4" />{meeting.duration} min</span>}
          {meeting?.scheduledAt && <span className="flex items-center gap-1.5"><Calendar className="size-4" />{formatDate(meeting.scheduledAt, 'MMM d, yyyy')}</span>}
          {meeting?.participants?.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="-space-x-2 flex">
                {meeting.participants.slice(0, 4).map((p) => (
                  <div key={p.name} className="size-7 ring-2 ring-zinc-950 rounded-full bg-primary/30 text-primary text-[10px] font-semibold flex items-center justify-center">
                    {initials(p.name)}
                  </div>
                ))}
              </div>
              <span className="text-xs">{meeting.participants.map((p) => p.name).join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Split content */}
      <div className="flex flex-1 gap-6 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Transcript panel */}
        <div className="w-[55%] flex flex-col min-h-0">
          <Card className="backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.3)] bg-zinc-900/60 border border-white/10 flex flex-col flex-1 gap-0 overflow-hidden p-0">
            <div className="sticky z-10 backdrop-blur-md bg-zinc-900/80 border-b border-white/10 top-0 p-4">
              <div className="flex mb-3 justify-between items-center">
                <h2 className="font-semibold text-sm flex items-center gap-2"><FileText className="size-4 text-primary" />Transcript</h2>
                <div className="flex items-center gap-3">
                  {transcript && <span className="text-[#9f9fa9] text-xs">{transcript.wordCount?.toLocaleString()} words</span>}
                  {transcript && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadTranscript}
                      className="bg-zinc-800/40 text-[#9f9fa9] border-white/10 hover:text-neutral-50 gap-1.5 h-7 text-xs px-2.5"
                    >
                      <Download className="size-3.5" />Download
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative">
                <Search className="top-1/2 -translate-y-1/2 size-4 text-[#9f9fa9] absolute left-3" />
                <Input placeholder="Search transcript keywords..." className="bg-zinc-800/40 border border-primary/30 pl-9 h-9 text-sm" />
              </div>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col flex-1 gap-5 scrollbar-hide">
              {transcriptLoading && <div className="animate-pulse space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded-lg" />)}</div>}
              {!transcriptLoading && !transcript && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <AudioLines className="size-8 text-[#9f9fa9]" />
                  <p className="text-[#9f9fa9] text-sm">No transcript yet.</p>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-[oklch(0.769_0.188_70.08)] text-orange-50 gap-1.5"
                    onClick={() => navigate(`/meetings/${id}/transcript`)}
                  >
                    <FileText className="size-3.5" />Upload Transcript
                  </Button>
                </div>
              )}
              {!transcriptLoading && transcript && transcript.segments?.length > 0 && transcript.segments.map((seg, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {seg.startTime != null && (
                      <span className="font-mono text-primary/80 text-xs">
                        {String(Math.floor(seg.startTime / 60)).padStart(2, '0')}:{String(Math.floor(seg.startTime % 60)).padStart(2, '0')}
                      </span>
                    )}
                    <span className="font-bold text-sm">{seg.speaker}</span>
                  </div>
                  <p className="text-[#9f9fa9] text-sm leading-relaxed">{seg.text}</p>
                </div>
              ))}
              {!transcriptLoading && transcript && !transcript.segments?.length && (
                <p className="font-mono text-sm text-[#9f9fa9] leading-relaxed whitespace-pre-wrap">{transcript.rawText}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Analysis panel */}
        <div className="w-[45%] overflow-y-auto flex flex-col gap-4 pr-1 scrollbar-hide">
          {/* AI Summary */}
          <Card className="backdrop-blur-md border-l-4 border-l-primary shadow-[0_0_24px_oklch(0.646_0.222_41.116/.18)] bg-zinc-900/60 border border-white/10 p-5 gap-3">
            <CardHeader className="p-0 gap-1">
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="size-4 text-primary" />AI Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex p-0 flex-col gap-2">
              {summaryLoading && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-4 animate-pulse bg-zinc-800 rounded" />)}</div>}
              {!summaryLoading && !summary && (
                <p className="text-[#9f9fa9] text-sm">No summary yet. Run analysis to generate one.</p>
              )}
              {!summaryLoading && summaryBullets.map((s, i) => (
                <div key={i} className="text-[#9f9fa9] text-sm flex gap-2">
                  <span className="text-primary mt-0.5 shrink-0">•</span><span>{s}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="px-0 pt-1 pb-0">
              <span className="text-primary/80 text-[10px] flex items-center gap-1"><Sparkles className="size-3" />Generated by Hintro AI</span>
            </CardFooter>
          </Card>

          {/* Key decisions */}
          <Card className="bg-zinc-900/60 border border-white/10 p-5 gap-3">
            <CardHeader className="p-0">
              <CardTitle className="text-sm flex items-center gap-2"><Gavel className="size-4 text-primary" />Key Decisions</CardTitle>
            </CardHeader>
            <CardContent className="flex p-0 flex-col gap-2">
              {insightsLoading && <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-9 animate-pulse bg-zinc-800 rounded-lg" />)}</div>}
              {!insightsLoading && decisions.length === 0 && <p className="text-[#9f9fa9] text-sm">No decisions recorded yet.</p>}
              {!insightsLoading && decisions.map((d) => (
                <div key={d._id} className="rounded-lg bg-primary/10 text-sm border border-primary/30 flex px-3 py-2 items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />{d.title}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action items */}
          <Card className="bg-zinc-900/60 border border-white/10 p-5 gap-3">
            <CardHeader className="p-0">
              <CardTitle className="text-sm flex items-center gap-2"><CheckSquare className="size-4 text-primary" />Action Items</CardTitle>
            </CardHeader>
            <CardContent className="flex p-0 flex-col gap-3">
              {actionsLoading && <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-zinc-800 rounded-lg" />)}</div>}
              {!actionsLoading && actionItems.length === 0 && <p className="text-[#9f9fa9] text-sm">No action items yet.</p>}
              {!actionsLoading && actionItems.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/30 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                    {initials(item.assignee?.name || 'UN')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{item.title}</p>
                    <span className="text-[#9f9fa9] text-[10px]">
                      {item.assignee?.name ?? 'Unassigned'}
                      {item.dueDate && ` · Due ${formatDate(item.dueDate, 'MMM d')}`}
                    </span>
                  </div>
                  <Badge className={`text-[10px] border-0 ${priorityClass(item.priority)}`}>{item.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Follow-up suggestions */}
          <Card className="bg-zinc-900/60 border border-white/10 p-5 gap-3">
            <CardHeader className="p-0">
              <CardTitle className="text-sm flex items-center gap-2"><CalendarPlus className="size-4 text-primary" />Follow-up Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="flex p-0 flex-col gap-3">
              {insightsLoading && <div className="h-16 animate-pulse bg-zinc-800 rounded-lg" />}
              {!insightsLoading && followups.length === 0 && <p className="text-[#9f9fa9] text-sm">No follow-ups suggested yet.</p>}
              {!insightsLoading && followups.map((f) => (
                <div key={f._id} className="rounded-lg bg-zinc-800/40 border border-white/10 flex p-3 justify-between items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm">{f.title}</span>
                    <span className="text-[#9f9fa9] text-[10px]">{f.content}</span>
                  </div>
                  <Button variant="outline" className="bg-primary/10 text-primary text-xs border-primary/50 gap-1 h-8">
                    <CalendarClock className="size-3.5" />Schedule
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
