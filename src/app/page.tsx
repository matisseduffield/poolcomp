import ActiveSession from "../components/ActiveSession";
import Leaderboard from "../components/Leaderboard";
import MatchHistory from "../components/MatchHistory";
import StreakBanner from "../components/StreakBanner";
import ToastContainer from "../components/Toast";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0">
            <circle cx="16" cy="16" r="14" fill="#fde047" />
            <circle cx="16" cy="16" r="5" fill="white" />
            <text
              x="16"
              y="16.5"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7"
              fontWeight="bold"
              fill="#0f172a"
            >
              8
            </text>
          </svg>
          <h1 className="text-xl md:text-2xl font-black text-slate-50 tracking-tight">
            Pool Tracker
          </h1>
          <span className="text-sm text-slate-500 font-medium">
            Joe vs. Matisse
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <StreakBanner />
        <ActiveSession />
        <Leaderboard />
        <MatchHistory />
      </main>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-600">
        Pool Tracker &bull; Joe vs. Matisse
      </footer>
    </div>
  );
}
