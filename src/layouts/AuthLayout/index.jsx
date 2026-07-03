import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-neutral-50 flex relative overflow-hidden">

      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,oklch(0.646_0.222_41.116/.25),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.769_0.188_70.08/.2),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/.025)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] shrink-0 p-14 relative z-10 border-r border-white/[0.06]">
        <span className="font-bold text-xl tracking-tight">Hintro</span>

        <div className="flex flex-col gap-5">
          <h2 className="font-black text-5xl leading-[1.05] tracking-tight">
            Turn every meeting into
            <br />
            <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-400 bg-clip-text text-transparent">
              actionable intelligence.
            </span>
          </h2>
          <p className="text-[#9f9fa9] text-base leading-relaxed max-w-sm">
            AI-powered transcription, citation-backed insights, and automated action tracking — all in one place.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[['A','#f54900'],['J','#1447e6'],['S','#00bc7d'],['P','#f59e0b']].map(([letter, color]) => (
                <div key={letter} className="size-8 rounded-full border-2 border-[#0D0D0D] flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-[#9f9fa9] text-sm">Trusted by <span className="text-white font-semibold">2,400+</span> teams</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {[
            'AI summary in under 30 seconds',
            'Citation-backed insights, zero hallucinations',
            'Auto-assigns action items to your team',
          ].map((text) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-[#9f9fa9]">
              <span className="text-primary text-xs">✦</span>{text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center mb-10">
            <span className="font-bold text-lg tracking-tight">Hintro</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
