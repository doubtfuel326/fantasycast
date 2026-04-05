"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Step = "platform" | "connect" | "preview";

const PLATFORMS = [
  { id: "sleeper", name: "Sleeper", color: "#5865F2", available: true, note: "Free API — connects instantly" },
  { id: "espn", name: "ESPN Fantasy", color: "#CC2222", available: false, note: "Coming soon" },
  { id: "yahoo", name: "Yahoo Fantasy", color: "#7B0099", available: false, note: "Coming soon" },
];

export default function OnboardingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState("sleeper");
  const [leagueId, setLeagueId] = useState(params.get("leagueId") || "");
  const [leagueData, setLeagueData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.get("leagueId")) setStep("connect");
  }, []);

  async function fetchLeaguePreview() {
    if (!leagueId.trim()) { setError("Please enter a league ID"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/league-preview?leagueId=" + leagueId.trim() + "&platform=" + platform);
      if (!res.ok) throw new Error("League not found. Check your league ID.");
      const data = await res.json();
      setLeagueData(data);
      setStep("preview");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function saveAndGoDashboard() {
    localStorage.setItem("fantasycast_league", JSON.stringify(leagueData));
    localStorage.setItem("fantasycast_leagueId", leagueId.trim());
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#060b18] flex flex-col">
      <nav className="border-b border-white/5 px-6 h-14 flex items-center">
        <Link href="/" className="font-display text-xl tracking-wider">FANTASY<span className="text-[#378ADD]">CAST</span></Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          {step === "platform" && (
            <div className="space-y-6">
              <h1 className="font-display text-4xl tracking-wide mb-2">CONNECT YOUR LEAGUE</h1>
              <div className="space-y-3">
                {PLATFORMS.map((p) => (
                  <button key={p.id} onClick={() => { if (p.available) { setPlatform(p.id); setStep("connect"); } }} disabled={!p.available}
                    className={"w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between " + (p.available ? "glass border-white/8 hover:border-white/20" : "border-white/5 opacity-40 cursor-not-allowed")}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                    <span className="text-xs text-white/30">{p.note}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "connect" && (
            <div className="space-y-6">
              <h1 className="font-display text-4xl tracking-wide mb-2">ENTER LEAGUE ID</h1>
              <p className="text-white/40 text-sm">Sleeper app: League → Settings → League ID</p>
              <div className="glass rounded-xl p-5">
                <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Sleeper League ID</label>
                <input type="text" value={leagueId} onChange={(e) => setLeagueId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLeaguePreview()}
                  placeholder="e.g. 784123456789012345"
                  className="w-full bg-transparent text-white text-lg focus:outline-none placeholder-white/20" autoFocus />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button onClick={fetchLeaguePreview} disabled={loading} className="btn-primary w-full py-3.5">
                {loading ? "Fetching..." : "Preview League →"}
              </button>
              <button onClick={() => setStep("platform")} className="text-white/30 text-xs block mx-auto">← Back</button>
            </div>
          )}

          {step === "preview" && leagueData && (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs font-medium">League found!</span>
              </div>
              <h1 className="font-display text-4xl tracking-wide">{leagueData.league?.leagueName}</h1>
              <p className="text-white/40 text-sm">{leagueData.league?.totalTeams} teams · {leagueData.league?.scoringType}</p>
              <div className="space-y-2">
                {(leagueData.standings || []).slice(0, 6).map((team: any, i: number) => (
                  <div key={team.teamId} className="glass rounded-lg px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 text-xs w-4">{i + 1}</span>
                      <span className="text-sm font-medium">{team.teamName}</span>
                    </div>
                    <span className="text-xs text-white/40">{team.wins}-{team.losses}</span>
                  </div>
                ))}
              </div>
              <button onClick={saveAndGoDashboard} className="btn-primary w-full py-3.5">
                Go to Dashboard →
              </button>
              <button onClick={() => setStep("connect")} className="text-white/30 text-xs block mx-auto">← Try different league</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
