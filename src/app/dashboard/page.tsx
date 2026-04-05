"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

const FORMAT_LABELS: Record<string, string> = { sportscenter: "SportsCenter", debate: "Debate Show", podcast: "Podcast" };
const TYPE_LABELS: Record<string, string> = { weekly_recap: "Weekly Recap", draft_recap: "Draft Recap", preseason: "Preseason", playoff: "Playoffs", legacy: "Legacy", offseason: "Offseason" };
const TYPE_COLORS: Record<string, string> = { weekly_recap: "#27AE60", draft_recap: "#378ADD", preseason: "#F39C12", playoff: "#E74C3C", legacy: "#9B59B6", offseason: "#1ABC9C" };

export default function DashboardPage() {
  const { user } = useUser();
  const [leagueId, setLeagueId] = useState("");
  const [leagueData, setLeagueData] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("sportscenter");
  const [selectedType, setSelectedType] = useState("weekly_recap");
  const [showModal, setShowModal] = useState(false);
  const [newEpisode, setNewEpisode] = useState<any>(null);

  useEffect(() => {
    try {
      const l = localStorage.getItem("fantasycast_league");
      if (l) setLeagueData(JSON.parse(l));
      const e = localStorage.getItem("fantasycast_episodes");
      if (e) setEpisodes(JSON.parse(e));
    } catch {}
  }, []);

  async function connectLeague() {
    if (!leagueId.trim()) return;
    setConnecting(true);
    setConnectError("");
    try {
      const res = await fetch("/api/league-preview?leagueId=" + leagueId.trim() + "&platform=sleeper");
      if (!res.ok) throw new Error("League not found");
      const data = await res.json();
      setLeagueData(data);
      localStorage.setItem("fantasycast_league", JSON.stringify(data));
      localStorage.setItem("fantasycast_leagueId", leagueId.trim());
      setLeagueId("");
    } catch (e: any) {
      setConnectError(e.message);
    } finally {
      setConnecting(false);
    }
  }

  async function generate() {
    setGenerating(true);
    try {
      const lid = localStorage.getItem("fantasycast_leagueId") || "demo_league";
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId: lid, platform: "sleeper", format: selectedFormat, episodeType: selectedType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const ep = { id: data.id, week: data.week, episodeType: data.episodeType, format: data.format, title: data.title, teaser: data.teaser, generatedAt: data.generatedAt, script: data.script };
      const updated = [ep, ...episodes];
      setEpisodes(updated);
      localStorage.setItem("fantasycast_episodes", JSON.stringify(updated));
      localStorage.setItem("fantasycast_episode_" + data.id, JSON.stringify(data));
      setNewEpisode(ep);
      setShowModal(false);
    } catch (e: any) {
      alert("Failed: " + e.message);
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
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/8 text-white text-sm"><span className="text-xs">▶</span>Episodes</Link>
          <Link href="/dashboard/standings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm"><span className="text-xs">📊</span>Standings</Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm"><span className="text-xs">⚙</span>Settings</Link>
        </nav>
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          <p className="text-xs font-medium truncate">{user?.fullName || "Manager"}</p>
        </div>
      </div>

      <div className="ml-56 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            {league ? (
              <>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Week {leagueData?.currentWeek} · {league.season}</p>
                <h1 className="font-display text-4xl tracking-wide">{league.leagueName}</h1>
                <p className="text-white/40 text-sm mt-1">{league.totalTeams} teams · {league.scoringType}</p>
              </>
            ) : (
              <h1 className="font-display text-4xl tracking-wide">DASHBOARD</h1>
            )}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">⚡ Generate Episode</button>
        </div>

        {/* Connect League Box - always visible if no league */}
        {!league && (
          <div className="glass rounded-2xl p-6 mb-8 border border-[#378ADD]/20">
            <h2 className="font-display text-xl tracking-wide mb-2">CONNECT YOUR SLEEPER LEAGUE</h2>
            <p className="text-white/40 text-sm mb-4">Sleeper app → League → Settings → League ID</p>
            <div className="flex gap-3">
              <input type="text" value={leagueId} onChange={(e) => setLeagueId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connectLeague()}
                placeholder="Paste your Sleeper League ID here"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#378ADD]/50" />
              <button onClick={connectLeague} disabled={connecting || !leagueId.trim()} className="btn-primary px-6">
                {connecting ? "Connecting..." : "Connect →"}
              </button>
            </div>
            {connectError && <p className="text-red-400 text-xs mt-2">{connectError}</p>}
          </div>
        )}

        {/* Switch league if already connected */}
        {league && (
          <div className="glass rounded-xl p-4 mb-6 flex gap-3 items-center">
            <input type="text" value={leagueId} onChange={(e) => setLeagueId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connectLeague()}
              placeholder="Switch league — paste new League ID"
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 focus:outline-none" />
            <button onClick={connectLeague} disabled={connecting || !leagueId.trim()} className="text-[#378ADD] text-xs hover:underline">
              {connecting ? "Connecting..." : "Switch →"}
            </button>
          </div>
        )}

        {newEpisode && (
          <div className="glass-blue rounded-2xl p-5 mb-6 border border-[#378ADD]/20">
            <p className="text-green-400 text-xs mb-2">✓ New episode generated</p>
            <h2 className="font-display text-xl tracking-wide mb-1">{newEpisode.title}</h2>
            <p className="text-white/50 text-sm mb-3">{newEpisode.teaser}</p>
            <Link href={"/episode/" + newEpisode.id} className="btn-primary text-sm inline-block">Listen →</Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-white/60">EPISODES</h2>
            {episodes.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-white/30 text-sm mb-3">No episodes yet</p>
                <button onClick={() => setShowModal(true)} className="btn-primary text-sm">Generate your first episode ⚡</button>
              </div>
            ) : episodes.map((ep) => (
              <Link key={ep.id} href={"/episode/" + ep.id} className="glass rounded-xl p-5 flex gap-4 border border-white/5 hover:border-white/15 block">
                <div className="w-12 h-12 rounded-xl bg-[#378ADD]/10 border border-[#378ADD]/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[12px] border-l-[#378ADD] ml-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] rounded-full px-2.5 py-0.5 font-medium" style={{ background: TYPE_COLORS[ep.episodeType] + "22", color: TYPE_COLORS[ep.episodeType] }}>{TYPE_LABELS[ep.episodeType]}</span>
                    <span className="text-[10px] text-white/25 border border-white/10 rounded-full px-2 py-0.5">{FORMAT_LABELS[ep.format]}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate">{ep.title}</h3>
                  <p className="text-white/40 text-xs line-clamp-1">{ep.teaser}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-xl tracking-wide text-white/60">STANDINGS</h2>
            <div className="glass rounded-xl p-4 space-y-2">
              {standings.length === 0 ? (
                <p className="text-white/30 text-xs text-center py-4">Connect your league</p>
              ) : standings.slice(0, 20).map((t: any) => (
                <div key={t.rank} className="flex items-center gap-3 py-1">
                  <span className="text-xs text-white/20 w-4">{t.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.teamName}</p>
                    <p className="text-[10px] text-white/30">{t.managerName}</p>
                  </div>
                  <p className="text-xs text-white/50">{t.wins}-{t.losses}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display text-2xl tracking-wide mb-5">GENERATE EPISODE</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Format</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: "sportscenter", icon: "📺", label: "SportsCenter" }, { id: "debate", icon: "🔥", label: "Debate" }, { id: "podcast", icon: "🎧", label: "Podcast" }].map((f) => (
                    <button key={f.id} onClick={() => setSelectedFormat(f.id)}
                      className={"p-3 rounded-xl text-center text-xs border transition-all " + (selectedFormat === f.id ? "border-[#378ADD] bg-[#378ADD]/10 text-white" : "border-white/8 glass text-white/50")}>
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
                      className={"p-2.5 rounded-lg text-xs border transition-all text-left " + (selectedType === id ? "border-[#378ADD] bg-[#378ADD]/10 text-white" : "border-white/8 glass text-white/50")}>
                      <span className="block mb-0.5" style={{ color: TYPE_COLORS[id] }}>●</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              {league && <p className="text-xs text-white/40">League: <span className="text-white/70">{league.leagueName}</span></p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={generate} disabled={generating} className="btn-primary flex-1">{generating ? "Generating..." : "Generate ⚡"}</button>
            </div>
            {generating && <p className="text-center text-white/30 text-xs mt-3">Claude is writing your script... ~15 seconds</p>}
          </div>
        </div>
      )}
    </div>
  );
}
