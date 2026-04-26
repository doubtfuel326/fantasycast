"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

const TYPE_COLOR: Record<string, string> = {
  weekly_recap: "#00C853",
  weekly_preview: "#00C853",
  matchup_of_the_week: "#00C853",
  draft_recap: "#378ADD",
  preseason: "#F39C12",
  playoff: "#E74C3C",
  playoff_recap: "#E74C3C",
  championship: "#FFD700",
  championship_recap: "#FFD700",
  legacy: "#9B59B6",
  offseason: "#1ABC9C",
};

const FORMAT_LABEL: Record<string, string> = {
  thewire: "The Wire",
  debate: "Debate Show",
  podcast: "Podcast",
};

export default function EpisodePage({ params }: { params: { id: string } }) {
  const [episode, setEpisode] = useState<any>(null);
  const [activeLine, setActiveLine] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [talkingHost, setTalkingHost] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [showSegmentCard, setShowSegmentCard] = useState<string | null>(null);
  const [tickerOffset, setTickerOffset] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const tickerRef = useRef<any>(null);

  const allLines = episode?.script?.segments?.flatMap((s: any, si: number) =>
    s.lines.map((l: any, li: number) => ({
      ...l,
      segmentIndex: si,
      lineIndex: li,
      segmentTitle: s.segmentTitle,
      hostId: l.hostId ? l.hostId : (l.host === "Marcus" || l.host === "marcus" ? "host1" : "host2"),
      text: l.text || l.line || "",
    }))
  ) || [];

  // Generate ticker headlines from episode
  const tickerItems = episode?.script?.segments?.flatMap((s: any) =>
    s.lines?.slice(0, 1).map((l: any) => `${s.segmentTitle}: ${l.text || l.line || ""}`.slice(0, 80) + "...")
  ) || ["LeagueWire — Your League's Show", "Marcus Cole & Tanner Cross", "AI-Powered Fantasy Sports Broadcast"];

  useEffect(() => {
    async function loadEpisode() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlData = urlParams.get('data');
        if (urlData) {
          const ep = JSON.parse(decodeURIComponent(urlData));
          setEpisode({ ...ep, episodeType: ep.episodeType || ep.episode_type });
          return;
        }
        const { getEpisodeById } = await import("@/lib/supabase");
        const dbEpisode = await getEpisodeById(params.id);
        if (dbEpisode) {
          const script = dbEpisode.script;
          if (script?.segments) {
            script.segments = script.segments.map((seg: any) => ({
              ...seg,
              lines: seg.lines.map((l: any) => ({
                ...l,
                hostId: l.hostId || (l.host === "Marcus" ? "host1" : "host2"),
                text: l.text || l.line || "",
              }))
            }));
          }
          setEpisode({
            ...dbEpisode,
            episodeType: dbEpisode.episode_type,
            leagueName: dbEpisode.league_name,
            generatedAt: dbEpisode.generated_at,
            script,
          });
        }
      } catch (e) {
        console.error("Failed to load episode", e);
      }
    }
    loadEpisode();
  }, [params.id]);

  // Ticker animation
  useEffect(() => {
    tickerRef.current = setInterval(() => {
      setTickerOffset(prev => {
        const max = tickerItems.join(" · ").length * 8;
        return prev >= max ? 0 : prev + 1;
      });
    }, 30);
    return () => clearInterval(tickerRef.current);
  }, [tickerItems.length]);

  async function speakLine(line: any): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        setLoadingAudio(true);
        setTalkingHost(line.hostId);
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.text, hostId: line.hostId }),
        });
        if (!res.ok) throw new Error("Audio generation failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        setLoadingAudio(false);
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => resolve();
        audio.play();
      } catch {
        setLoadingAudio(false);
        setAudioError("Audio unavailable");
        setTimeout(() => setAudioError(""), 3000);
        resolve();
      }
    });
  }

  const togglePlay = useCallback(async () => {
    if (playing) {
      playingRef.current = false;
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
      setTalkingHost(null);
      return;
    }
    setPlaying(true);
    playingRef.current = true;
    let startIndex = activeLine;
    // Show segment card on segment start
    for (let i = startIndex; i < allLines.length; i++) {
      if (!playingRef.current) break;
      const line = allLines[i];
      // Show segment title card when segment changes
      if (i === 0 || allLines[i].segmentTitle !== allLines[i-1]?.segmentTitle) {
        setShowSegmentCard(line.segmentTitle);
        await new Promise(r => setTimeout(r, 1500));
        setShowSegmentCard(null);
        await new Promise(r => setTimeout(r, 300));
      }
      if (!playingRef.current) break;
      setActiveLine(i);
      await speakLine(line);
    }
    setPlaying(false);
    setTalkingHost(null);
    playingRef.current = false;
  }, [playing, activeLine, allLines]);

  function jumpToLine(index: number) {
    if (playing) {
      playingRef.current = false;
      if (audioRef.current) audioRef.current.pause();
    }
    setActiveLine(index);
    setPlaying(false);
    setTalkingHost(null);
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-2xl tracking-wider mb-4">LEAGUE<span className="text-[#00C853]">WIRE</span></div>
          <p className="text-white/40 text-sm mb-4">Loading broadcast...</p>
          <div className="w-8 h-8 border-2 border-[#00C853]/30 border-t-[#00C853] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentLine = allLines[activeLine];
  const episodeColor = TYPE_COLOR[episode.episodeType] || "#00C853";
  const tickerText = tickerItems.join("   ·   ");

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">

      {/* Segment Card Overlay */}
      {showSegmentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-white/20 text-xs tracking-widest mb-3 uppercase">Now Covering</div>
            <div className="font-display text-5xl tracking-wide text-white uppercase">{showSegmentCard}</div>
            <div className="w-24 h-1 bg-[#00C853] mx-auto mt-4 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Top Nav Bar */}
      <nav className="border-b border-white/5 px-6 h-14 flex items-center justify-between bg-[#080808] flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/30 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-white/10">/</span>
          <span className="font-display text-lg tracking-wide">LEAGUE<span className="text-[#00C853]">WIRE</span></span>
        </div>
        <button
          onClick={() => {
            const cleanUrl = window.location.origin + "/episode/" + params.id;
            navigator.clipboard.writeText(cleanUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          {copied ? "✓ Link Copied!" : "📤 Share Episode"}
        </button>
      </nav>

      {/* BROADCAST STAGE */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6 gap-4">

        {/* Broadcast Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border`}
              style={{ background: episodeColor + "15", borderColor: episodeColor + "40", color: episodeColor }}>
              {episode.episodeType?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </div>
            <div className="text-white/20 text-xs border border-white/10 rounded-full px-2 py-0.5">
              {FORMAT_LABEL[episode.format]}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${playing ? "bg-red-500 animate-pulse" : "bg-white/20"}`} />
            <span className="text-white/30 text-xs tracking-widest font-display">
              {playing ? "ON AIR" : loadingAudio ? "LOADING" : "STUDIO"}
            </span>
          </div>
        </div>

        {/* Episode Title */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-1">{episode.title}</h1>
          <p className="text-white/40 text-sm">{episode.teaser}</p>
        </div>

        {/* Main Broadcast Area */}
        <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-[#0a0a0a]"
          style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #080808 100%)" }}>

          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(0,200,83,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }} />

          {/* Glow effect behind active host */}
          {talkingHost && (
            <div className="absolute inset-0 transition-all duration-500"
              style={{
                background: talkingHost === "host1"
                  ? "radial-gradient(ellipse at 35% 50%, rgba(0,200,83,0.06) 0%, transparent 60%)"
                  : "radial-gradient(ellipse at 65% 50%, rgba(230,126,34,0.06) 0%, transparent 60%)"
              }} />
          )}

          <div className="relative p-6 md:p-10">

            {/* Hosts */}
            <div className="flex items-center justify-center gap-8 md:gap-20 mb-8">

              {/* Marcus */}
              <div className="text-center flex-1">
                <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-3">
                  {talkingHost === "host1" && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-[#00C853]/60 animate-pulse" />
                      <div className="absolute -inset-2 rounded-full border border-[#00C853]/20 animate-ping" />
                    </>
                  )}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="48" fill="#1a2744" />
                    <circle cx="50" cy="50" r="46" fill="#1e2d52" />
                    <ellipse cx="50" cy="85" rx="30" ry="20" fill="#142040" />
                    <rect x="42" y="65" width="16" height="25" fill="#102035" />
                    <polygon points="50,63 47,72 50,78 53,72" fill="#00C853" />
                    <ellipse cx="50" cy="40" rx="22" ry="25" fill="#3d2b1f" />
                    <ellipse cx="42" cy="37" rx="3" ry="3.5" fill="#fff" />
                    <ellipse cx="58" cy="37" rx="3" ry="3.5" fill="#fff" />
                    <circle cx="43" cy="37" r="1.8" fill="#1a1a1a" />
                    <circle cx="59" cy="37" r="1.8" fill="#1a1a1a" />
                    <path d="M39 33 Q42 31 45 33" stroke="#2a1a0e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M55 33 Q58 31 61 33" stroke="#2a1a0e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <ellipse cx="50" cy="43" rx="2" ry="2.5" fill="#2e1e12" />
                    <path d={talkingHost === "host1" ? "M 40 52 Q 50 58 60 52" : "M 40 51 Q 50 55 60 51"} stroke="#1a0e08" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <ellipse cx="27" cy="40" rx="4" ry="6" fill="#3d2b1f" />
                    <ellipse cx="73" cy="40" rx="4" ry="6" fill="#3d2b1f" />
                  </svg>
                </div>
                {/* Lower third */}
                <div className={`transition-all duration-300 ${talkingHost === "host1" ? "opacity-100" : "opacity-40"}`}>
                  <div className="inline-block bg-[#00C853] px-3 py-0.5 mb-1">
                    <p className="font-display text-xs tracking-wider text-white">MARCUS COLE</p>
                  </div>
                  <p className="text-[10px] text-white/30 tracking-widest">LEAD ANCHOR</p>
                </div>
              </div>

              {/* VS divider */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-px h-16 bg-white/10" />
                <span className="text-white/10 text-xs font-display">VS</span>
                <div className="w-px h-16 bg-white/10" />
              </div>

              {/* Tanner */}
              <div className="text-center flex-1">
                <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-3">
                  {talkingHost === "host2" && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-orange-500/60 animate-pulse" />
                      <div className="absolute -inset-2 rounded-full border border-orange-500/20 animate-ping" />
                    </>
                  )}
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="48" fill="#1a2a1a" />
                    <circle cx="50" cy="50" r="46" fill="#1e301e" />
                    <ellipse cx="50" cy="85" rx="30" ry="20" fill="#152015" />
                    <rect x="42" y="65" width="16" height="25" fill="#111d11" />
                    <polygon points="50,63 47,72 50,78 53,72" fill="#E67E22" />
                    <ellipse cx="50" cy="40" rx="22" ry="25" fill="#d4956a" />
                    <ellipse cx="50" cy="18" rx="22" ry="8" fill="#4a2800" />
                    <rect x="28" y="18" width="44" height="6" fill="#4a2800" />
                    <ellipse cx="42" cy="37" rx="3" ry="3.5" fill="#fff" />
                    <ellipse cx="58" cy="37" rx="3" ry="3.5" fill="#fff" />
                    <circle cx="43" cy="37" r="1.8" fill="#2a1a0a" />
                    <circle cx="59" cy="37" r="1.8" fill="#2a1a0a" />
                    <path d="M38 32 Q42 31 46 32" stroke="#4a2800" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M54 32 Q58 31 62 32" stroke="#4a2800" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <ellipse cx="50" cy="43" rx="2.5" ry="3" fill="#b87040" />
                    <path d={talkingHost === "host2" ? "M 40 52 Q 50 59 60 52" : "M 40 51 Q 50 54 62 50"} stroke="#7a3a10" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <ellipse cx="27" cy="40" rx="4" ry="6" fill="#d4956a" />
                    <ellipse cx="73" cy="40" rx="4" ry="6" fill="#d4956a" />
                  </svg>
                </div>
                <div className={`transition-all duration-300 ${talkingHost === "host2" ? "opacity-100" : "opacity-40"}`}>
                  <div className="inline-block bg-[#E67E22] px-3 py-0.5 mb-1">
                    <p className="font-display text-xs tracking-wider text-white">TANNER CROSS</p>
                  </div>
                  <p className="text-[10px] text-white/30 tracking-widest">CO-HOST</p>
                </div>
              </div>
            </div>

            {/* Current line display */}
            <div className="relative rounded-xl border border-white/8 bg-black/30 p-5 min-h-[90px] flex items-center justify-center text-center mb-5 overflow-hidden">
              {/* Waveform decoration when playing */}
              {playing && (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-0.5 h-6 opacity-20">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-1 rounded-t-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        background: talkingHost === "host1" ? "#00C853" : "#E67E22",
                        animationDelay: `${i * 0.05}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                      }} />
                  ))}
                </div>
              )}
              {loadingAudio ? (
                <p className="text-white/40 text-sm animate-pulse">Generating audio...</p>
              ) : currentLine ? (
                <div className="relative">
                  <p className="text-xs font-medium mb-2 tracking-widest uppercase"
                    style={{ color: currentLine.hostId === "host1" ? "#00C853" : "#E67E22" }}>
                    {currentLine.hostId === "host1" ? "Marcus Cole" : "Tanner Cross"} · {currentLine.segmentTitle}
                  </p>
                  <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-lg">"{currentLine.text}"</p>
                </div>
              ) : (
                <p className="text-white/20 text-sm">Press play to begin the broadcast</p>
              )}
            </div>

            {audioError && <p className="text-red-400 text-xs text-center mb-3">{audioError}</p>}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <button onClick={() => jumpToLine(Math.max(0, activeLine - 1))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors text-lg">⏮</button>
              <button onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg"
                style={{ background: playing ? "#E74C3C" : "#00C853", boxShadow: playing ? "0 0 20px rgba(231,76,60,0.4)" : "0 0 20px rgba(0,200,83,0.4)" }}>
                {playing ? (
                  <span className="text-white text-xl">⏸</span>
                ) : (
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white ml-1" />
                )}
              </button>
              <button onClick={() => jumpToLine(Math.min(allLines.length - 1, activeLine + 1))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors text-lg">⏭</button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/25 font-display">{activeLine + 1}</span>
              <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((activeLine + 1) / Math.max(allLines.length, 1)) * 100}%`,
                    background: episodeColor
                  }} />
              </div>
              <span className="text-xs text-white/25 font-display">{allLines.length}</span>
            </div>
          </div>

          {/* Scrolling ticker */}
          <div className="border-t border-white/8 bg-black/50 py-2 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-[#00C853] px-3 py-1 ml-4">
                <span className="font-display text-xs tracking-widest text-white">BREAKING</span>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="whitespace-nowrap text-white/50 text-xs tracking-wide animate-marquee">
                  {tickerText} &nbsp;&nbsp;&nbsp; {tickerText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* League info bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-white/30 text-xs">{episode.leagueName}</span>
          <span className="text-white/20 text-xs">
            {episode.generatedAt ? new Date(episode.generatedAt).toLocaleDateString() : ""}
          </span>
        </div>

        {/* Full Script */}
        <div className="space-y-3">
          <h2 className="font-display text-lg tracking-wide text-white/30">FULL SCRIPT</h2>
          {episode.script?.segments?.map((seg: any, si: number) => (
            <div key={si} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full" style={{ background: episodeColor }} />
                <p className="text-xs uppercase tracking-widest text-white/40">{seg.segmentTitle}</p>
              </div>
              <div className="space-y-2">
                {seg.lines?.map((line: any, li: number) => {
                  const globalIdx = allLines.findIndex((l: any) => l.segmentIndex === si && l.lineIndex === li);
                  const isActive = globalIdx === activeLine;
                  const isHost1 = line.hostId === "host1";
                  return (
                    <div key={li} onClick={() => jumpToLine(globalIdx)}
                      className={`flex gap-2 cursor-pointer rounded-lg p-2 transition-all ${isHost1 ? "" : "justify-end"} ${isActive ? "bg-white/5" : "hover:bg-white/3"}`}>
                      {isHost1 && (
                        <div className="w-6 h-6 rounded-full bg-[#1a2744] border border-[#00C853]/30 flex items-center justify-center text-[9px] text-[#00C853] flex-shrink-0 mt-1">MC</div>
                      )}
                      <div className={`rounded-lg p-3 max-w-[85%] bg-white/3 border ${isHost1 ? "rounded-tl-none border-[#00C853]/10" : "rounded-tr-none border-orange-500/10"}`}
                        style={{ borderColor: isActive ? (isHost1 ? "#00C853" : "#E67E22") + "40" : undefined }}>
                        <span className={`text-[10px] font-medium block mb-1 ${isHost1 ? "text-[#00C853]" : "text-orange-400"}`}>
                          {isHost1 ? "Marcus Cole" : "Tanner Cross"}
                        </span>
                        <p className="text-white/80 text-sm leading-relaxed">{line.text}</p>
                      </div>
                      {!isHost1 && (
                        <div className="w-6 h-6 rounded-full bg-[#1a2a1a] border border-orange-500/30 flex items-center justify-center text-[9px] text-orange-400 flex-shrink-0 mt-1">TC</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
