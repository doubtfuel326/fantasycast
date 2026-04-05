"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

const FORMAT_LABELS: Record<string, string> = {
  sportscenter: "SportsCenter",
  debate: "Debate Show",
  podcast: "Podcast",
};

const TYPE_LABELS: Record<string, string> = {
  weekly_recap: "Weekly Recap",
  draft_recap: "Draft Recap",
  preseason: "Preseason",
  playoff: "Playoffs",
  legacy: "Legacy",
  offseason: "Offseason",
};

const TYPE_COLORS: Record<string, string> = {
  weekly_recap: "#27AE60",
  draft_recap: "#378ADD",
  preseason: "#F39C12",
  playoff: "#E74C3C",
  legacy: "#9B59B6",
  offseason: "#1ABC9C",
};

export default function DashboardPage() {
  const { user } = useUser();
  const [generating, setGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"sportscenter" | "debate" | "podcast">("sportscenter");
  const [selectedType, setSelectedType] = useState<string>("weekly_recap");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedEpisode, setGeneratedEpisode] = useState<any>(null);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [loadingLeague, setLoadingLeague] = useState(false);
  const [leagueError, setLeagueError] = useState("");
  const [leagueIdInput, setLeagueIdInput] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("fantasycast_league");
    if (saved) {
      try { setLeagueData(JSON.parse(saved)); } catch {}
    }
    const savedEpisodes = localStorage.getItem("fantasycast_episodes");
    if (savedEpisodes) {
      try { setEpisodes(JSON.parse(savedEpisodes)); } catch {}
    }
  }, []);

  async function connectLeague() {
    if (!leagueIdInput.trim()) return;
    setLoadingLeague(true);
    setLeagueError("");
    try {
      const res = await fetch(`/api/league-preview?leagueId=${leagueIdInput.trim()}&platform=sleeper`);
      if (!res.ok) throw new Error("League not found. Check your league ID.");
      const data = await res.json();
      setLeagueData(data);
      localStorage.setItem("fantasycast_league", JSON.stringify(data));
      localStorage.setItem("fantasycast_leagueId", leagueIdInput.trim());
      setShowConnectModal(false);
    } catch (e: any) {
      setLeagueError(e.message);
    } finally {
      setLoadingLeague(false);
    }
  }

  async function generateEpisode() {
    setGenerating(true);
    try {
      const savedLeagueId = localStorage.getItem("fantasycast_leagueId") || "demo_league";
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId: savedLeagueId, platform: "sleeper", format: selectedFormat, episodeType: selectedType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedEpisode(data);
      setShowGenerateModal(false);
      const newEp = { id: data.id, week: data.week, episodeType: data.episodeType, format: data.format, title: data.title, teaser: data.teaser, generatedAt: data.generatedAt, plays: 0, script: data.script };
      const updated = [newEp, ...episodes];
      setEpisodes(updated);
      localStorage.setItem("fantasycast_episodes", JSON.stringify(updated));
      localStorage.setItem(`fantasycast_episode_${data.id}`, JSON.stringify(data));
    } catch (e: any) {
      alert(`Generation failed: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  }

  const league = leagueData?.league;
  const standings = leagueData?.standings || [];

  return (
    <div className="min-h-screen bg-[#060b18]">
      <div className="fixed left-0 top-0 bottom-0 w-56 border-r border-white/5 bg-[#0a0f1e] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-xl tracking-wider">FANTASY<span className="text-[#378ADD]">CAST</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{ label: "Episodes", href: "/dashboard", icon: "▶" }, { label: "Standings", href: "/dashboard/standings", icon: "📊" }, { label: "Settings", href: "/dashboard/settings", icon: "⚙" }].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm">
              <span className="text-xs">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="glass rounded-lg p-3 mb-3">
            <p className="text-xs text-white/30 mb-1">Plan</p>
            <p className="text-sm font-medium text-[#378ADD]">Starter</p>
            <p className="text-xs text-white/30 mt-0.5">1 episode/week</p>
          </div>
          <Link href="/pricing" className="text-xs text-white/30 hover:text-[#378ADD] transition-colors block text-center">Upgrade plan →</Link>
        </div>
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{user?.fullName || "Manager"}</p>
          </div>
        </div>
      </div>

      <div className="ml-56 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            {league ? (
              <>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Week {leagueData?.currentWeek} · {league.season}</p>
                <h1 className="font-display text-4xl tracking-wide">{league.leagueName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-white/40 text-sm">{league.totalTeams} teams · {league.scoringType}</p>
                  <button onClick={() => setShowConnectModal(true)} className="text-xs text-[#378ADD] hover:underline">Switch league</button>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl tracking-wide">DASHBOARD</h1>
                <button onClick={() => setShowConnectModal(true)} className="text-sm text-[#378ADD] mt-2 hover:underline">+ Connect your Sleeper league</button>
              </>
            )}
          </div>
          <button onClick={() => setShowGenerateModal(true)} className="btn-primary flex items-center gap-2">
            <span>⚡</span> Generate Episode
          </button>
        </div>

        {generatedEpisode && (
          <div className="glass-blue rounded-2xl p-6 mb-8 border border-[#378ADD]/20">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
              <span className="text-green-400 text-xs font-medium">New episode generated</span>
            </div>
            <h2 className="font-display text-2xl tracking-wide mb-1">{generatedEpisode.title}</h2>
            <p className="text-white/50 text-sm mb-4">{generatedEpisode.teaser}</p>
            <Link href={`/episode/${generatedEpisode.id}`} className="btn-primary inline-block">Listen to Full Episode →</Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-white/60">EPISODE ARCHIVE</h2>
            {episodes.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-white/30 text-sm mb-3">No episodes yet</p>
                <button onClick={() => setShowGenerateModal(true)} className="btn-primary text-sm">Generate your first episode ⚡</button>
              </div>
            ) : (
              episodes.map((ep) => (
                <Link key={ep.id} href={`/episode/${ep.id}`} className="episode-card glass rounded-xl p-5 flex items-start gap-4 border border-white/5 hover:border-white/15 block">
                  <div className="w-12 h-12 rounded-xl bg-[#378ADD]/10 border border-[#378ADD]/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[12px] border-l-[#378ADD] ml-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] rounded-full px-2.5 py-0.5 font-medium" style={{ background: TYPE_COLORS[ep.episodeType] + "22", color: TYPE_COLORS[ep.episodeType] }}>{TYPE_LABELS[ep.episodeType]}</span>
                      <span className="text-[10px] text-white/25 rounded-full px-2 py-0.5 border border-white/10">{FORMAT_LABELS[ep.format]}</span>
                      {ep.week > 0 && <span className="text-[10px] text-white/25">Week {ep.week}</span>}
                    </div>
                    <h3 className="font-medium text-sm mb-1 truncate">{ep.title}</h3>
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{ep.teaser}</p>
                    <span className="text-[10px] text-white/20 mt-2 block">{new Date(ep.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wide text-white/60">STANDINGS</h2>
            <div className="glass rounded-xl p-4 space-y-2">
              {standings.length === 0 ? (
                <p className="text-white/30 text-xs text-center py-4">Connect your league to see standings</p>
              ) : (
                standings.slice(0, 8).map((team: any) => (
                  <div key={team.rank} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs text-white/20 w-4 text-right">{team.rank}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{team.teamName}</p>
                      <p className="text-[10px] text-white/30">{team.managerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">{team.wins}-{team.losses}</p>
                      <p className="text-[10px] text-white/25">{team.pointsFor?.toFixed(0)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-white/30 mb-3">Quick Generate</p>
              <div className="space-y-2">
                {["sportscenter", "debate", "podcast"].map((f) => (
                  <button key={f} onClick={() => { setSelectedFormat(f as any); setShowGenerateModal(true); }}
                    className="w-full text-left glass rounded-lg px-3 py-2.5 text-xs hover:border-white/20 border border-white/5 transition-colors">
                    {f === "sportscenter" ? "📺" : f === "debate" ? "🔥" : "🎧"} {FORMAT_LABELS[f]} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display text-2xl tracking-wide mb-2">CONNECT LEAGUE</h2>
            <p className="text-white/40 text-sm mb-5">Find your League ID in Sleeper: League → Settings → League ID</p>
            <input type="text" value={leagueIdInput} onChange={(e) => setLeagueIdInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connectLeague()}
              placeholder="e.g. 784123456789012345"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#378ADD]/50 mb-3" autoFocus />
            {leagueError && <p className="text-red-400 text-xs mb-3">{leagueError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowConnectModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={connectLeague} disabled={loadingLeague} className="btn-primary flex-1">{loadingLeague ? "Connecting..." : "Connect →"}</button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display text-2xl tracking-wide mb-5">GENERATE EPISODE</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Show Format</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: "sportscenter", icon: "📺", label: "SportsCenter" }, { id: "debate", icon: "🔥", label: "Debate" }, { id: "podcast", icon: "🎧", label: "Podcast" }].map((f) => (
                    <button key={f.id} onClick={() => setSelectedFormat(f.id as any)}
                      className={`p-3 rounded-xl text-center text-xs border transition-all ${selectedFormat === f.id ? "border-[#378ADD] bg-[#378ADD]/10 text-white" : "border-white/8 glass text-white/50"}`}>
                      <span className="block text-lg mb-1">{f.icon}</span>{f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Episode Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TYPE_LABELS).map(([id, label]) => (
                    <button key={id} onClick={() => setSelectedType(id)}
                      className={`p-2.5 rounded-lg text-xs border transition-all text-left ${selectedType === id ? "border-[#378ADD] bg-[#378ADD]/10 text-white" : "border-white/8 glass text-white/50"}`}>
                      <span className="block mb-0.5" style={{ color: TYPE_COLORS[id] }}>●</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              {league && (
                <div className="glass rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-white/50">Using: <span className="text-white/80">{league.leagueName}</span></span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowGenerateModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={generateEpisode} disabled={generating} className="btn-primary flex-1">{generating ? "Generating..." : "Generate ⚡"}</button>
            </div>
            {generating && <p className="text-center text-white/30 text-xs mt-3">Claude is writing your script... ~15 seconds</p>}
          </div>
        </div>
      )}
    </div>
  );
}
