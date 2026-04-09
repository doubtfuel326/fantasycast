"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Step = "platform" | "connect" | "preview";

const PLATFORMS = [
  { id: "sleeper", name: "Sleeper", color: "#5865F2", available: true, note: "Free API — connects instantly" },
  { id: "espn", name: "ESPN Fantasy", color: "#CC2222", available: false, note: "Coming soon" },
  { id: "yahoo", name: "Yahoo Fantasy", color: "#7B0099", available: true, note: "Connect via Yahoo account" },
  { id: "nfl", name: "NFL.com", color: "#013369", available: false, note: "Coming soon" },
];

export default function OnboardingPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState(params.get("platform") || "");
  const [leagueId, setLeagueId] = useState(params.get("leagueId") || "");
  const [leagueData, setLeagueData] = useState<any>(null);
  const [yahooLeagues, setYahooLeagues] = useState<any[]>([]);
  const [loadingYahoo, setLoadingYahoo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('yahoo') === 'connected') {
      setPlatform('yahoo');
      setStep('preview');
      setLoadingYahoo(true);
      fetch('/api/yahoo-leagues')
        .then(r => r.json())
        .then(d => {
          const recent = (d.leagues || []).filter((l: any) => parseInt(l.season) >= 2023);
          setYahooLeagues(recent);
        })
        .finally(() => setLoadingYahoo(false));
    }
  }, []);

  useEffect(() => {
    if (params.get("leagueId") && params.get("platform")) {
      setPlatform(params.get("platform") || "sleeper");
      setStep("connect");
    }
  }, []);

  async function fetchLeaguePreview() {
    if (!leagueId.trim()) { setError("Please enter a league ID"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/league-preview?leagueId=${leagueId.trim()}&platform=${platform}`);
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
    // Save league data to localStorage so dashboard picks it up
    localStorage.setItem("leaguewire_league", JSON.stringify(leagueData));
    localStorage.setItem("leaguewire_leagueId", leagueId.trim());
    router.push("/dashboard");
  }

  const steps: Step[] = ["platform", "connect", "preview"];

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      <nav className="border-b border-white/5 px-6 h-14 flex items-center">
        <Link href="/" className="font-display text-xl tracking-wider">
          LEAGUE<span className="text-[#00C853]">WIRE</span>
        </Link>
      </nav>

      {/* Progress */}
      <div className="border-b border-white/5 px-6 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border flex-shrink-0 ${
                step === s ? "bg-[#00C853] border-[#00C853] text-white" :
                steps.indexOf(step) > i ? "bg-[#00C853]/20 border-[#00C853]/40 text-[#00C853]" :
                "border-white/15 text-white/20"
              }`}>{i + 1}</div>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${steps.indexOf(step) > i ? "bg-[#00C853]/40" : "bg-white/8"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          {/* Step 1: Platform */}
          {step === "platform" && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl tracking-wide mb-2">CONNECT YOUR LEAGUE</h1>
                <p className="text-white/40 text-sm">Choose your fantasy platform to get started.</p>
              </div>
              <div className="space-y-3">
                {PLATFORMS.map((p) => (
                  <button key={p.id}
                    onClick={() => { if (p.available) { setPlatform(p.id); setStep("connect"); } }}
                    disabled={!p.available}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                      platform === p.id ? "border-[#00C853] bg-[#00C853]/10" :
                      p.available ? "glass border-white/8 hover:border-white/20" :
                      "border-white/5 opacity-40 cursor-not-allowed"
                    }`}>
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

          {/* Step 2: Enter League ID */}
          {step === "connect" && (
            <div className="space-y-6">
              {platform === "yahoo" ? (
                <>
                  <h1 className="font-display text-4xl tracking-wide mb-2">CONNECT YAHOO</h1>
                  <p className="text-white/40 text-sm mb-6">Sign in with Yahoo to connect your fantasy league.</p>
                  <a href="/api/auth/yahoo" className="btn-primary w-full py-3.5 text-center block">Connect Yahoo Fantasy →</a>
                  <button onClick={() => setStep("platform")} className="text-white/30 text-xs hover:text-white/50 transition-colors block mx-auto mt-4">← Back</button>
                </>
              ) : (
                <>
                  <div>
                    <h1 className="font-display text-4xl tracking-wide mb-2">ENTER LEAGUE ID</h1>
                    <p className="text-white/40 text-sm">
                      Find your Sleeper league ID:{" "}
                      <span className="text-white/60">League → Settings → League ID</span>
                    </p>
                  </div>
                  <div className="glass rounded-xl p-5 space-y-2">
                    <label className="text-xs text-white/40 uppercase tracking-widest">Sleeper League ID</label>
                    <input type="text" value={leagueId} onChange={(e) => setLeagueId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchLeaguePreview()}
                      placeholder="e.g. 784123456789012345"
                      className="w-full bg-transparent text-white text-lg focus:outline-none placeholder-white/20"
                      autoFocus />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button onClick={fetchLeaguePreview} disabled={loading} className="btn-primary w-full py-3.5">
                    {loading ? "Fetching league data..." : "Preview League →"}
                  </button>
                  <button onClick={() => setStep("platform")} className="text-white/30 text-xs hover:text-white/50 transition-colors block mx-auto">← Back</button>
                </>
              )}
            </div>
          )}

          {/* Yahoo League Picker */}
          {step === 'preview' && platform === 'yahoo' && (
            <div className='space-y-6'>
              <div>
                <h1 className='font-display text-4xl tracking-wide mb-2'>SELECT YOUR LEAGUE</h1>
                <p className='text-white/40 text-sm'>Choose which Yahoo league to use for LeagueWire.</p>
              </div>
              {loadingYahoo ? (
                <p className='text-white/40 text-sm'>Loading your leagues...</p>
              ) : (
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {yahooLeagues.map((league: any) => (
                    <button key={league.leagueId} onClick={() => {
                      localStorage.setItem('fcast_league', JSON.stringify({ league, standings: [] }));
                      localStorage.setItem('fcast_lid', league.leagueId);
                      localStorage.setItem('fcast_platform', 'yahoo');
                      window.location.href = '/dashboard';
                    }} className='w-full glass rounded-xl p-4 text-left hover:border-[#00C853]/40 border border-white/5 transition-colors'>
                      <p className='font-medium text-sm'>{league.leagueName}</p>
                      <p className='text-white/40 text-xs mt-1'>{league.sport.toUpperCase()} · {league.season} · {league.totalTeams} teams</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview + Go to Dashboard */}
          {step === "preview" && leagueData && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-green-400 text-xs font-medium">League found!</span>
                </div>
                <h1 className="font-display text-4xl tracking-wide mb-2">{leagueData.league?.leagueName || "Your League"}</h1>
                <p className="text-white/40 text-sm">
                  {leagueData.league?.totalTeams} teams · {leagueData.league?.scoringType} · Season {leagueData.league?.season}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-white/30 mb-3">Current Standings</p>
                {(leagueData.standings || []).slice(0, 6).map((team: any, i: number) => (
                  <div key={team.teamId} className="glass rounded-lg px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 text-xs w-4">{i + 1}</span>
                      <span className="text-sm font-medium">{team.teamName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span>{team.wins}-{team.losses}</span>
                      <span>{team.pointsFor?.toFixed(1)} pts</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Go straight to dashboard — saves league first */}
              <button onClick={saveAndGoDashboard} className="btn-primary w-full py-3.5">
                Go to Dashboard →
              </button>

              <Link href="/pricing" className="btn-ghost w-full py-3.5 text-center block">
                View Pricing Plans
              </Link>

              <button onClick={() => setStep("connect")} className="text-white/30 text-xs hover:text-white/50 transition-colors block mx-auto">
                ← Try different league
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
