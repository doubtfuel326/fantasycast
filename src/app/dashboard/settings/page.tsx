"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function SettingsPage() {
  const {user} = useUser();
  const [lid, setLid] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState<any>(null);
  const [fmt, setFmt] = useState("thewire");
  const [plan, setPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    try {
      const d = localStorage.getItem("fcast_league"); if(d) setConnected(JSON.parse(d));
      const id = localStorage.getItem("fcast_lid"); if(id) setLid(id);
      const f = localStorage.getItem("fcast_format"); if(f) setFmt(f);
    } catch {}
    async function loadPlan() {
      if (!user?.id) return;
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
        const { data } = await supabase.from("subscribers").select("plan, status").eq("user_id", user.id).single();
        if (data?.status === "active") setPlan(data.plan);
      } catch {}
    }
    loadPlan();
  }, [user?.id]);

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
      localStorage.setItem("fcast_platform", "sleeper");
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch(e:any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function openBillingPortal() {
    setLoadingPortal(true);
    try {
      const r = await fetch("/api/billing-portal", { method: "POST" });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else alert(d.error || "Failed to open billing portal");
    } catch {
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setLoadingPortal(false);
    }
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
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/8 text-white text-sm">⚙ Settings</Link>
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
        <Link href="/dashboard/settings" className="flex-1 flex flex-col items-center py-3 text-white text-xs gap-1"><span>⚙</span><span>Settings</span></Link>
      </div>
      <div className="md:ml-56 pt-14 md:pt-0 pb-20 md:pb-0 p-4 md:p-8 max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide mb-8">SETTINGS</h1>
        {connected && (
          <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between border border-[#00C853]/20">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#00C853]" />
              <div>
                <p className="text-sm font-medium">{connected.league?.leagueName}</p>
                <p className="text-xs text-white/40">{connected.league?.totalTeams} teams · {connected.league?.scoringType}</p>
              </div>
            </div>
            <button onClick={()=>{["fcast_league","fcast_lid","fcast_platform","fcast_episodes_lid"].forEach(k=>localStorage.removeItem(k));setConnected(null);setLid("");}} className="text-xs text-red-400 hover:text-red-300">Disconnect</button>
          </div>
        )}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">{connected?"CHANGE SLEEPER LEAGUE":"CONNECT SLEEPER LEAGUE"}</h2>
          <p className="text-white/40 text-sm mb-4">Sleeper app → League → Settings → League ID</p>
          <input value={lid} onChange={e=>setLid(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
            placeholder="Paste Sleeper League ID"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00C853]/50 mb-3" />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={save} disabled={saving||!lid.trim()} className="btn-primary">
              {saving?"Connecting...":saved?"✓ Connected!":connected?"Update":"Connect League"}
            </button>
            <Link href="/onboarding" className="btn-ghost px-4 py-2 text-sm">Connect Yahoo →</Link>
          </div>
        </section>
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">DEFAULT FORMAT</h2>
          <p className="text-white/40 text-sm mb-4">Format used for auto-generated episodes.</p>
          <div className="grid grid-cols-3 gap-3">
            {[{id:"thewire",icon:"📡",l:"The Wire"},{id:"debate",icon:"🔥",l:"Debate Show"},{id:"podcast",icon:"🎧",l:"Podcast"}].map(f=>(
              <button key={f.id} onClick={()=>{setFmt(f.id);localStorage.setItem("fcast_format",f.id);}}
                className={"p-4 rounded-xl text-center text-xs border "+(fmt===f.id?"border-[#00C853] bg-[#00C853]/10":"glass border-white/8 text-white/50")}>
                <span className="text-2xl block mb-1">{f.icon}</span>{f.l}
              </button>
            ))}
          </div>
        </section>
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-4">SUBSCRIPTION</h2>
          {plan ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium capitalize">{plan} Plan</p>
                  <p className="text-xs text-white/40">Active subscription</p>
                </div>
                <span className="text-xs bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 rounded-full px-3 py-1">Active</span>
              </div>
              <button onClick={openBillingPortal} disabled={loadingPortal} className="btn-ghost w-full py-2.5 text-sm">
                {loadingPortal ? "Opening..." : "Manage Subscription →"}
              </button>
              <p className="text-white/30 text-xs mt-2 text-center">Update payment, change plan, or cancel</p>
            </div>
          ) : (
            <div>
              <p className="text-white/40 text-sm mb-4">No active subscription.</p>
              <Link href="/pricing" className="btn-primary text-sm inline-block">View Plans →</Link>
            </div>
          )}
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
