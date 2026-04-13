"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function LeagueSetupPage() {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leagueId, setLeagueId] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [leagueType, setLeagueType] = useState("redraft");

  const [lastSeason, setLastSeason] = useState({
    year: "2024",
    champion_team: "", champion_manager: "",
    runner_up_team: "", runner_up_manager: "",
    last_place_team: "", last_place_manager: "",
    round1_eliminated: ["", "", "", ""],
    round2_eliminated: ["", ""],
    bye_teams: [] as string[],
    num_byes: 0,
  });

  const [thisSeason, setThisSeason] = useState({
    year: "2025",
    playoff_teams: [] as string[],
    bye_teams: [] as string[],
    num_byes: 0,
  });

  const [pastChampions, setPastChampions] = useState<{year: string, team: string, manager: string}[]>([
    { year: "", team: "", manager: "" }
  ]);

  useEffect(() => {
    try {
      const lid = localStorage.getItem("fcast_lid") || "";
      const league = localStorage.getItem("fcast_league");
      setLeagueId(lid);
      if (league) {
        const parsed = JSON.parse(league);
        setLeagueName(parsed.league?.leagueName || "");
        const teams = parsed.standings?.map((t: any) => t.teamName) || [];
        setAllTeams(teams);
      }
    } catch {}

    async function loadSettings() {
      if (!user?.id) return;
      const lid = localStorage.getItem("fcast_lid") || "";
      if (!lid) return;
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
        const { data } = await supabase
          .from("league_settings")
          .select("*")
          .eq("user_id", user.id)
          .eq("league_id", lid)
          .single();
        if (data) {
          setLeagueType(data.league_type || "redraft");
          if (data.last_season) setLastSeason({
            year: "", champion_team: "", champion_manager: "",
            runner_up_team: "", runner_up_manager: "",
            last_place_team: "", last_place_manager: "",
            round1_eliminated: ["", "", "", ""],
            round2_eliminated: ["", ""],
            bye_teams: [],
            num_byes: 0,
            ...data.last_season,
          });
          if (data.this_season) setThisSeason({
            year: "2025",
            playoff_teams: [],
            bye_teams: [],
            num_byes: 0,
            ...data.this_season,
          });
          if (data.past_champions) setPastChampions(data.past_champions);
        }
      } catch {}
    }
    loadSettings();
  }, [user?.id]);

  async function save() {
    if (!user?.id || !leagueId) return;
    setSaving(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      await supabase.from("league_settings").upsert({

        user_id: user.id,
        league_id: leagueId,
        league_name: leagueName,
        league_type: leagueType,
        last_season: lastSeason,
        this_season: thisSeason,
        past_champions: pastChampions.filter(c => c.year && c.team),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,league_id" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00C853]/50";

  function togglePlayoffTeam(team: string) {
    const current = thisSeason.playoff_teams;
    const updated = current.includes(team)
      ? current.filter(t => t !== team)
      : [...current, team];
    setThisSeason({...thisSeason, playoff_teams: updated});
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 border-r border-white/5 bg-[#111111] flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-xl tracking-wider">LEAGUE<span className="text-[#00C853]">WIRE</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">▶ Episodes</Link>
          <Link href="/dashboard/standings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">📊 Standings</Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">⚙ Settings</Link>
          <Link href="/dashboard/league-setup" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/8 text-white text-sm">🏆 League Setup</Link>
        </nav>
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <UserButton appearance={{elements:{avatarBox:"w-8 h-8"}}} />
          <p className="text-xs truncate">{user?.fullName||"Manager"}</p>
        </div>
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#111111] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-wider">LEAGUE<span className="text-[#00C853]">WIRE</span></Link>
        <UserButton appearance={{elements:{avatarBox:"w-8 h-8"}}} />
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-white/5 flex">
        <Link href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-white/40 text-xs gap-1"><span>▶</span><span>Episodes</span></Link>
        <Link href="/dashboard/standings" className="flex-1 flex flex-col items-center py-3 text-white/40 text-xs gap-1"><span>📊</span><span>Standings</span></Link>
        <Link href="/dashboard/settings" className="flex-1 flex flex-col items-center py-3 text-white/40 text-xs gap-1"><span>⚙</span><span>Settings</span></Link>
        <Link href="/dashboard/league-setup" className="flex-1 flex flex-col items-center py-3 text-white text-xs gap-1"><span>🏆</span><span>Setup</span></Link>
      </div>

      <div className="md:ml-56 pt-14 md:pt-0 pb-24 md:pb-8 p-4 md:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-wide mb-1">LEAGUE SETUP</h1>
          {leagueName && <p className="text-[#00C853] text-sm font-medium">{leagueName}</p>}
          <p className="text-white/30 text-xs mt-1">Help Marcus and Tanner tell accurate stories about your league.</p>
        </div>

        {/* League Type */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-4">LEAGUE TYPE</h2>
          <div className="grid grid-cols-2 gap-3">
            {[{id:"redraft",icon:"🔄",label:"Redraft"},{id:"dynasty",icon:"👑",label:"Dynasty"}].map(t => (
              <button key={t.id} onClick={() => setLeagueType(t.id)}
                className={"p-3 rounded-xl text-center text-sm border " + (leagueType === t.id ? "border-[#00C853] bg-[#00C853]/10 text-white" : "border-white/10 text-white/50")}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* This Season */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">THIS SEASON — CURRENT OR UPCOMING</h2>
          <p className="text-white/30 text-xs mb-4">The season currently being played or about to start. Update playoff teams as the season progresses.</p>
          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Season Year</label>
            <input value={thisSeason.year}
              onChange={e => setThisSeason({...thisSeason, year: e.target.value})}
              placeholder="e.g. 2025" className={inputClass} />
          </div>
          {allTeams.length > 0 && (
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Teams That Made The Playoffs</label>
              <p className="text-white/20 text-xs mb-3">Tap to select/deselect</p>
              <div className="grid grid-cols-2 gap-2">
                {allTeams.map(team => (
                  <button key={team} onClick={() => togglePlayoffTeam(team)}
                    className={"p-2.5 rounded-lg text-xs border text-left transition-colors " +
                      (thisSeason.playoff_teams.includes(team)
                        ? "border-[#00C853] bg-[#00C853]/10 text-white"
                        : "border-white/10 text-white/40")}>
                    {thisSeason.playoff_teams.includes(team) ? "✓ " : ""}{team}
                  </button>
                ))}
              </div>
              {allTeams.length === 0 && (
                <p className="text-white/20 text-xs">Connect your league to see teams here.</p>
              )}
            </div>
          )}
        </section>

        {/* Last Season */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">LAST SEASON — SEASON THAT JUST ENDED</h2>
          <p className="text-white/30 text-xs mb-4">The most recent completed season. Marcus and Tanner will recap this season in Offseason, Preseason, and Championship episodes.</p>

          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Season Year</label>
            <input value={lastSeason.year}
              onChange={e => setLastSeason({...lastSeason, year: e.target.value})}
              placeholder="e.g. 2024" className={inputClass} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#FFD700] uppercase tracking-widest mb-2 block">🏆 Champion</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={lastSeason.champion_team}
                  onChange={e => setLastSeason({...lastSeason, champion_team: e.target.value})}
                  placeholder="Team name" className={inputClass} />
                <input value={lastSeason.champion_manager}
                  onChange={e => setLastSeason({...lastSeason, champion_manager: e.target.value})}
                  placeholder="Manager name" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">🥈 Runner Up</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={lastSeason.runner_up_team}
                  onChange={e => setLastSeason({...lastSeason, runner_up_team: e.target.value})}
                  placeholder="Team name" className={inputClass} />
                <input value={lastSeason.runner_up_manager}
                  onChange={e => setLastSeason({...lastSeason, runner_up_manager: e.target.value})}
                  placeholder="Manager name" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-red-400 uppercase tracking-widest mb-2 block">💀 Last Place</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={lastSeason.last_place_team}
                  onChange={e => setLastSeason({...lastSeason, last_place_team: e.target.value})}
                  placeholder="Team name" className={inputClass} />
                <input value={lastSeason.last_place_manager}
                  onChange={e => setLastSeason({...lastSeason, last_place_manager: e.target.value})}
                  placeholder="Manager name" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">1st Round Eliminated</label>
              <div className="grid grid-cols-2 gap-2">
                {lastSeason.round1_eliminated.map((team, i) => (
                  <input key={i} value={team}
                    onChange={e => {
                      const updated = [...lastSeason.round1_eliminated];
                      updated[i] = e.target.value;
                      setLastSeason({...lastSeason, round1_eliminated: updated});
                    }}
                    placeholder={`Team ${i + 1}`} className={inputClass} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">2nd Round Eliminated</label>
              <div className="grid grid-cols-2 gap-2">
                {lastSeason.round2_eliminated.map((team, i) => (
                  <input key={i} value={team}
                    onChange={e => {
                      const updated = [...lastSeason.round2_eliminated];
                      updated[i] = e.target.value;
                      setLastSeason({...lastSeason, round2_eliminated: updated});
                    }}
                    placeholder={`Team ${i + 1}`} className={inputClass} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">How Many Teams Had Byes Last Season</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[0,1,2].map(n => (
                  <button key={n} onClick={() => setLastSeason({...lastSeason, num_byes: n})}
                    className={"p-2.5 rounded-lg text-xs border text-center " +
                      (lastSeason.num_byes === n ? "border-[#00C853] bg-[#00C853]/10 text-white" : "border-white/10 text-white/40")}>
                    {n === 0 ? "No Byes" : n === 1 ? "1 Team" : "2 Teams"}
                  </button>
                ))}
              </div>
              {lastSeason.num_byes > 0 && (
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Teams That Had Byes Last Season</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[...Array(lastSeason.num_byes)].map((_, i) => (
                      <input key={i} value={lastSeason.bye_teams[i] || ""}
                        onChange={e => {
                          const updated = [...(lastSeason.bye_teams || [])];
                          updated[i] = e.target.value;
                          setLastSeason({...lastSeason, bye_teams: updated});
                        }}
                        placeholder={`Bye team ${i + 1}`} className={inputClass} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* All-Time Champions */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">ALL-TIME CHAMPIONS</h2>
          <p className="text-white/30 text-xs mb-4">For Legacy episodes — add seasons OLDER than last season only. Do not add last season here, it is already saved above.</p>
          <div className="space-y-3">
            {pastChampions.map((champ, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={champ.year} onChange={e => {
                  const updated = [...pastChampions];
                  updated[i] = {...updated[i], year: e.target.value};
                  setPastChampions(updated);
                }} placeholder="Year" className={inputClass + " w-20"} />
                <input value={champ.team} onChange={e => {
                  const updated = [...pastChampions];
                  updated[i] = {...updated[i], team: e.target.value};
                  setPastChampions(updated);
                }} placeholder="Team name" className={inputClass} />
                <input value={champ.manager} onChange={e => {
                  const updated = [...pastChampions];
                  updated[i] = {...updated[i], manager: e.target.value};
                  setPastChampions(updated);
                }} placeholder="Manager" className={inputClass} />
                <button onClick={() => {
                  const updated = pastChampions.filter((_, idx) => idx !== i);
                  setPastChampions(updated.length === 0 ? [{year: "", team: "", manager: ""}] : updated);
                }} className="text-red-400 hover:text-red-300 text-xl flex-shrink-0 px-1">✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => setPastChampions([...pastChampions, {year: "", team: "", manager: ""}])}
            className="mt-3 text-xs text-[#00C853] hover:underline">+ Add another year</button>
        </section>

        <button onClick={save} disabled={saving}
          className="btn-primary w-full py-3.5 text-sm">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save League Setup"}
        </button>
      </div>
    </div>
  );
}
