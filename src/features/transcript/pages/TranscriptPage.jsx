import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CheckCircle2, FileText, Loader2, Pencil, Sparkles, Trash2, Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getTranscript, saveTranscript, deleteTranscript } from '../services/transcript.service';
import { useAnalyzeAll } from '@/features/ai-insights/hooks/useAI';
import { MEETING_KEYS, useMeeting } from '@/features/meetings/hooks/useMeetings';
import { INSIGHT_KEYS } from '@/features/ai-insights/hooks/useInsights';
import { ACTION_ITEM_KEYS } from '@/features/action-items/hooks/useActionItems';
import { formatDateTime } from '@/utils/date.utils';

// ── Auto-parser ──────────────────────────────────────────────────────────────
// Handles two formats:
//   1) "Speaker: line of text"
//   2) "[00:01:23] Speaker: line of text"
//   3) "00:01:23 Speaker: line of text"
// Falls back to returning rawText only when no pattern is detected.

const SPEAKER_RE = /^(?:\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+)?([^:\n]{1,40}):\s+(.+)$/;

const parseIntoSegments = (raw) => {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const segments = [];
  let hasPattern = false;

  for (const line of lines) {
    const m = line.match(SPEAKER_RE);
    if (m) {
      hasPattern = true;
      const [, timestamp, speaker, text] = m;
      let startTime;
      if (timestamp) {
        const parts = timestamp.split(':').map(Number);
        startTime = parts.length === 3
          ? parts[0] * 3600 + parts[1] * 60 + parts[2]
          : parts[0] * 60 + parts[1];
      }
      segments.push({ speaker: speaker.trim(), text: text.trim(), startTime });
    }
  }

  return hasPattern ? segments : [];
};

const PLACEHOLDER = `Paste your transcript here. Supported formats:

Speaker Name: Their words go here
Alex: We need to finalize the roadmap before Friday.
Jordan: Agreed, I'll send the draft by Thursday.

Or with timestamps:
[00:01:23] Alex: We need to finalize the roadmap before Friday.
[00:02:10] Jordan: Agreed, I'll send the draft by Thursday.`;

// ── Component ────────────────────────────────────────────────────────────────

export default function TranscriptPage() {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: meeting } = useMeeting(meetingId);

  const { data: transcript, isLoading } = useQuery({
    queryKey: ['transcript', meetingId],
    queryFn: () => getTranscript(meetingId),
    enabled: !!meetingId,
    // 404 just means no transcript yet — don't treat as error
    retry: (count, err) => err?.response?.status !== 404 && count < 2,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (data) => saveTranscript(meetingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transcript', meetingId] });
      qc.invalidateQueries({ queryKey: MEETING_KEYS.detail(meetingId) });
      toast.success('Transcript saved');
      setEditing(false);
      setRawInput('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save transcript'),
  });

  const { mutate: runAnalysis, isPending: analyzing } = useAnalyzeAll(meetingId);

  const { mutate: doDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteTranscript(meetingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transcript', meetingId] });
      qc.invalidateQueries({ queryKey: MEETING_KEYS.detail(meetingId) });
      setConfirmDelete(false);
      toast.success('Transcript deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete transcript'),
  });

  const handleSave = () => {
    const text = rawInput.trim();
    if (!text) { toast.error('Paste some transcript text first'); return; }
    const segments = parseIntoSegments(text);
    save({ rawText: text, segments });
  };

  const handleAnalyse = () => {
    runAnalysis({}, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: INSIGHT_KEYS.summary(meetingId) });
        qc.invalidateQueries({ queryKey: INSIGHT_KEYS.insights(meetingId) });
        qc.invalidateQueries({ queryKey: ACTION_ITEM_KEYS.lists() });
        qc.invalidateQueries({ queryKey: MEETING_KEYS.detail(meetingId) });
        toast.success('Analysis complete — view insights on the meeting page');
      },
    });
  };

  const showUploadForm = !isLoading && (!transcript || editing);

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-6 min-h-screen">

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/meetings/${meetingId}`)}
            className="size-9 flex items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-[#9f9fa9] hover:text-neutral-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-50 flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Transcript
            </h1>
            {meeting?.title && <p className="text-xs text-[#9f9fa9] mt-0.5">{meeting.title}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transcript && !editing && (
            <>
              <Badge className="bg-emerald-500/15 text-emerald-400 gap-1.5 px-3 py-1">
                <CheckCircle2 className="size-3" />
                {transcript.wordCount?.toLocaleString()} words
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-[#9f9fa9] hover:text-neutral-50 gap-1.5"
                onClick={() => { setRawInput(transcript.rawText ?? ''); setEditing(true); }}
              >
                <Pencil className="size-3.5" />Replace
              </Button>

              {/* Delete — two-click confirmation */}
              {confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-red-400">Delete?</span>
                  <Button
                    size="sm"
                    disabled={deleting}
                    onClick={() => doDelete()}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-0 gap-1.5 h-8 px-3"
                  >
                    {deleting ? <Loader2 className="size-3.5 animate-spin" /> : 'Yes, delete'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#9f9fa9] h-8 px-3"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-3.5" />Delete
                </Button>
              )}

              <Button
                size="sm"
                disabled={analyzing}
                onClick={handleAnalyse}
                className="bg-gradient-to-r from-primary to-[oklch(0.769_0.188_70.08)] text-orange-50 gap-1.5 shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.35)]"
              >
                {analyzing
                  ? <><Loader2 className="size-3.5 animate-spin" />Analysing…</>
                  : <><Sparkles className="size-3.5" />Run AI Analysis</>
                }
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upload / Edit form */}
      {showUploadForm && (
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-neutral-50">
                {transcript ? 'Replace transcript' : 'Upload transcript'}
              </p>
              <p className="text-xs text-[#9f9fa9]">
                Paste your meeting transcript below. Speaker lines are auto-detected and converted to timestamped segments.
              </p>
            </div>

            {/* Format hint */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 flex flex-col gap-1">
              <p className="text-xs font-semibold text-primary">Supported formats</p>
              <div className="text-[11px] text-[#9f9fa9] space-y-0.5">
                <p><span className="text-neutral-50">Speaker:</span> Their words here</p>
                <p><span className="text-neutral-50">[00:01:23] Speaker:</span> Their words here</p>
                <p className="text-[#9f9fa9]/60">Plain text also accepted (no segment parsing)</p>
              </div>
            </div>

            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={16}
              className="w-full rounded-xl bg-zinc-800 border border-white/10 focus:border-primary/50 focus:outline-none px-4 py-3 text-sm text-neutral-50 placeholder:text-[#9f9fa9]/40 leading-relaxed resize-none font-mono transition-colors [color-scheme:dark]"
            />

            {rawInput.trim() && (
              <div className="flex items-center gap-2 text-xs text-[#9f9fa9]">
                <span>{rawInput.trim().split(/\s+/).length.toLocaleString()} words</span>
                <span>·</span>
                <span>{parseIntoSegments(rawInput).length} speaker segments detected</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
              {editing && (
                <Button variant="ghost" size="sm" className="text-[#9f9fa9]" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                disabled={saving || !rawInput.trim()}
                onClick={handleSave}
                className="bg-gradient-to-r from-primary to-[oklch(0.769_0.188_70.08)] text-orange-50 gap-1.5 px-5 disabled:opacity-50"
              >
                {saving
                  ? <><Loader2 className="size-3.5 animate-spin" />Saving…</>
                  : <><Upload className="size-3.5" />Save Transcript</>
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="h-96 animate-pulse rounded-xl bg-zinc-800" />
      )}

      {/* Transcript viewer */}
      {!isLoading && transcript && !editing && (
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-0">
            {/* Meta bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-3 text-xs text-[#9f9fa9]">
                <span>{transcript.wordCount?.toLocaleString()} words</span>
                {transcript.segments?.length > 0 && (
                  <><span>·</span><span>{transcript.segments.length} segments</span></>
                )}
                {transcript.processedAt && (
                  <><span>·</span><span>Saved {formatDateTime(transcript.processedAt)}</span></>
                )}
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 text-[10px]">Processed</Badge>
            </div>

            {/* Segments */}
            {transcript.segments?.length > 0 ? (
              <div className="p-5 flex flex-col gap-5">
                {transcript.segments.map((seg, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-20 shrink-0 text-right">
                      <span className="text-xs font-bold text-primary">{seg.speaker}</span>
                      {seg.startTime != null && (
                        <p className="text-[10px] text-[#9f9fa9] font-mono mt-0.5">
                          {String(Math.floor(seg.startTime / 60)).padStart(2, '0')}:{String(Math.floor(seg.startTime % 60)).padStart(2, '0')}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 border-l border-white/10 pl-4">
                      <p className="text-sm text-[#9f9fa9] leading-relaxed">{seg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-5 font-mono text-sm text-[#9f9fa9] leading-relaxed whitespace-pre-wrap">{transcript.rawText}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* After upload — prompt to run analysis */}
      {!isLoading && transcript && !editing && !meeting?.hasInsights && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-50">Transcript saved — ready for AI analysis</p>
            <p className="text-xs text-[#9f9fa9] mt-0.5">Generate a summary, extract action items, and identify key decisions.</p>
          </div>
          <Button
            size="sm"
            disabled={analyzing}
            onClick={handleAnalyse}
            className="bg-gradient-to-r from-primary to-[oklch(0.769_0.188_70.08)] text-orange-50 gap-1.5 shrink-0 shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.35)]"
          >
            {analyzing
              ? <><Loader2 className="size-3.5 animate-spin" />Analysing…</>
              : <><Sparkles className="size-3.5" />Run AI Analysis</>
            }
          </Button>
        </div>
      )}

    </div>
  );
}
