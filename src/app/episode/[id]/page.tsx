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
  sportscenter: "The Wire",
};

function MatchupGraphic({ data }: { data: any }) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d]">
        <div className="bg-[#111] px-4 py-2 flex items-center justify-between border-b border-white/5">
          <span className="text-[10px] tracking-widest text-white/30 font-display uppercase">Matchup Result</span>
          <span className="text-[10px] text-[#00C853]">FINAL</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className={`flex-1 text-center ${data.winner === data.team1 ? "opacity-100" : "opacity-40"}`}>
              <div className="w-14 h-14 rounded-full bg-[#00C853]/10 border-2 border-[#00C853]/30 flex items-center justify-center text-xl font-bold text-[#00C853] mx-auto mb-2">
                {data.team1?.charAt(0)}
              </div>
              <p className="text-white text-sm font-bold leading-tight">{data.team1}</p>
              <p className="font-display text-4xl text-white mt-2">{data.score1?.toFixed(1)}</p>
              {data.winner === data.team1 && <span className="text-[10px] text-[#00C853] tracking-widest mt-1 block">WINNER</span>}
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/20 text-xs">VS</span>
              <div className="w-px h-12 bg-white/10" />
            </div>
            <div className={`flex-1 text-center ${data.winner === data.team2 ? "opacity-100" : "opacity-40"}`}>
              <div className="w-14 h-14 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center text-xl font-bold text-orange-400 mx-auto mb-2">
                {data.team2?.charAt(0)}
              </div>
              <p className="text-white text-sm font-bold leading-tight">{data.team2}</p>
              <p className="font-display text-4xl text-white mt-2">{data.score2?.toFixed(1)}</p>
              {data.winner === data.team2 && <span className="text-[10px] text-orange-400 tracking-widest mt-1 block">WINNER</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadlineGraphic({ data }: { data: any }) {
  const neg = { bg: "rgba(231,76,60,0.1)", text: "#E74C3C", border: "rgba(231,76,60,0.3)" };
  const pos = { bg: "rgba(0,200,83,0.1)", text: "#00C853", border: "rgba(0,200,83,0.3)" };
  const neu = { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.7)", border: "rgba(255,255,255,0.1)" };
  const c = data.tone === "negative" ? neg : data.tone === "positive" ? pos : neu;
  const icon = data.tone === "negative" ? "⚠ BREAKING" : data.tone === "positive" ? "★ TOP STORY" : "📊 UPDATE";
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border p-8 text-center" style={{ background: c.bg, borderColor: c.border }}>
        <div className="text-xs tracking-widest mb-3 opacity-50" style={{ color: c.text }}>{icon}</div>
        <p className="font-display text-3xl md:text-4xl tracking-wide leading-tight" style={{ color: c.text }}>{data.text}</p>
      </div>
    </div>
  );
}

function StandingsGraphic({ data }: { data: any }) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d]">
        <div className="bg-[#111] px-4 py-2 border-b border-white/5">
          <span className="text-[10px] tracking-widest text-white/30 font-display uppercase">Team Record</span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#00C853]/10 border-2 border-[#00C853]/30 flex items-center justify-center text-2xl font-bold text-[#00C853]">
              {data.team?.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{data.team}</p>
              <p className="text-white/40 text-sm">{data.wins}W - {data.losses}L</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="font-display text-2xl text-white">{data.wins}-{data.losses}</p>
              <p className="text-white/30 text-xs mt-1">Record</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="font-display text-2xl text-[#00C853]">{data.pointsFor?.toFixed(1)}</p>
              <p className="text-white/30 text-xs mt-1">Points For</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChampionGraphic({ data }: { data: any }) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-[#FFD700]/30 bg-[#FFD700]/5 p-8 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-[#FFD700] text-xs tracking-widest mb-2">PERFORMANCE OF THE WEEK</p>
        <p className="font-display text-3xl text-white tracking-wide">{data.team}</p>
      </div>
    </div>
  );
}

function PredictionGraphic({ data, host }: { data: any; host: string }) {
  const isMarcus = host === "Marcus" || host === "host1";
  const color = isMarcus ? "#00C853" : "#E67E22";
  const name = isMarcus ? "MARCUS COLE" : "TANNER CROSS";
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden">
        <div className="bg-[#111] px-4 py-2 border-b border-white/5">
          <span className="text-[10px] tracking-widest font-display" style={{ color }}>{name} · BOLD PREDICTION</span>
        </div>
        <div className="p-6">
          <p className="font-display text-2xl text-white mb-2">{data.pick}</p>
          <p className="text-white/40 text-sm">{data.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

function NormalGraphic({ host }: { host: string }) {
  const isMarcus = host === "Marcus" || host === "host1";
  const color = isMarcus ? "#00C853" : "#E67E22";
  const initials = isMarcus ? "MC" : "TC";
  const name = isMarcus ? "MARCUS COLE" : "TANNER CROSS";
  const role = isMarcus ? "Lead Anchor" : "Co-Host";
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl border border-white/5 bg-[#0d0d0d] p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ background: color + "15", color, border: "2px solid " + color + "40" }}>
          {initials}
        </div>
        <div>
          <p className="text-xs tracking-widest font-display" style={{ color }}>{name}</p>
          <p className="text-white/30 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}

function GraphicDisplay({ line, episodeColor }: { line: any; episodeColor: string }) {
  const graphic = line?.graphic;
  const host = line?.host || (line?.hostId === "host1" ? "Marcus" : "Tanner");
  if (!graphic || graphic.type === "normal" || !graphic.type) return <NormalGraphic host={host} />;
  switch (graphic.type) {
    case "matchup_result": return <MatchupGraphic data={graphic} />;
    case "headline": return <HeadlineGraphic data={graphic} />;
    case "standings": return <StandingsGraphic data={graphic} />;
    case "champion": return <ChampionGraphic data={graphic} />;
    case "prediction": return <PredictionGraphic data={graphic} host={host} />;
    default: return <NormalGraphic host={host} />;
  }
}

export default function EpisodePage({ params }: { params: { id: string } }) {
  const [episode, setEpisode] = useState<any>(null);
  const [activeLine, setActiveLine] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [talkingHost, setTalkingHost] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [showSegmentCard, setShowSegmentCard] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  const allLines = episode?.script?.segments?.flatMap((s: any, si: number) =>
    s.lines.map((l: any, li: number) => ({
      ...l,
      segmentIndex: si,
      lineIndex: li,
      segmentTitle: s.segmentTitle,
      hostId: l.hostId ? l.hostId : (l.host === "Marcus" ? "host1" : "host2"),
      text: l.text || l.line || "",
    }))
  ) || [];

  const tickerText = [
    "LEAGUEWIRE",
    ...(episode?.script?.segments?.map((s: any) => s.segmentTitle) || []),
    episode?.leagueName || "",
    episode?.title || ""
  ].join("   ·   ");

  useEffect(() => {
    async function loadEpisode() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlData = urlParams.get("data");
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
              })),
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

  async function speakLine(line: any): Promise<void> {
    return new Promise(async (resolve) => {
      try {
        setLoadingAudio(true);
        const hostId = line.hostId || (line.host === "Marcus" ? "host1" : "host2");
        setTalkingHost(hostId);
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: line.text, hostId }),
        });
        if (!res.ok) throw new Error("Audio generation failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); }
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
    for (let i = activeLine; i < allLines.length; i++) {
      if (!playingRef.current) break;
      const line = allLines[i];
      if (i === 0 || allLines[i].segmentTitle !== allLines[i - 1]?.segmentTitle) {
        setShowSegmentCard(line.segmentTitle);
        await new Promise(r => setTimeout(r, 1800));
        setShowSegmentCard(null);
        await new Promise(r => setTimeout(r, 200));
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
    if (playing) { playingRef.current = false; if (audioRef.current) audioRef.current.pause(); }
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
  const currentHost = currentLine?.host || (currentLine?.hostId === "host1" ? "Marcus" : "Tanner");
  const isMarcus = currentHost === "Marcus" || currentLine?.hostId === "host1";

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {showSegmentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center px-8">
            <div className="text-white/20 text-xs tracking-widest mb-4 font-display">NOW COVERING</div>
            <div className="font-display text-5xl md:text-6xl tracking-wide text-white uppercase leading-tight">{showSegmentCard}</div>
            <div className="w-24 h-1 mx-auto mt-6 rounded-full" style={{ background: episodeColor }} />
          </div>
        </div>
      )}

      <nav className="border-b border-white/5 px-6 h-14 flex items-center justify-between bg-[#080808] z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/30 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-white/10">/</span>
          <span className="font-display text-lg tracking-wide">LEAGUE<span className="text-[#00C853]">WIRE</span></span>
        </div>
        <button onClick={() => {
          navigator.clipboard.writeText(window.location.origin + "/episode/" + params.id);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white/60 hover:text-white transition-colors">
          {copied ? "✓ Link Copied!" : "📤 Share Episode"}
        </button>
      </nav>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] rounded-full px-2.5 py-0.5 font-medium border"
              style={{ background: episodeColor + "15", borderColor: episodeColor + "40", color: episodeColor }}>
              {episode.episodeType?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
            <span className="text-[10px] text-white/25 border border-white/10 rounded-full px-2 py-0.5">
              {FORMAT_LABEL[episode.format] || episode.format}
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide mb-1">{episode.title}</h1>
          <p className="text-white/40 text-sm">{episode.teaser}</p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#0a0a0a]">
          <div className="bg-[#111] px-5 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${playing ? "bg-red-500 animate-pulse" : "bg-white/20"}`} />
              <span className="font-display text-xs tracking-widest text-white/50">
                {playing ? "ON AIR" : loadingAudio ? "LOADING..." : "STUDIO"} · {FORMAT_LABEL[episode.format]?.toUpperCase() || "THE WIRE"}
              </span>
            </div>
            <span className="text-white/20 text-xs">{episode.leagueName}</span>
          </div>

          <div className="p-6 md:p-8 min-h-[280px] flex items-center justify-center relative">
            <div className="absolute inset-0 transition-all duration-700" style={{
              background: playing
                ? isMarcus
                  ? "radial-gradient(ellipse at 30% 50%, rgba(0,200,83,0.05) 0%, transparent 60%)"
                  : "radial-gradient(ellipse at 70% 50%, rgba(230,126,34,0.05) 0%, transparent 60%)"
                : "none"
            }} />
            <div className="relative w-full">
              {loadingAudio ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-[#00C853]/30 border-t-[#00C853] rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-white/30 text-sm">Generating audio...</p>
                </div>
              ) : (
                <GraphicDisplay line={currentLine} episodeColor={episodeColor} />
              )}
            </div>
          </div>

          {currentLine && (
            <div className="px-6 pb-4 flex items-center justify-center">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isMarcus ? "border-[#00C853]/30 bg-[#00C853]/5" : "border-orange-500/30 bg-orange-500/5"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${playing ? "animate-pulse" : ""}`}
                  style={{ background: isMarcus ? "#00C853" : "#E67E22" }} />
                <span className="text-xs font-display tracking-wider" style={{ color: isMarcus ? "#00C853" : "#E67E22" }}>
                  {isMarcus ? "MARCUS COLE" : "TANNER CROSS"}
                </span>
                <span className="text-white/20 text-[10px]">· {currentLine.segmentTitle}</span>
              </div>
            </div>
          )}

          {audioError && <p className="text-red-400 text-xs text-center pb-3">{audioError}</p>}

          <div className="px-6 pb-5">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={() => jumpToLine(Math.max(0, activeLine - 1))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">⏮</button>
              <button onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                style={{ background: playing ? "#E74C3C" : episodeColor, boxShadow: `0 0 24px ${playing ? "rgba(231,76,60,0.4)" : episodeColor + "60"}` }}>
                {playing ? <span className="text-white text-xl">⏸</span> : <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white ml-1" />}
              </button>
              <button onClick={() => jumpToLine(Math.min(allLines.length - 1, activeLine + 1))}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">⏭</button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/25 font-display">{activeLine + 1}</span>
              <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${((activeLine + 1) / Math.max(allLines.length, 1)) * 100}%`, background: episodeColor }} />
              </div>
              <span className="text-xs text-white/25 font-display">{allLines.length}</span>
            </div>
          </div>

          <div className="border-t border-white/5 bg-black/40 py-2 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 px-3 py-1 ml-3" style={{ background: episodeColor }}>
                <span className="font-display text-[10px] tracking-widest text-white">BREAKING</span>
              </div>
              <div className="overflow-hidden flex-1">
                <div className="whitespace-nowrap text-white/40 text-xs tracking-wide" style={{ animation: "marquee 25s linear infinite" }}>
                  {tickerText} &nbsp;&nbsp;&nbsp;&nbsp; {tickerText}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-sm tracking-widest text-white/20">FULL SCRIPT</h2>
          {episode.script?.segments?.map((seg: any, si: number) => (
            <div key={si} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3 rounded-full" style={{ background: episodeColor }} />
                <p className="text-[10px] uppercase tracking-widest text-white/30">{seg.segmentTitle}</p>
              </div>
              <div className="space-y-2">
                {seg.lines?.map((line: any, li: number) => {
                  const globalIdx = allLines.findIndex((l: any) => l.segmentIndex === si && l.lineIndex === li);
                  const isActive = globalIdx === activeLine;
                  const host1 = line.hostId === "host1" || line.host === "Marcus";
                  return (
                    <div key={li} onClick={() => jumpToLine(globalIdx)}
                      className={`flex gap-2 cursor-pointer rounded-lg p-2 transition-all ${host1 ? "" : "justify-end"} ${isActive ? "bg-white/5" : "hover:bg-white/3"}`}>
                      {host1 && <div className="w-6 h-6 rounded-full bg-[#1a2744] border border-[#00C853]/30 flex items-center justify-center text-[9px] text-[#00C853] flex-shrink-0 mt-1">MC</div>}
                      <div className={`rounded-lg p-3 max-w-[85%] bg-white/3 border ${host1 ? "rounded-tl-none border-[#00C853]/10" : "rounded-tr-none border-orange-500/10"}`}
                        style={{ borderColor: isActive ? (host1 ? "#00C853" : "#E67E22") + "50" : undefined }}>
                        <span className={`text-[10px] font-medium block mb-1 ${host1 ? "text-[#00C853]" : "text-orange-400"}`}>
                          {host1 ? "Marcus Cole" : "Tanner Cross"}
                        </span>
                        <p className="text-white/80 text-sm leading-relaxed">{line.text}</p>
                      </div>
                      {!host1 && <div className="w-6 h-6 rounded-full bg-[#1a2a1a] border border-orange-500/30 flex items-center justify-center text-[9px] text-orange-400 flex-shrink-0 mt-1">TC</div>}
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
      `}</style>
    </div>
  );
}
