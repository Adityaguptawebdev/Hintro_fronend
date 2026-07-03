import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ChevronRight, Loader2, Mic, MicOff, ScrollText, UserCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/api/interceptors';
import { ENDPOINTS } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth.store';

export default function MeetingRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const roomContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const segmentsRef = useRef([]);
  const startTimeRef = useRef(null);
  const currentSpeakerRef = useRef(user?.name ?? 'You');
  const meetingRef = useRef(null);

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [segments, setSegments] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [listening, setListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(user?.name ?? 'You');

  const transcriptEndRef = useRef(null);

  // Keep ref in sync so recognition callback always uses latest speaker
  useEffect(() => { currentSpeakerRef.current = activeSpeaker; }, [activeSpeaker]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments, interimText]);

  // ── Speech Recognition ─────────────────────────────────────────────────────
  const FATAL_RECOGNITION_ERRORS = ['not-allowed', 'audio-capture', 'service-not-allowed'];

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.fatalError = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => {
      setListening(false);
      // Auto-restart unless we're ending the call or hit a fatal, unrecoverable error
      if (recognitionRef.current && !rec.fatalError) rec.start();
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (!text) continue;
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const seg = { speaker: currentSpeakerRef.current, text, startTime: elapsed };
          segmentsRef.current.push(seg);
          setSegments((prev) => [...prev, seg]);
          setInterimText('');
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim);
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return;
      if (FATAL_RECOGNITION_ERRORS.includes(e.error)) {
        rec.fatalError = true;
        toast.error('Microphone unavailable for transcription — check mic permissions and that no other app is using it.');
        return;
      }
      toast.error(`Transcript error: ${e.error}`);
    };

    recognitionRef.current = rec;
    startTimeRef.current = Date.now();
    rec.start();
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText('');
  }, []);

  // ── Save transcript + analyze ──────────────────────────────────────────────
  const handleCallEnd = useCallback(async () => {
    stopRecognition();

    const allSegments = segmentsRef.current;
    const meetingData = meetingRef.current;
    const isOwner = meetingData?.owner?.toString() === user?._id?.toString();

    // Guests just leave — owner handles transcript saving
    if (!isOwner) {
      toast('You left the meeting', { icon: '👋' });
      navigate('/meetings');
      return;
    }

    if (allSegments.length === 0) {
      toast('No transcript captured', { icon: '📝' });
      // Still mark meeting completed
      await api.patch(ENDPOINTS.MEETINGS.UPDATE(id), { status: 'completed' }).catch(() => {});
      navigate(`/meetings/${id}`);
      return;
    }

    setSaving(true);
    const rawText = allSegments.map((s) => `${s.speaker}: ${s.text}`).join('\n');

    try {
      await api.patch(ENDPOINTS.MEETINGS.UPDATE(id), {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      await api.post(ENDPOINTS.TRANSCRIPTS.CREATE(id), {
        rawText,
        segments: allSegments,
        language: 'en',
      });

      toast.success('Transcript saved! Running AI analysis…');

      api.post(ENDPOINTS.MEETINGS.ANALYZE(id))
        .then(() => toast.success('AI analysis complete'))
        .catch(() => toast.error('AI analysis failed — you can run it from the meeting page'));

      navigate(`/meetings/${id}`);
    } catch (err) {
      toast.error('Failed to save transcript');
      navigate(`/meetings/${id}`);
    } finally {
      setSaving(false);
    }
  }, [id, navigate, stopRecognition, user?._id]);

  // ── Init ZEGOCLOUD ─────────────────────────────────────────────────────────
  useEffect(() => {
    let kit = null;

    const init = async () => {
      try {
        // Fetch room info (works for all participants) + token in parallel
        const [meetingRes, tokenRes] = await Promise.all([
          api.get(ENDPOINTS.MEETINGS.ROOM_INFO(id)),
          api.post(ENDPOINTS.MEETINGS.TOKEN(id)),
        ]);

        const mtg = meetingRes.data.data;
        const { token, appId, roomId, userId, userName } = tokenRes.data.data;

        setMeeting(mtg);
        meetingRef.current = mtg;

        // Seed the active speaker with the current user's name
        const myName = user?.name ?? 'You';
        setActiveSpeaker(myName);
        currentSpeakerRef.current = myName;

        // Only the meeting owner updates status to in_progress
        const isOwner = mtg.owner?.toString() === user?._id?.toString();
        if (isOwner) {
          await api.patch(ENDPOINTS.MEETINGS.UPDATE(id), { status: 'in_progress' }).catch(() => {});
        }

        // Build kit token using production method
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(appId, token, roomId, userId, userName);

        let cameraCheckDone = false;

        kit = ZegoUIKitPrebuilt.create(kitToken);
        kit.joinRoom({
          container: roomContainerRef.current,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 50,
          layout: 'Auto',
          showLayoutButton: true,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          sharedLinks: [
            {
              name: 'Invite link',
              url: `${window.location.origin}/meetings/${id}/room`,
            },
          ],
          // Start speech recognition only once Zego has finished acquiring the
          // mic itself — starting it earlier races Zego for the same device and
          // silently starves recognition of audio.
          onJoinRoom: () => startRecognition(),
          onCameraStateUpdated: (state) => {
            if (!cameraCheckDone) {
              cameraCheckDone = true;
              if (state === 'OFF') {
                toast.error('Camera could not be started — check browser camera permissions and that no other app is using it.');
              }
            }
          },
          onLeaveRoom: handleCallEnd,
        });

        setLoading(false);
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        setLoading(false);
      }
    };

    init();

    return () => {
      stopRecognition();
    };
  }, [id, startRecognition, stopRecognition, handleCallEnd]);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <div className="h-screen w-screen bg-zinc-950 flex overflow-hidden">
      {/* Video area — always in DOM so ref is available when joinRoom is called */}
      <div
        ref={roomContainerRef}
        style={{ flex: 1, height: '100%', width: '100%', position: 'relative' }}
      />

      {/* Transcript panel */}
      {transcriptOpen && (
        <div className="w-80 shrink-0 bg-zinc-900 border-l border-white/[0.07] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <ScrollText className="size-4 text-primary" />
              <span className="text-sm font-semibold">Live Transcript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs ${listening ? 'text-emerald-400' : 'text-[#9f9fa9]'}`}>
                {listening ? <Mic className="size-3 animate-pulse" /> : <MicOff className="size-3" />}
                {listening ? 'Live' : 'Paused'}
              </div>
              <button
                onClick={() => setTranscriptOpen(false)}
                className="size-6 rounded flex items-center justify-center text-[#9f9fa9] hover:text-neutral-50 hover:bg-zinc-800 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Speaker switcher */}
          {meeting && (() => {
            const speakers = [
              user?.name ?? 'You',
              ...(meeting.participants ?? []).map((p) => p.name).filter((n) => n !== user?.name),
            ].filter(Boolean);

            if (speakers.length <= 1) return null;

            return (
              <div className="px-4 py-2.5 border-b border-white/[0.07] flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-[#9f9fa9] uppercase tracking-wider">
                  <UserCheck className="size-3" />Speaking as
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {speakers.map((name) => (
                    <button
                      key={name}
                      onClick={() => setActiveSpeaker(name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        activeSpeaker === name
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-zinc-800 text-[#9f9fa9] border border-white/[0.07] hover:text-neutral-50 hover:bg-zinc-700'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Segments */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {segments.length === 0 && !interimText && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Mic className="size-6 text-[#9f9fa9]" />
                <p className="text-xs text-[#9f9fa9]">Speak to start capturing the transcript</p>
              </div>
            )}
            {segments.map((seg, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary/80 text-[10px]">{formatTime(seg.startTime)}</span>
                  <span className="font-semibold text-xs">{seg.speaker}</span>
                </div>
                <p className="text-[#9f9fa9] text-xs leading-relaxed">{seg.text}</p>
              </div>
            ))}
            {interimText && (
              <div className="flex flex-col gap-1 opacity-50">
                <span className="font-semibold text-xs">{activeSpeaker}</span>
                <p className="text-[#9f9fa9] text-xs leading-relaxed italic">{interimText}</p>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Stats footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.07] flex items-center justify-between">
            <span className="text-[11px] text-[#9f9fa9]">{segments.length} segments</span>
            <span className="text-[11px] text-[#9f9fa9]">
              {segments.reduce((a, s) => a + s.text.split(' ').length, 0)} words
            </span>
          </div>
        </div>
      )}

      {/* Collapsed transcript toggle */}
      {!transcriptOpen && (
        <button
          onClick={() => setTranscriptOpen(true)}
          className="absolute right-4 bottom-24 z-50 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-[#9f9fa9] hover:text-neutral-50 hover:bg-zinc-700 transition-colors shadow-lg"
        >
          <ScrollText className="size-3.5" />
          Transcript ({segments.length})
        </button>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-[#9f9fa9] text-sm">Setting up your meeting room…</p>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="size-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <X className="size-7 text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-neutral-50">Failed to join room</p>
            <p className="text-[#9f9fa9] text-sm mt-1">{error}</p>
            {error.includes('credentials') && (
              <p className="text-xs text-[#9f9fa9] mt-2">
                Add <code className="text-primary">ZEGO_APP_ID</code> and{' '}
                <code className="text-primary">ZEGO_SERVER_SECRET</code> to your <code>.env</code> file.
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/meetings/${id}`)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ChevronRight className="size-4 rotate-180" /> Back to meeting
          </button>
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[200] bg-zinc-950/90 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-neutral-50">Saving transcript…</p>
        </div>
      )}
    </div>
  );
}
