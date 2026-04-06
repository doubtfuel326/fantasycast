"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

const FORMATS = [
  {
    id: "sportscenter",
    icon: "📺",
    label: "SportsCenter",
    color: "#00C853",
    bg: "rgba(0,200,83,0.1)",
    line: "Anchor-led highlights, score tickers, Top Plays of the week.",
  },
  {
    id: "debate",
    icon: "🔥",
    label: "Debate Show",
    color: "#E74C3C",
    bg: "rgba(231,76,60,0.1)",
    line: "Two hosts, zero agreement. Hot takes, trade grades, who choked.",
  },
  {
    id: "podcast",
    icon: "🎧",
    label: "Podcast",
    color: "#9B59B6",
    bg: "rgba(155,89,182,0.1)",
    line: "Long-form roundtable. Stats, stories, league lore, deep dives.",
  },
];

const STORY_TYPES = [
  { icon: "🏈", label: "Draft Recap", tag: "Day of draft", color: "#00C853" },
  { icon: "📊", label: "Weekly Recap", tag: "Every week", color: "#27AE60" },
  { icon: "🏟", label: "Preseason", tag: "Before season", color: "#F39C12" },
  { icon: "🏆", label: "Playoffs", tag: "Postseason", color: "#E74C3C" },
  { icon: "👑", label: "Legacy", tag: "All-time", color: "#9B59B6" },
  { icon: "💬", label: "Offseason", tag: "Between seasons", color: "#1ABC9C" },
];

const TICKER_ITEMS = [
  "🔥 Zara Banks: That trade was highway robbery and everyone knows it",
  "📊 Marcus Cole: Week 9 produced the highest-scoring week in league history",
  "⚡ BREAKING: Team Chaos wins by 0.4 points for third consecutive week",
  "🏆 Marcus: The gap at the top of the standings is officially a crisis",
  "😤 Zara: I said it Week 1 — this manager cannot be trusted in the playoffs",
];

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [activeFormat, setActiveFormat] = useState("sportscenter");
  const [sleeperPreview, setSleeperPreview] = useState("");

  return (
    <div className="min-h-screen bg-[#080808] overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-2xl tracking-wider text-white">
            LEAGUE<span className="text-[#00C853]">WIRE</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-white/50 hover:text-white text-sm transition-colors">
              Pricing
            </Link>
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-primary py-2 px-4 text-xs">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-white/50 hover:text-white text-sm transition-colors">
                  Sign in
                </Link>
                <Link href="/sign-up" className="btn-primary py-2 px-4 text-xs">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00C853]/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass-green rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            <span className="text-xs text-green-300 font-medium">AI-Generated Weekly Episodes</span>
          </div>

          <h1 className="font-display text-[clamp(3.5rem,10vw,7rem)] leading-none tracking-wide mb-6">
            YOUR LEAGUE.<br />
            <span className="text-[#00C853]">YOUR SHOW.</span>
          </h1>

          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Connect your fantasy league. Get a weekly AI-generated broadcast
            with two hosts covering every score, trade, and storyline — in
            SportsCenter, Debate, or Podcast style.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="btn-primary text-base px-8 py-3.5">
              Connect Your League →
            </Link>
            <Link href="/pricing" className="btn-ghost text-base px-8 py-3.5">
              View Pricing
            </Link>
          </div>

          <p className="text-white/25 text-xs mt-4">
            Starts at $9/mo · Works with Sleeper, ESPN, Yahoo
          </p>
        </div>

        {/* Ticker */}
        <div className="relative max-w-4xl mx-auto mt-16 overflow-hidden">
          <div className="glass rounded-xl p-0 overflow-hidden">
            <div className="bg-[#00C853] px-4 py-1.5 inline-flex items-center gap-2">
              <span className="font-display text-sm tracking-widest">BREAKING</span>
            </div>
            <div className="overflow-hidden">
              <div className="flex gap-8 px-4 py-3 whitespace-nowrap animate-[ticker_25s_linear_infinite]"
                style={{ animation: "ticker 25s linear infinite" }}>
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                  <span key={i} className="text-sm text-white/60 flex-shrink-0">
                    {item} <span className="text-white/20 mx-4">·</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes ticker {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Format Selector */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-3">Show Formats</p>
            <h2 className="font-display text-5xl tracking-wide">PICK YOUR BROADCAST</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 max-sm:grid-cols-1">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFormat(f.id)}
                className={`p-5 rounded-xl text-left transition-all duration-200 border ${
                  activeFormat === f.id
                    ? "border-[#00C853] bg-[#00C853]/10"
                    : "border-white/8 glass hover:border-white/15"
                }`}
              >
                <span className="text-3xl block mb-3">{f.icon}</span>
                <h3 className="font-display text-xl tracking-wider mb-1" style={{ color: activeFormat === f.id ? f.color : "white" }}>
                  {f.label.toUpperCase()}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed">{f.line}</p>
              </button>
            ))}
          </div>

          {/* Fake broadcast preview */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="bg-[#111111] px-5 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="font-display text-sm tracking-widest text-[#00C853]">
                {activeFormat === "sportscenter" ? "WEEK 9 · SPORTSCENTER EDITION" :
                 activeFormat === "debate" ? "WEEK 9 · HOT TAKE HOUR" : "WEEK 9 · THE BREAKDOWN POD"}
              </span>
              <span className="text-white/20 text-xs">AI Generated · 4 min</span>
            </div>
            <div className="p-6 space-y-4">
              {activeFormat === "sportscenter" && (
                <>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a2744] border border-[#00C853]/30 flex items-center justify-center text-xs font-medium text-[#00C853] flex-shrink-0">MC</div>
                    <div className="glass rounded-lg rounded-tl-none p-3 flex-1">
                      <span className="text-[#00C853] text-xs font-medium block mb-1">Marcus Cole · Anchor</span>
                      <p className="text-white/80 text-sm leading-relaxed">Good evening. We have a historic night in the books — Kyle's 218-point week was the second-highest single-week score in this league's history. The catch? He still lost. His opponent dropped 231. Let's get into it.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="glass rounded-lg rounded-tr-none p-3 flex-1">
                      <span className="text-purple-400 text-xs font-medium block mb-1">Tanner Cross · Analyst</span>
                      <p className="text-white/80 text-sm leading-relaxed">Classic Kyle energy. Statistically elite. Cosmically cursed. If there's a 1% chance you can lose with 218 points, Kyle will find it every single time.</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#2a1a3e] border border-purple-500/30 flex items-center justify-center text-xs font-medium text-purple-400 flex-shrink-0">ZB</div>
                  </div>
                </>
              )}
              {activeFormat === "debate" && (
                <>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a2744] border border-[#00C853]/30 flex items-center justify-center text-xs font-medium text-[#00C853] flex-shrink-0">MC</div>
                    <div className="glass rounded-lg rounded-tl-none p-3 flex-1">
                      <span className="text-[#00C853] text-xs font-medium block mb-1">Marcus Cole</span>
                      <p className="text-white/80 text-sm leading-relaxed">I'm going to be fair here. The trade of Williams for two bench players was aggressive, but you have to respect the process—</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="glass rounded-lg rounded-tr-none p-3 flex-1">
                      <span className="text-red-400 text-xs font-medium block mb-1">Tanner Cross</span>
                      <p className="text-white/80 text-sm leading-relaxed">NO. Absolutely not. I will not sit here and call that a process. That was a panic trade by someone who watched one bad week and completely fell apart. We are not sugarcoating this.</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#2a1a1e] border border-red-500/30 flex items-center justify-center text-xs font-medium text-red-400 flex-shrink-0">ZB</div>
                  </div>
                </>
              )}
              {activeFormat === "podcast" && (
                <>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a2744] border border-[#00C853]/30 flex items-center justify-center text-xs font-medium text-[#00C853] flex-shrink-0">MC</div>
                    <div className="glass rounded-lg rounded-tl-none p-3 flex-1">
                      <span className="text-[#00C853] text-xs font-medium block mb-1">Marcus Cole</span>
                      <p className="text-white/80 text-sm leading-relaxed">Alright so let's just... sit with what happened this week for a second. Because I pulled the numbers and Team Chaos's strength of schedule is historically brutal. Like, they would be 7-2 in literally any other bracket.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="glass rounded-lg rounded-tr-none p-3 flex-1">
                      <span className="text-purple-400 text-xs font-medium block mb-1">Tanner Cross</span>
                      <p className="text-white/80 text-sm leading-relaxed">Right, and that's the conversation we never have. Schedule luck is real and it's ruining this league's narrative. The best team might not make the playoffs and nobody's talking about it. We should change the format next year honestly.</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#2a1a3e] border border-purple-500/30 flex items-center justify-center text-xs font-medium text-purple-400 flex-shrink-0">ZB</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Episode Types */}
      <section className="py-20 px-6 bg-[#111111]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-3">Coverage</p>
            <h2 className="font-display text-5xl tracking-wide">EVERY STORYLINE</h2>
            <p className="text-white/40 text-sm mt-3">From the first pick to the final whistle — and everything in between</p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2">
            {STORY_TYPES.map((s) => (
              <div key={s.label} className="glass rounded-xl p-5 hover:border-white/15 border border-white/5 transition-colors">
                <span className="text-2xl block mb-3">{s.icon}</span>
                <h3 className="font-medium text-sm mb-1">{s.label}</h3>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 font-medium"
                  style={{ background: s.color + "22", color: s.color }}>
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect League CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-5xl tracking-wide mb-4">
            CONNECT YOUR <span className="text-[#00C853]">SLEEPER</span> LEAGUE
          </h2>
          <p className="text-white/40 text-sm mb-8">Paste your Sleeper league ID to preview your league's data instantly — no account needed.</p>
          <div className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Sleeper League ID (e.g. 784123456789)"
              value={sleeperPreview}
              onChange={(e) => setSleeperPreview(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#00C853]/50"
            />
            <Link
              href={sleeperPreview ? `/onboarding?leagueId=${sleeperPreview}&platform=sleeper` : "/sign-up"}
              className="btn-primary whitespace-nowrap"
            >
              Preview →
            </Link>
          </div>
          <p className="text-white/20 text-xs mt-4">
            Find your league ID in the Sleeper app under League Settings
          </p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div>
            <p className="font-display text-2xl tracking-wide">READY TO GO LIVE?</p>
            <p className="text-white/40 text-sm mt-1">Starts at $9/mo per league. Cancel anytime.</p>
          </div>
          <Link href="/pricing" className="btn-primary">
            See Pricing Plans →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="font-display text-xl tracking-wider text-white/30">
            LEAGUE<span className="text-[#00C853]/50">WIRE</span>
          </span>
          <p className="text-white/20 text-xs">
            © 2025 LeagueWire · Not affiliated with ESPN, Yahoo, Sleeper, or the NFL
          </p>
        </div>
      </footer>
    </div>
  );
}
