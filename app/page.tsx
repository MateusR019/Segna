import Link from "next/link";

const FEATURES = [
  {
    emoji: "🎯",
    title: "Daily Habits",
    desc: "Build lasting routines with streaks, weekly goals, and detailed progress tracking.",
    color: "#22c55e",
  },
  {
    emoji: "💰",
    title: "Smart Finances",
    desc: "Track income, expenses, and investments. Set budget limits and get visual insights.",
    color: "#6366f1",
  },
  {
    emoji: "✅",
    title: "Task Manager",
    desc: "Organize tasks by priority with recurring schedules and daily completion stats.",
    color: "#f59e0b",
  },
  {
    emoji: "📝",
    title: "Quick Notes",
    desc: "Capture thoughts instantly with tags, image paste, and full-text search.",
    color: "#ec4899",
  },
  {
    emoji: "💪",
    title: "Body Metrics",
    desc: "Log weight, BMI, and custom measurements. Visualize your progress over time.",
    color: "#06b6d4",
  },
  {
    emoji: "🔗",
    title: "DeFi Portfolio",
    desc: "Connect your EVM wallet and monitor liquidity pools and crypto positions.",
    color: "#8b5cf6",
  },
];

const STATS = [
  { value: "6", label: "Modules" },
  { value: "∞", label: "Data stored locally" },
  { value: "0", label: "Subscriptions" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#22c55e] flex items-center justify-center">
            <span className="text-black font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">Segna</span>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#16a34a] transition-colors"
        >
          Open App →
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          All your data stays on your device
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
          Your personal{" "}
          <span className="text-[#22c55e]">productivity OS</span>
        </h1>
        <p className="text-[#9ca3af] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
          Habits, finances, tasks, notes and body metrics — all in one place.
          No cloud, no subscription, no distractions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#22c55e] text-black font-semibold text-base hover:bg-[#16a34a] transition-colors"
          >
            Get started — it&apos;s free
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#9ca3af] font-medium text-base hover:text-white hover:border-[#3a3a3a] transition-colors"
          >
            See features
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-[#6b7280] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything in one app</h2>
          <p className="text-[#6b7280] text-base">Six powerful modules, zero complexity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ emoji, title, desc, color }) => (
            <div
              key={title}
              className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-5 hover:border-[#2a2a2a] transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: color + "18" }}
              >
                {emoji}
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-2xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to take control?</h2>
          <p className="text-[#6b7280] mb-8 text-base max-w-sm mx-auto">
            Start tracking your habits, finances and tasks in seconds. No signup needed.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#22c55e] text-black font-semibold hover:bg-[#16a34a] transition-colors"
          >
            Open Segna
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#22c55e] flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">S</span>
            </div>
            <span className="text-sm text-[#6b7280]">Segna — Personal OS</span>
          </div>
          <p className="text-xs text-[#3a3a3a]">All data stored locally in your browser.</p>
        </div>
      </footer>
    </div>
  );
}
