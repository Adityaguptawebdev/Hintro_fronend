import { useParams } from 'react-router-dom';
import { ArrowUpRight, FileText, Loader2, Network, SendHorizontal, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMeeting, MEETING_KEYS } from '../../../features/meetings/hooks/useMeetings';
import { useInsights, INSIGHT_KEYS } from '../hooks/useInsights';
import { useAnalyzeAll } from '../hooks/useAI';
import { useQueryClient } from '@tanstack/react-query';
import { formatDuration } from '@/utils/format.utils';

const typeColor = (type) => ({
  risk: 'bg-[#ff6467]/15 text-[#ff6467]',
  opportunity: 'bg-emerald-500/15 text-emerald-400',
  key_decision: 'bg-primary/15 text-primary',
  followup: 'bg-[oklch(0.769_0.188_70.08/0.18)] text-[oklch(0.769_0.188_70.08)]',
  sentiment: 'bg-purple-500/15 text-purple-400',
}[type] ?? 'bg-zinc-800 text-[#9f9fa9]');

const typeLabel = (type) => ({
  risk: 'Risk',
  opportunity: 'Opportunity',
  key_decision: 'Decision',
  followup: 'Follow-up',
  sentiment: 'Sentiment',
}[type] ?? type);

const cardOffset = ['', 'translate-y-4', '', 'translate-y-4'];

export default function InsightsPage() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: meeting } = useMeeting(id);
  const { data: insights = [], isLoading: insightsLoading } = useInsights(id);

  const { mutate: runAnalysis, isPending: analyzing } = useAnalyzeAll(id);

  const handleRunAnalysis = () => {
    runAnalysis({}, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: INSIGHT_KEYS.insights(id) });
        qc.invalidateQueries({ queryKey: INSIGHT_KEYS.summary(id) });
        qc.invalidateQueries({ queryKey: MEETING_KEYS.detail(id) });
      },
    });
  };

  // Flatten all citations across insights into transcript snippets
  const snippets = insights
    .flatMap((i) => (i.citations ?? []).map((c) => ({ ...c, insightTitle: i.title })))
    .slice(0, 3);

  return (
    <div className="relative p-8 flex flex-col gap-6 min-h-screen bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,oklch(0.646_0.222_41.116/.18),transparent_70%)]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-tight">AI Analysis</h1>
          <p className="text-[#9f9fa9] text-sm">
            {meeting?.title ?? 'Meeting'}
            {meeting?.duration ? ` · ${formatDuration(meeting.duration)}` : ''}
            {meeting?.participants?.length ? ` · ${meeting.participants.length} participants` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {insights.length === 0 && !insightsLoading && (
            <Button
              onClick={handleRunAnalysis}
              disabled={analyzing || !meeting?.hasTranscript}
              className="bg-primary text-orange-50 gap-1.5 text-sm"
              title={!meeting?.hasTranscript ? 'Upload a transcript first' : ''}
            >
              {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {analyzing ? 'Analysing…' : 'Analyse Meeting'}
            </Button>
          )}
          {insights.length > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40 gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              {insights.length} Insight{insights.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Chat panel (decorative — UI placeholder) */}
        <Card className="backdrop-blur-xl shadow-[0_0_40px_-12px_oklch(0.646_0.222_41.116/.4)] bg-zinc-900/60 border-orange-500/20 p-6 gap-4 flex flex-col" style={{ minHeight: 500 }}>
          <CardHeader className="p-0 flex-row justify-between items-center gap-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary text-sm">Hintro AI ✦</span>
              <span className="size-2 animate-pulse shadow-[0_0_8px_oklch(0.646_0.222_41.116)] rounded-full bg-primary" />
            </div>
            <span className="text-[#9f9fa9] text-xs">Ask about this meeting</span>
          </CardHeader>

          <CardContent className="flex p-0 flex-col flex-1 gap-4 overflow-y-auto scrollbar-hide">
            {insightsLoading ? (
              <div className="space-y-3 mt-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 animate-pulse bg-zinc-800 rounded-xl" />)}
              </div>
            ) : insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-12">
                <Sparkles className="size-8 text-[#9f9fa9]" />
                <p className="text-[#9f9fa9] text-sm">No insights yet.</p>
                <p className="text-[#9f9fa9]/60 text-xs">Run analysis to generate AI-powered insights from your transcript.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight._id} className="rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl bg-zinc-800/50 border border-white/10 px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-xs text-[#9f9fa9]">{insight.title}</span>
                      <Badge className={`ml-auto text-[9px] border-0 ${typeColor(insight.type)}`}>{typeLabel(insight.type)}</Badge>
                    </div>
                    <p className="text-neutral-50/90 text-sm leading-relaxed">{insight.content}</p>
                    {insight.citations?.length > 0 && (
                      <p className="font-mono text-primary text-[10px]">
                        "{insight.citations[0].quote?.slice(0, 60)}{insight.citations[0].quote?.length > 60 ? '…' : ''}"
                      </p>
                    )}
                  </div>
                ))}
                {insights[0]?.confidence != null && (
                  <div className="rounded-xl bg-zinc-800/30 border border-white/10 p-4 flex flex-col gap-2 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="text-[#9f9fa9] text-xs">AI Confidence</span>
                      <span className="font-semibold text-primary text-sm">{Math.round((insights[0].confidence ?? 0.9) * 100)}%</span>
                    </div>
                    <div className="rounded-full bg-zinc-800 w-full h-2 overflow-hidden">
                      <div
                        className="bg-[linear-gradient(90deg,oklch(0.646_0.222_41.116),oklch(0.769_0.188_70.08))] shadow-[0_0_10px_oklch(0.646_0.222_41.116)] rounded-full h-full"
                        style={{ width: `${Math.round((insights[0].confidence ?? 0.9) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0">
            <div className="shadow-[0_0_18px_-6px_oklch(0.646_0.222_41.116/.5)] rounded-xl bg-zinc-800/40 border border-orange-500/40 flex px-3 py-2 items-center gap-2 w-full">
              <Input placeholder="Ask Hintro AI about this meeting..." className="bg-transparent shadow-none text-sm border-0 px-0 focus-visible:ring-0 h-auto" />
              <Button size="icon" className="size-8 shrink-0 bg-[linear-gradient(135deg,oklch(0.646_0.222_41.116),oklch(0.769_0.188_70.08))] rounded-lg text-orange-50">
                <SendHorizontal className="size-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Insight mapping */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-primary" />
            <h2 className="font-semibold text-sm">Insight Mapping</h2>
          </div>

          {insightsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-800" />)}
            </div>
          ) : insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center rounded-xl bg-zinc-900/40 border border-white/10">
              <Network className="size-6 text-[#9f9fa9]" />
              <p className="text-[#9f9fa9] text-sm">Insights will appear here after analysis.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {insights.slice(0, 4).map((insight, i) => (
                <Card key={insight._id} className={`backdrop-blur-md bg-zinc-900/60 border-white/10 p-4 gap-2 ${cardOffset[i] ?? ''}`}>
                  <CardHeader className="p-0 flex-row justify-between items-start gap-1">
                    <span className="font-semibold text-sm leading-tight">{insight.title}</span>
                    <Badge className={`text-[10px] border-0 shrink-0 ${typeColor(insight.type)}`}>{typeLabel(insight.type)}</Badge>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <p className="text-[#9f9fa9] text-xs leading-relaxed line-clamp-3">{insight.content}</p>
                    {insight.citations?.length > 0 && (
                      <a className="cursor-pointer font-medium text-primary text-xs flex items-center gap-1">
                        View in Transcript <ArrowUpRight className="size-3" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Connector */}
          {snippets.length > 0 && (
            <div className="flex py-1 justify-center items-center">
              <div className="animate-pulse border-l border-primary/50 border-dashed w-px h-6" />
            </div>
          )}

          {/* Transcript snippets from citations */}
          {snippets.length > 0 && (
            <Card className="backdrop-blur-md bg-zinc-900/60 border-white/10 p-4 gap-3 flex-1">
              <CardHeader className="p-0 flex-row items-center gap-2">
                <FileText className="size-4 text-[#9f9fa9]" />
                <span className="font-semibold text-sm">Transcript Snippets</span>
              </CardHeader>
              <CardContent className="flex p-0 flex-col gap-3">
                {snippets.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="shrink-0 font-medium text-primary text-xs">{s.speaker ?? 'Unknown'}</span>
                    <p className="text-neutral-50/80 text-xs leading-relaxed">
                      <span className="shadow-[0_2px_4px_-2px_oklch(0.646_0.222_41.116)] text-neutral-50 border-b-2 border-primary">
                        {s.quote}
                      </span>
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
