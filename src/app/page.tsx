import ActiveSession from "../components/ActiveSession";
import Leaderboard from "../components/Leaderboard";
import MatchHistory from "../components/MatchHistory";
import StreakBanner from "../components/StreakBanner";
import ToastContainer from "../components/Toast";

export default function Home() {
  return (
    <div className="min-h-dvh bg-mesh safe-top">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-card-elevated border-0 border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-center gap-2.5">
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
              <defs>
                <linearGradient id="ball-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="url(#ball-grad)" />
              <circle cx="16" cy="16" r="5" fill="white" />
              <text
                x="16"
                y="16.5"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="7"
                fontWeight="bold"
                fill="#92400e"
              >
                8
              </text>
              <ellipse cx="11" cy="10" rx="4" ry="2.5" fill="white" opacity="0.35" transform="rotate(-20 11 10)" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-black text-white tracking-tight">
              Pool Tracker
            </h1>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Joe vs. Matisse
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-3 sm:px-4 pt-4 pb-8 space-y-4 safe-bottom">
        <StreakBanner />
        <ActiveSession />
        <Leaderboard />
        <MatchHistory />
      </main>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
