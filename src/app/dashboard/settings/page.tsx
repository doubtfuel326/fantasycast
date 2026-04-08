"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const {user} = useUser();
  const [lid, setLid] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState<any>(null);
  const [fmt, setFmt] = useState("thewire");

  useEffect(() => {
    try {
      const d = localStorage.getItem("fcast_league"); if(d) setConnected(JSON.parse(d));
      const id = localStorage.getItem("fcast_lid"); if(id) setLid(id);
      const f = localStorage.getItem("fcast_format"); if(f) setFmt(f);
    } catch {}
  }, []);

  async function save() {
    if(!lid.trim()) return;
    setSaving(true); setError("");
    try {
      const r = await fetch("/api/league-preview?leagueId="+lid.trim()+"&platform=sleeper");
      if(!r.ok) throw new Error("League not found");
      const d = await r.json();
      setConnected(d);
      localStorage.setItem("fcast_league", JSON.stringify(d));
      localStorage.setItem("fcast_lid", lid.trim());
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch(e:any) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="fixed left-0 top-0 bottom-0 w-56 border-r border-white/5 bg-[#111111] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-xl tracking-wider">LEAGUE<span className="text-[#00C853]">WIRE</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">▶ Episodes</Link>
          <Link href="/dashboard/standings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">📊 Standings</Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/8 text-white text-sm">⚙ Settings</Link>
        </nav>
      </div>
      <div className="ml-56 p-8 max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide mb-8">SETTINGS</h1>

        {connected && (
          <div className="glass-green rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <div>
                <p className="text-sm font-medium">{connected.league?.leagueName}</p>
                <p className="text-xs text-white/40">{connected.league?.totalTeams} teams · {connected.league?.scoringType}</p>
              </div>
            </div>
            <button onClick={()=>{["fcast_league","fcast_lid"].forEach(k=>localStorage.removeItem(k));setConnected(null);setLid("");}} className="text-xs text-red-400">Disconnect</button>
          </div>
        )}

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">{connected?"CHANGE LEAGUE":"CONNECT LEAGUE"}</h2>
          <p className="text-white/40 text-sm mb-4">Sleeper app → League → Settings → League ID</p>
          <input value={lid} onChange={e=>setLid(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
            placeholder="Paste Sleeper League ID"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00C853]/50 mb-3" />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button onClick={save} disabled={saving||!lid.trim()} className="btn-primary">
            {saving?"Connecting...":saved?"✓ Connected!":connected?"Update":"Connect League"}
          </button>
        </section>

        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">DEFAULT FORMAT</h2>
          <p className="text-white/40 text-sm mb-4">Format used for auto-generated episodes.</p>
          <div className="grid grid-cols-3 gap-3">
            {[{id:"thewire",icon:"📺",l:"SportsCenter"},{id:"debate",icon:"🔥",l:"Debate Show"},{id:"podcast",icon:"🎧",l:"Podcast"}].map(f=>(
              <button key={f.id} onClick={()=>{setFmt(f.id);localStorage.setItem("fcast_format",f.id);}}
                className={"p-4 rounded-xl text-center text-xs border "+(fmt===f.id?"border-[#00C853] bg-[#00C853]/10":"glass border-white/8 text-white/50")}>
                <span className="text-2xl block mb-1">{f.icon}</span>{f.l}
              </button>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl tracking-wide mb-4">ACCOUNT</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-white/40">Name</span><span>{user?.fullName||"—"}</span></div>
            <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white/70">{user?.emailAddresses[0]?.emailAddress||"—"}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
