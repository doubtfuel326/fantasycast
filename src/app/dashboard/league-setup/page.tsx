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

  const [form, setForm] = useState({
    league_type: "redraft",
    current_season: "2024",
    champion: "",
    champion_manager: "",
    runner_up: "",
    runner_up_manager: "",
    last_place: "",
    last_place_manager: "",
    round1_eliminated: ["", "", "", ""],
    round2_eliminated: ["", ""],
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
          setForm({
            league_type: data.league_type || "redraft",
            current_season: data.current_season || "2024",
            champion: data.champion || "",
            champion_manager: data.champion_manager || "",
            runner_up: data.runner_up || "",
            runner_up_manager: data.runner_up_manager || "",
            last_place: data.last_place || "",
            last_place_manager: data.last_place_manager || "",
            round1_eliminated: data.playoff_round1_eliminations || ["", "", "", ""],
            round2_eliminated: data.playoff_round2_eliminations || ["", ""],
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
        league_type: form.league_type,
        current_season: form.current_season,
        champion: form.champion,
        champion_manager: form.champion_manager,
        runner_up: form.runner_up,
        runner_up_manager: form.runner_up_manager,
        last_place: form.last_place,
        last_place_manager: form.last_place_manager,
        playoff_round1_eliminations: form.round1_eliminated,
        playoff_round2_eliminations: form.round2_eliminated,
        past_champions: pastChampions.filter(c => c.year && c.team),
        updated_at: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00C853]/50";

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
          {leagueName && <p className="text-white/40 text-sm">{leagueName}</p>}
          <p className="text-white/30 text-xs mt-1">This info helps Marcus and Tanner tell accurate stories about your league.</p>
        </div>

        {/* League Type */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-4">LEAGUE TYPE</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {["redraft", "dynasty"].map(t => (
              <button key={t} onClick={() => setForm({...form, league_type: t})}
                className={"p-3 rounded-xl text-center text-sm border capitalize " + (form.league_type === t ? "border-[#00C853] bg-[#00C853]/10 text-white" : "border-white/10 text-white/50")}>
                {t === "redraft" ? "🔄 Redraft" : "👑 Dynasty"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Current Season</label>
            <input value={form.current_season} onChange={e => setForm({...form, current_season: e.target.value})}
              placeholder="e.g. 2024" className={inputClass} />
          </div>
        </section>

        {/* Season Results */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">SEASON RESULTS</h2>
          <p className="text-white/30 text-xs mb-4">Enter team names and manager names for accuracy.</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#FFD700] uppercase tracking-widest mb-2 block">🏆 Champion</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={form.champion} onChange={e => setForm({...form, champion: e.target.value})}
                  placeholder="Team name" className={inputClass} />
                <input value={form.champion_manager} onChange={e => setForm({...form, champion_manager: e.target.value})}
                  placeholder="Manager name" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">🥈 Runner Up</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={form.runner_up} onChange={e => setForm({...form, runner_up: e.target.value})}
                  placeholder="Team name" className={inputClass} />
                <input value={form.runner_up_manager} onChange={e => setForm({...form, runner_up_manager: e.target.value})}
                  placeholder="Manager name" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs text-red-400 uppercase tracking-widest mb-2 block">💀 Last Place</label>
              <div className="grid grid-cols-2 gap-2">
                <input value={form.last_place} onChange={e => setForm({...form, last_place: e.target.value})}
                  placeholder="Team name" className={inputClass} />
                <input value={form.last_place_manager} onChange={e => setForm({...form, last_place_manager: e.target.value})}
                  placeholder="Manager name" className={inputClass} />
              </div>
            </div>
          </div>
        </section>

        {/* Playoff Eliminations */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">PLAYOFF RESULTS</h2>
          <p className="text-white/30 text-xs mb-4">Who got eliminated in each round.</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">1st Round Eliminated</label>
              <div className="grid grid-cols-2 gap-2">
                {form.round1_eliminated.map((team, i) => (
                  <input key={i} value={team}
                    onChange={e => {
                      const updated = [...form.round1_eliminated];
                      updated[i] = e.target.value;
                      setForm({...form, round1_eliminated: updated});
                    }}
                    placeholder={`Team ${i + 1}`} className={inputClass} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">2nd Round Eliminated</label>
              <div className="grid grid-cols-2 gap-2">
                {form.round2_eliminated.map((team, i) => (
                  <input key={i} value={team}
                    onChange={e => {
                      const updated = [...form.round2_eliminated];
                      updated[i] = e.target.value;
                      setForm({...form, round2_eliminated: updated});
                    }}
                    placeholder={`Team ${i + 1}`} className={inputClass} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Past Champions */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">ALL-TIME CHAMPIONS</h2>
          <p className="text-white/30 text-xs mb-4">For Legacy and Offseason episodes. Add one per season.</p>
          <div className="space-y-3">
            {pastChampions.map((champ, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input value={champ.year} onChange={e => {
                  const updated = [...pastChampions];
                  updated[i] = {...updated[i], year: e.target.value};
                  setPastChampions(updated);
                }} placeholder="Year" className={inputClass} />
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
