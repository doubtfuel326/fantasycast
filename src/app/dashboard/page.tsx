"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

const FL = {sportscenter:"SportsCenter",debate:"Debate Show",podcast:"Podcast"} as Record<string,string>;
const TL = {weekly_recap:"Weekly Recap",draft_recap:"Draft Recap",preseason:"Preseason",playoff:"Playoffs",legacy:"Legacy",offseason:"Offseason"} as Record<string,string>;
const TC = {weekly_recap:"#27AE60",draft_recap:"#378ADD",preseason:"#F39C12",playoff:"#E74C3C",legacy:"#9B59B6",offseason:"#1ABC9C"} as Record<string,string>;

const LKEY = "fcast_league";
const LIKEY = "fcast_lid";
const EKEY = "fcast_episodes";

export default function DashboardPage() {
  const {user} = useUser();
  const [lid, setLid] = useState("");
  const [league, setLeague] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [connErr, setConnErr] = useState("");
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [gen, setGen] = useState(false);
  const [fmt, setFmt] = useState("sportscenter");
  const [typ, setTyp] = useState("weekly_recap");
  const [modal, setModal] = useState(false);
  const [newEp, setNewEp] = useState<any>(null);

  useEffect(() => {
    try {
      const l = localStorage.getItem(LKEY); if(l) setLeague(JSON.parse(l));
      const e = localStorage.getItem(EKEY); if(e) setEpisodes(JSON.parse(e));
    } catch {}
  }, []);

  async function connect() {
    if(!lid.trim()) return;
    setConnecting(true); setConnErr("");
    try {
      const r = await fetch("/api/league-preview?leagueId="+lid.trim()+"&platform=sleeper");
      if(!r.ok) throw new Error("League not found. Check your ID.");
      const d = await r.json();
      setLeague(d);
      localStorage.setItem(LKEY, JSON.stringify(d));
      localStorage.setItem(LIKEY, lid.trim());
      setLid("");
    } catch(e:any) { setConnErr(e.message); }
    finally { setConnecting(false); }
  }

  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSub, setCheckingSub] = useState(true);

  useEffect(() => {
    // Check subscription status
    // TODO: In production, fetch from your DB using user.id
    // For now check if STRIPE_PRICE keys are configured — if not, allow free access during beta
    const isConfigured = true; // Set to false to enforce subscription gate
    setHasSubscription(isConfigured);
    setCheckingSub(false);
  }, []);

  async function generate() {
    if(!hasSubscription) {
      window.location.href = "/pricing";
      return;
    }
    setGen(true);
    try {
      const savedLid = localStorage.getItem(LIKEY) || "demo_league";
      const r = await fetch("/api/generate-script", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({leagueId:savedLid, platform:"sleeper", format:fmt, episodeType:typ}),
      });
      const d = await r.json();
      if(d.error) throw new Error(d.error);
      const ep = {id:d.id, week:d.week, episodeType:d.episodeType, format:d.format, title:d.title, teaser:d.teaser, generatedAt:d.generatedAt, script:d.script};
      const updated = [ep, ...episodes];
      setEpisodes(updated);
      localStorage.setItem(EKEY, JSON.stringify(updated));
      localStorage.setItem("fcast_ep_"+d.id, JSON.stringify(d));
      setNewEp(ep);
      setModal(false);
    } catch(e:any) { alert("Failed: "+e.message); }
    finally { setGen(false); }
  }

  const lg = league?.league;
  const st = league?.standings || [];

  return (
    <div className="min-h-screen bg-[#060b18]">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 border-r border-white/5 bg-[#0a0f1e] flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-xl tracking-wider">FANTASY<span className="text-[#378ADD]">CAST</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/8 text-white text-sm">▶ Episodes</Link>
          <Link href="/dashboard/standings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">📊 Standings</Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 text-sm">⚙ Settings</Link>
        </nav>
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <UserButton appearance={{elements:{avatarBox:"w-8 h-8"}}} />
          <p className="text-xs truncate">{user?.fullName||"Manager"}</p>
        </div>
      </div>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0f1e] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-wider">FANTASY<span className="text-[#378ADD]">CAST</span></Link>
        <div className="flex items-center gap-3">
          <button onClick={()=>setModal(true)} className="bg-[#378ADD] text-white text-xs font-medium px-3 py-1.5 rounded-lg">⚡ Generate</button>
          <UserButton appearance={{elements:{avatarBox:"w-8 h-8"}}} />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1e] border-t border-white/5 flex">
        <Link href="/dashboard" className="flex-1 flex flex-col items-center py-3 text-white text-xs gap-1">
          <span>▶</span><span>Episodes</span>
        </Link>
        <Link href="/dashboard/standings" className="flex-1 flex flex-col items-center py-3 text-white/40 text-xs gap-1">
          <span>📊</span><span>Standings</span>
        </Link>
        <Link href="/dashboard/settings" className="flex-1 flex flex-col items-center py-3 text-white/40 text-xs gap-1">
          <span>⚙</span><span>Settings</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="md:ml-56 pt-14 md:pt-0 pb-20 md:pb-0 p-4 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            {lg ? <>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Week {league?.currentWeek} · {lg.season}</p>
              <h1 className="font-display text-4xl tracking-wide">{lg.leagueName}</h1>
              <p className="text-white/40 text-sm mt-1">{lg.totalTeams} teams · {lg.scoringType}</p>
            </> : <h1 className="font-display text-4xl tracking-wide">DASHBOARD</h1>}
          </div>
          <button onClick={()=>setModal(true)} className="hidden md:block btn-primary">⚡ Generate Episode</button>
        </div>

        <div className="glass rounded-xl p-4 mb-6">
          <p className="text-xs text-white/40 mb-2">{lg ? "Switch league:" : "Connect your Sleeper league:"}</p>
          <div className="flex gap-3">
            <input value={lid} onChange={e=>setLid(e.target.value)} onKeyDown={e=>e.key==="Enter"&&connect()}
              placeholder="Paste Sleeper League ID"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#378ADD]/50" />
            <button onClick={connect} disabled={connecting||!lid.trim()} className="btn-primary px-5 text-sm">
              {connecting?"Connecting...":"Connect →"}
            </button>
          </div>
          {connErr && <p className="text-red-400 text-xs mt-2">{connErr}</p>}
          {lg && <p className="text-green-400 text-xs mt-2">✓ Connected: {lg.leagueName}</p>}
        </div>

        {newEp && (
          <div className="glass-blue rounded-2xl p-5 mb-6 border border-[#378ADD]/20">
            <p className="text-green-400 text-xs mb-1">✓ Episode generated</p>
            <h2 className="font-display text-xl tracking-wide mb-1">{newEp.title}</h2>
            <p className="text-white/50 text-sm mb-3">{newEp.teaser}</p>
            <Link href={"/episode/"+newEp.id+"?data="+encodeURIComponent(JSON.stringify(newEp))} className="btn-primary text-sm inline-block">Listen →</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="font-display text-xl tracking-wide text-white/60">EPISODES</h2>
            {episodes.length===0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-white/30 text-sm mb-3">No episodes yet</p>
                <button onClick={()=>setModal(true)} className="btn-primary text-sm">Generate your first episode ⚡</button>
              </div>
            ) : episodes.map(ep=>(
              <Link key={ep.id} href={"/episode/"+ep.id+"?data="+encodeURIComponent(JSON.stringify(ep))} className="glass rounded-xl p-5 flex gap-4 border border-white/5 hover:border-white/15 block">
                <div className="w-12 h-12 rounded-xl bg-[#378ADD]/10 border border-[#378ADD]/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[12px] border-l-[#378ADD] ml-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-1.5">
                    <span className="text-[10px] rounded-full px-2.5 py-0.5 font-medium" style={{background:TC[ep.episodeType]+"22",color:TC[ep.episodeType]}}>{TL[ep.episodeType]}</span>
                    <span className="text-[10px] text-white/25 border border-white/10 rounded-full px-2 py-0.5">{FL[ep.format]}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 truncate">{ep.title}</h3>
                  <p className="text-white/40 text-xs line-clamp-1">{ep.teaser}</p>
                </div>
              </Link>
            ))}
          </div>
          <div>
            <h2 className="font-display text-xl tracking-wide text-white/60 mb-4">STANDINGS</h2>
            <div className="glass rounded-xl p-4 space-y-2">
              {st.length===0 ? <p className="text-white/30 text-xs text-center py-4">Connect your league</p>
              : st.map((t:any,i:number)=>(
                <div key={t.teamId} className="flex items-center gap-2 py-1">
                  <span className="text-xs text-white/20 w-4">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.teamName}</p>
                    <p className="text-[10px] text-white/30 truncate">{t.managerName}</p>
                  </div>
                  <p className="text-xs text-white/50 flex-shrink-0">{t.wins}-{t.losses}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-display text-2xl tracking-wide mb-5">GENERATE EPISODE</h2>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Format</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{id:"sportscenter",icon:"📺",l:"SportsCenter"},{id:"debate",icon:"🔥",l:"Debate"},{id:"podcast",icon:"🎧",l:"Podcast"}].map(f=>(
                    <button key={f.id} onClick={()=>setFmt(f.id)} className={"p-3 rounded-xl text-center text-xs border "+(fmt===f.id?"border-[#378ADD] bg-[#378ADD]/10":"border-white/8 glass text-white/50")}>
                      <span className="block text-lg mb-1">{f.icon}</span>{f.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Episode Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TL).map(([id,label])=>(
                    <button key={id} onClick={()=>setTyp(id)} className={"p-2.5 rounded-lg text-xs border text-left "+(typ===id?"border-[#378ADD] bg-[#378ADD]/10":"border-white/8 glass text-white/50")}>
                      <span className="block mb-0.5" style={{color:TC[id]}}>●</span>{label}
                    </button>
                  ))}
                </div>
              </div>
              {lg && <p className="text-xs text-green-400">✓ Using: {lg.leagueName}</p>}
              {!lg && <p className="text-xs text-yellow-400">⚠ No league connected — will use demo data</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={generate} disabled={gen} className="btn-primary flex-1">{gen?"Generating...":"Generate ⚡"}</button>
            </div>
            {gen && <p className="text-center text-white/30 text-xs mt-3">Writing your script... ~15 seconds</p>}
          </div>
        </div>
      )}
    </div>
  );
}
