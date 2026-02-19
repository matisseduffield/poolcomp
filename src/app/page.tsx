import ActiveSession from "../components/ActiveSession";
import Leaderboard from "../components/Leaderboard";
import MatchHistory from "../components/MatchHistory";
import StreakBanner from "../components/StreakBanner";
import LastSessionBanner from "../components/LastSessionBanner";
import ToastContainer from "../components/Toast";
import AmbientBackground from "../components/AmbientBackground";

export default function Home() {
  return (
    <div className="min-h-dvh safe-top relative overflow-x-hidden">
      {/* Ambient animated background */}
      <AmbientBackground />

      {/* Header */}
      <header className="sticky top-0 z-30 glass-elevated relative header-glow">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 8-ball icon */}
            <div className="relative animate-float" style={{ animationDuration: "5s" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <defs>
                  <linearGradient id="ball-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <radialGradient id="ball-shine" cx="0.35" cy="0.3" r="0.6">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="url(#ball-grad)" />
                <circle cx="16" cy="16" r="14" fill="url(#ball-shine)" />
                <circle cx="16" cy="16" r="5.5" fill="white" />
                <text x="16" y="16.8" textAnchor="middle" dominantBaseline="central" fontSize="7.5" fontWeight="900" fill="#92400e">8</text>
              </svg>
            </div>
            <div className="flex flex-col items-start -space-y-0.5">
              <h1 className="text-lg font-black tracking-tight text-gradient-gold">
                Pool Tracker
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-[0.15em]">
                Joe vs Matisse
              </span>
            </div>
          </div>

          {/* Kelly Pool link */}
          <a
            href="/kelly"
            className="h-9 px-3.5 rounded-full glass flex items-center gap-2
                       text-xs font-bold text-slate-400 hover:text-amber-400
                       transition-all duration-200 hover-lift cursor-pointer"
          >
            <span className="text-sm">🎱</span>
            Kelly
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto px-3 sm:px-4 pt-5 pb-10 safe-bottom">
        <div className="space-y-5">
          <StreakBanner />
          <LastSessionBanner />
          <ActiveSession />
          <Leaderboard />
          <MatchHistory />
        </div>
      </main>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
