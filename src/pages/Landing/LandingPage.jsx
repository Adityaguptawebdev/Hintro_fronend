import { Navigate, useNavigate } from 'react-router-dom';
import {
  Brain, CalendarCheck, CheckCircle2,
  Play, Radio, Rocket, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="bg-[#0D0D0D] text-neutral-50 min-h-screen w-full overflow-x-hidden relative">

      {/* ── Warm radial gradient background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main warm glow from bottom-center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.646_0.222_41.116/.55)_0%,oklch(0.646_0.222_41.116/.15)_50%,transparent_75%)] blur-[1px]" />
        {/* Amber tint bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.769_0.188_70.08/.3),transparent_65%)]" />
        {/* Faint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5">
        <span className="font-bold text-lg sm:text-xl tracking-tight">Hintro</span>

        <div className="hidden md:flex items-center gap-10">
          {['Product', 'Pricing', 'Docs', 'Blog'].map((item) => (
            <a key={item} className="text-[#9f9fa9] text-sm hover:text-white transition-colors cursor-pointer">{item}</a>
          ))}
        </div>

        <button
          onClick={() => navigate('/register')}
          className="bg-gradient-to-r from-amber-400/80 to-orange-600/80 text-white font-semibold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.3)] hover:shadow-[0_0_16px_oklch(0.646_0.222_41.116/0.4)] transition-all active:scale-95 whitespace-nowrap"
        >
          Get Early Access
        </button>
      </nav>

      {/* ── Body ── */}
      <div className="relative z-10 flex min-h-[calc(100vh-73px)]">

        {/* ── Main hero ── */}
        <main className="flex flex-col items-center flex-1 pt-10 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6">

          {/* Badge */}
          <div className="flex items-center gap-2 bg-white/[0.07] border border-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 text-center">
            <Sparkles className="size-3.5 text-primary shrink-0" />
            <span className="text-primary font-medium text-[11px] sm:text-xs">AI-Powered Meeting Intelligence</span>
          </div>

          {/* Hero headline */}
          <h1 className="font-black text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] sm:leading-[1.0] tracking-tight mb-5 sm:mb-6 max-w-3xl">
            Turn Every Meeting
            <br />Into Actionable
            <br />
            <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Intelligence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-center text-[#9f9fa9] text-base sm:text-lg leading-relaxed max-w-lg mb-8 sm:mb-10">
            Hintro transcribes, summarizes, and extracts decisions and action items
            from your meetings — automatically.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-16 w-full max-w-xs sm:w-auto sm:max-w-none">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400/80 to-orange-600/80 text-white font-semibold px-7 py-3.5 rounded-full shadow-[0_0_12px_oklch(0.646_0.222_41.116/0.3)] hover:shadow-[0_0_16px_oklch(0.646_0.222_41.116/0.4)] transition-all active:scale-95 text-sm"
            >
              <Rocket className="size-4" />
              Start for Free
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/10 text-white border border-white/10 font-semibold px-7 py-3.5 rounded-full transition-all active:scale-95 text-sm">
              <Play className="size-4" />
              Watch Demo
            </button>
          </div>

          {/* ── Transcript card + floating badges ── */}
          <div className="relative w-full max-w-xl mt-6 sm:mt-0">

            {/* Floating badge — top left */}
            <div className="hidden sm:block absolute -left-4 lg:-left-16 -top-10 rotate-[-5deg] z-10">
              <div className="flex items-center gap-2.5 bg-[#1a1008]/90 border-l-2 border-l-primary border border-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] whitespace-nowrap">
                <Brain className="size-5 text-primary shrink-0" />
                <span className="font-medium text-sm text-white">AI Summary Ready</span>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div className="hidden sm:block absolute -right-4 lg:-right-16 -top-8 rotate-[5deg] z-10">
              <div className="flex items-center gap-2.5 bg-[#1a1008]/90 border-l-2 border-l-[oklch(0.769_0.188_70.08)] border border-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] whitespace-nowrap">
                <CheckCircle2 className="size-5 text-[oklch(0.769_0.188_70.08)] shrink-0" />
                <span className="font-medium text-sm text-white">4 Action Items Extracted</span>
              </div>
            </div>

            {/* Mobile-only compact badge row */}
            <div className="flex sm:hidden items-center justify-center gap-2 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#1a1008]/90 border-l-2 border-l-primary border border-white/10 rounded-lg px-2.5 py-1.5">
                <Brain className="size-3.5 text-primary shrink-0" />
                <span className="font-medium text-[11px] text-white">AI Summary Ready</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1a1008]/90 border-l-2 border-l-[oklch(0.769_0.188_70.08)] border border-white/10 rounded-lg px-2.5 py-1.5">
                <CheckCircle2 className="size-3.5 text-[oklch(0.769_0.188_70.08)] shrink-0" />
                <span className="font-medium text-[11px] text-white">4 Actions Extracted</span>
              </div>
            </div>

            {/* Transcript card */}
            <div className="bg-[oklch(0.18_0.006_285.885/.7)] backdrop-blur-xl border border-white/[0.09] rounded-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {/* Window chrome */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff6467]" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.769_0.188_70.08)]" />
                </div>
                <div className="flex items-center gap-1.5 text-[#9f9fa9] text-xs">
                  <Radio className="size-3.5 text-[#ff6467]" />
                  Live Transcript
                </div>
              </div>

              {/* Transcript lines */}
              <div className="flex flex-col gap-3.5">
                {[
                  { speaker: 'Alex', time: '00:12', text: "Let's finalize the Q3 roadmap and assign owners today.", highlight: false, dim: false },
                  { speaker: 'Jordan', time: '00:34', text: "I'll handle the onboarding flow redesign by Friday.", highlight: true, dim: false },
                  { speaker: 'Sam', time: '00:58', text: "Great — I'll sync with marketing on the launch timeline.", highlight: false, dim: false },
                  { speaker: 'Alex', time: '01:20', text: "Perfect. Let's schedule a follow-up for next week.", highlight: false, dim: true },
                ].map(({ speaker, time, text, highlight, dim }) => (
                  <div key={time} className={`flex gap-3 ${dim ? 'opacity-40' : ''}`}>
                    <span className="shrink-0 font-bold text-primary text-sm w-14">{speaker}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#9f9fa9] text-[11px]">{time}</span>
                      <span className={`text-sm leading-snug ${highlight ? 'bg-primary/25 shadow-[0_0_14px_oklch(0.646_0.222_41.116/.35)] rounded-md px-2 py-0.5 text-white' : 'text-neutral-200'}`}>
                        {text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge — bottom right */}
            <div className="hidden sm:block absolute -right-4 lg:-right-10 -bottom-10 rotate-[-4deg] z-10">
              <div className="flex items-center gap-2.5 bg-[#1a1008]/90 border-l-2 border-l-primary border border-white/10 backdrop-blur-xl rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] whitespace-nowrap">
                <CalendarCheck className="size-5 text-primary shrink-0" />
                <span className="font-medium text-sm text-white">Follow-up Scheduled — Friday 3PM</span>
              </div>
            </div>

            {/* Mobile-only bottom badge */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-4 bg-[#1a1008]/90 border-l-2 border-l-primary border border-white/10 rounded-lg px-2.5 py-1.5 w-fit mx-auto">
              <CalendarCheck className="size-3.5 text-primary shrink-0" />
              <span className="font-medium text-[11px] text-white">Follow-up Scheduled — Fri 3PM</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
