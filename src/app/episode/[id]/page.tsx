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

const TYPE_BREAKING: Record<string, string> = {
  weekly_recap: "FINAL SCORES IN",
  weekly_preview: "MATCHUP PREVIEW",
  matchup_of_the_week: "GAME OF THE WEEK",
  draft_recap: "DRAFT RESULTS IN",
  preseason: "SEASON KICKOFF",
  playoff: "PLAYOFF PREVIEW",
  playoff_recap: "PLAYOFF RESULTS",
  championship: "CHAMPIONSHIP WEEK",
  championship_recap: "WE HAVE A CHAMPION",
  legacy: "LEAGUE HISTORY",
  offseason: "SEASON IN THE BOOKS",
};

const FORMAT_LABEL: Record<string, string> = {
  thewire: "The Wire",
  debate: "Debate Show",
  podcast: "Podcast",
  sportscenter: "The Wire",
};

function MatchupGraphic({ data, color }: { data: any; color: string }) {
  const w1 = data.winner === data.team1;
  return (
    <div className="w-full">
      <div className="text-[10px] tracking-widest text-white/30 font-display mb-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        MATCHUP RESULT
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-5 border transition-all ${w1 ? "border-[#00C853]/40 bg-[#00C853]/8" : "border-white/5 bg-white/3 opacity-50"}`}>
          <div className="font-display text-4xl mb-2" style={{ color: w1 ? "#00C853" : "white" }}>
            {data.score1?.toFixed(1)}
          </div>
          <div className="text-white text-sm font-medium leading-tight">{data.team1}</div>
          {w1 && <div className="text-[10px] tracking-widest mt-2" style={{ color: "#00C853" }}>▲ WINNER</div>}
        </div>
        <div className={`rounded-xl p-5 border transition-all ${!w1 ? "border-[#00C853]/40 bg-[#00C853]/8" : "border-white/5 bg-white/3 opacity-50"}`}>
          <div className="font-display text-4xl mb-2" style={{ color: !w1 ? "#00C853" : "white" }}>
            {data.score2?.toFixed(1)}
          </div>
          <div className="text-white text-sm font-medium leading-tight">{data.team2}</div>
          {!w1 && <div className="text-[10px] tracking-widest mt-2" style={{ color: "#00C853" }}>▲ WINNER</div>}
        </div>
      </div>
    </div>
  );
}

function HeadlineGraphic({ data, color }: { data: any; color: string }) {
  const isNeg = data.tone === "negative";
  const isPos = data.tone === "positive";
  const c = isNeg ? "#E74C3C" : isPos ? color : "#FFD700";
  const label = isNeg ? "⚡ ALERT" : isPos ? "★ STORY" : "📊 UPDATE";
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl" style={{ border: `1px solid ${c}30` }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: c }} />
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{ background: c }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c}08 0%, transparent 60%)` }} />
        <div className="relative p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-[10px] font-display tracking-widest text-white"
            style={{ background: c }}>
            {label}
          </div>
          <p className="font-display text-3xl md:text-4xl tracking-wide leading-tight text-white">{data.text}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-0.5 w-8 rounded-full" style={{ background: c }} />
            <span className="text-[10px] tracking-widest font-display" style={{ color: c, opacity: 0.5 }}>LEAGUEWIRE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StandingsGraphic({ data, color }: { data: any; color: string }) {
  return (
    <div className="w-full">
      <div className="text-[10px] tracking-widest text-white/30 font-display mb-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        TEAM RECORD
      </div>
      <div className="rounded-xl border border-white/8 bg-white/3 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold text-xl">{data.team}</p>
            <p className="text-white/40 text-sm mt-0.5">{data.wins}W — {data.losses}L</p>
          </div>
          <div className="font-display text-3xl" style={{ color }}>{data.wins}-{data.losses}</div>
        </div>
        {data.pointsFor && (
          <div className="pt-4 border-t border-white/8">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs tracking-widest">POINTS SCORED</span>
              <span className="font-display text-xl" style={{ color }}>{data.pointsFor?.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChampionGraphic({ data, color }: { data: any; color: string }) {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-[#FFD700]/30">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.08) 0%, transparent 60%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-[#FFD700]" />
        <div className="relative p-6 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <div className="text-[10px] tracking-widest text-[#FFD700] mb-2 font-display">PERFORMANCE OF THE WEEK</div>
          <p className="font-display text-3xl text-white tracking-wide">{data.team}</p>
        </div>
      </div>
    </div>
  );
}

function PredictionGraphic({ data, host }: { data: any; host: string }) {
  const isMarcus = host === "Marcus" || host === "host1";
  const color = isMarcus ? "#00C853" : "#E67E22";
  const name = isMarcus ? "MARCUS COLE" : "TANNER CROSS";
  return (
    <div className="w-full">
      <div className="text-[10px] tracking-widest text-white/30 font-display mb-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        {name} · BOLD PREDICTION
      </div>
      <div className="rounded-xl border bg-white/3 p-5" style={{ borderColor: color + "30" }}>
        <p className="font-display text-2xl text-white mb-2">{data.pick}</p>
        <p className="text-white/40 text-sm leading-relaxed">{data.reasoning}</p>
      </div>
    </div>
  );
}

function NormalGraphic({ host, segmentTitle }: { host: string; segmentTitle?: string }) {
  const isMarcus = host === "Marcus" || host === "host1";
  const color = isMarcus ? "#00C853" : "#E67E22";
  const name = isMarcus ? "MARCUS COLE" : "TANNER CROSS";
  const role = isMarcus ? "LEAD ANCHOR" : "CO-HOST";
  return (
    <div className="w-full">
      <div className="rounded-xl border border-white/5 bg-white/3 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-[10px] tracking-widest mb-1" style={{ color, opacity: 0.7 }}>{role}</p>
            <p className="font-display text-2xl text-white">{name}</p>
            {segmentTitle && <p className="text-white/30 text-xs mt-1 tracking-widest uppercase">{segmentTitle}</p>}
          </div>
          <div className="flex gap-1 items-end h-10">
            {[3,6,4,8,5,7,3,5,8,4,6,3].map((h, i) => (
              <div key={i} className="w-1 rounded-full animate-pulse"
                style={{ height: h * 4 + "px", background: color, opacity: 0.5, animationDelay: i * 0.08 + "s", animationDuration: "0.8s" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphicDisplay({ line, episodeColor }: { line: any; episodeColor: string }) {
  const graphic = line?.graphic;
  const host = line?.host || (line?.hostId === "host1" ? "Marcus" : "Tanner");
  const segTitle = line?.segmentTitle;
  if (!graphic || graphic.type === "normal" || !graphic.type) return <NormalGraphic host={host} segmentTitle={segTitle} />;
  switch (graphic.type) {
    case "matchup_result": return <MatchupGraphic data={graphic} color={episodeColor} />;
    case "headline": return <HeadlineGraphic data={graphic} color={episodeColor} />;
    case "standings": return <StandingsGraphic data={graphic} color={episodeColor} />;
    case "champion": return <ChampionGraphic data={graphic} color={episodeColor} />;
    case "prediction": return <PredictionGraphic data={graphic} host={host} />;
    default: return <NormalGraphic host={host} segmentTitle={segTitle} />;
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
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    };
  }, []);

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

  const episodeTickerItems = episode?.script?.segments?.map((s: any) =>
    s.lines?.[0]?.text?.slice(0, 60) || s.segmentTitle
  ) || [];
  const tickerText = episodeTickerItems.join("   ·   ");

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
          setEpisode({ ...dbEpisode, episodeType: dbEpisode.episode_type, leagueName: dbEpisode.league_name, generatedAt: dbEpisode.generated_at, script });
        }
      } catch (e) { console.error(e); }
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
        if (!res.ok) throw new Error("Audio failed");
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
    setFinished(false);
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
    setFinished(true);
  }, [playing, activeLine, allLines]);

  function restartEpisode() {
    if (audioRef.current) audioRef.current.pause();
    setActiveLine(0);
    setPlaying(false);
    setTalkingHost(null);
    setFinished(false);
    playingRef.current = false;
  }

  function jumpToLine(index: number) {
    if (playing) { playingRef.current = false; if (audioRef.current) audioRef.current.pause(); }
    setActiveLine(index);
    setPlaying(false);
    setTalkingHost(null);
    setFinished(false);
  }

  // Skip forward/back 5 lines
  function skipForward() { jumpToLine(Math.min(allLines.length - 1, activeLine + 5)); }
  function skipBack() { jumpToLine(Math.max(0, activeLine - 5)); }

  if (!episode) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-2xl tracking-wider mb-4">LEAGUE<span className="text-[#00C853]">WIRE</span></div>
          <div className="w-8 h-8 border-2 border-[#00C853]/30 border-t-[#00C853] rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentLine = allLines[activeLine];
  const episodeColor = TYPE_COLOR[episode.episodeType] || "#00C853";
  const breakingLabel = TYPE_BREAKING[episode.episodeType] || "BREAKING";
  const isMarcus = currentLine?.host === "Marcus" || currentLine?.hostId === "host1";
  const hostColor = isMarcus ? "#00C853" : "#E67E22";
  const hostName = isMarcus ? "MARCUS COLE" : "TANNER CROSS";
  const progress = ((activeLine + 1) / Math.max(allLines.length, 1)) * 100;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">

      {/* Segment Card Overlay */}
      {showSegmentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="text-center px-8 w-full max-w-lg">
            <div className="h-px w-full mb-8" style={{ background: `linear-gradient(90deg, transparent, ${episodeColor}, transparent)` }} />
            <div className="text-[10px] tracking-widest text-white/30 font-display mb-4">NOW COVERING</div>
            <div className="font-display text-4xl md:text-5xl tracking-wide text-white uppercase leading-tight">{showSegmentCard}</div>
            <div className="h-px w-full mt-8" style={{ background: `linear-gradient(90deg, transparent, ${episodeColor}, transparent)` }} />
          </div>
        </div>
      )}

      {/* Nav */}
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

        {/* Episode header */}
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

        {/* BROADCAST STAGE */}
        <div className="rounded-2xl overflow-hidden border border-white/8" style={{ background: "#080808" }}>

          {/* Top status bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5" style={{ background: "#0d0d0d" }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${playing ? "animate-pulse" : ""}`}
                  style={{ background: playing ? "#E74C3C" : "rgba(255,255,255,0.2)" }} />
                <span className="font-display text-[10px] tracking-widest text-white/40">
                  {playing ? "ON AIR" : finished ? "REPLAY" : "READY"}
                </span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[10px] text-white/25">{FORMAT_LABEL[episode.format] || "THE WIRE"}</span>
            </div>
            <span className="text-[10px] text-white/20 tracking-wide">{episode.leagueName}</span>
          </div>

          {/* Main graphic area */}
          <div className="relative p-5 md:p-7 min-h-[260px] flex flex-col justify-center">
            {/* Subtle background */}
            <div className="absolute inset-0 transition-all duration-500" style={{
              background: playing
                ? `radial-gradient(ellipse at ${isMarcus ? "20%" : "80%"} 50%, ${hostColor}06 0%, transparent 60%)`
                : "none"
            }} />

            {/* Active line indicator */}
            {playing && currentLine && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="flex gap-0.5 items-center">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-0.5 rounded-full animate-pulse"
                      style={{ height: (2 + i) * 3 + "px", background: hostColor, animationDelay: i * 0.1 + "s" }} />
                  ))}
                </div>
              </div>
            )}

            <div className="relative">
              {loadingAudio ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-white/10 rounded-full animate-spin mx-auto mb-3"
                    style={{ borderTopColor: episodeColor }} />
                  <p className="text-white/20 text-xs tracking-widest">GENERATING AUDIO</p>
                </div>
              ) : (
                <div key={activeLine} style={{ animation: "fadeIn 0.3s ease" }}>
                  <GraphicDisplay line={currentLine} episodeColor={episodeColor} />
                </div>
              )}
            </div>
          </div>

          {audioError && <p className="text-red-400 text-xs text-center pb-2">{audioError}</p>}

          {/* Progress bar */}
          <div className="h-0.5 bg-white/5">
            <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: episodeColor }} />
          </div>

          {/* Controls */}
          <div className="px-5 py-4" style={{ background: "#0d0d0d" }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* Skip back */}
              <button onClick={skipBack}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-colors text-xs">
                ⏪
              </button>
              {/* Prev line */}
              <button onClick={() => jumpToLine(Math.max(0, activeLine - 1))}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                ⏮
              </button>
              {/* Play/Pause */}
              <button onClick={togglePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{ background: playing ? "#E74C3C" : episodeColor, boxShadow: `0 0 20px ${playing ? "rgba(231,76,60,0.3)" : episodeColor + "50"}` }}>
                {playing
                  ? <span className="text-white text-lg">⏸</span>
                  : <div className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[14px] border-l-white ml-1" />
                }
              </button>
              {/* Next line */}
              <button onClick={() => jumpToLine(Math.min(allLines.length - 1, activeLine + 1))}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                ⏭
              </button>
              {/* Skip forward */}
              <button onClick={skipForward}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex items-center justify-center text-white/30 hover:text-white transition-colors text-xs">
                ⏩
              </button>
            </div>

            {/* Progress counter */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-white/20 font-display">{activeLine + 1}</span>
              <div className="flex-1 h-px bg-white/5 relative">
                <div className="absolute top-0 left-0 h-full transition-all duration-300" style={{ width: `${progress}%`, background: episodeColor }} />
              </div>
              <span className="text-[10px] text-white/20 font-display">{allLines.length}</span>
            </div>

            {finished && (
              <button onClick={restartEpisode}
                className="w-full py-2 rounded-lg text-xs font-display tracking-widest border transition-all"
                style={{ borderColor: episodeColor + "30", color: episodeColor, background: episodeColor + "08" }}>
                ↺ WATCH AGAIN
              </button>
            )}
          </div>

          {/* Breaking news ticker */}
          <div className="border-t border-white/5 overflow-hidden" style={{ background: "#050505" }}>
            <div className="flex items-stretch">
              <div className="flex-shrink-0 flex items-center px-4 py-2"
                style={{ background: episodeColor }}>
                <span className="font-display text-[10px] tracking-widest text-white whitespace-nowrap">{breakingLabel}</span>
              </div>
              <div className="overflow-hidden flex-1 flex items-center py-2">
                <div className="whitespace-nowrap text-white/30 text-[11px] tracking-wide"
                  style={{ animation: "marquee 30s linear infinite" }}>
                  {tickerText} &nbsp;&nbsp;&nbsp; · &nbsp;&nbsp;&nbsp; {tickerText}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Script */}
        <div className="space-y-3">
          <h2 className="font-display text-[10px] tracking-widest text-white/20">FULL SCRIPT</h2>
          {episode.script?.segments?.map((seg: any, si: number) => (
            <div key={si} className="rounded-xl border border-white/5 bg-white/2 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2" style={{ background: "#0d0d0d" }}>
                <div className="w-1 h-3 rounded-full" style={{ background: episodeColor }} />
                <p className="text-[10px] uppercase tracking-widest text-white/30">{seg.segmentTitle}</p>
              </div>
              <div className="p-3 space-y-2">
                {seg.lines?.map((line: any, li: number) => {
                  const globalIdx = allLines.findIndex((l: any) => l.segmentIndex === si && l.lineIndex === li);
                  const isActive = globalIdx === activeLine;
                  const h1 = line.hostId === "host1" || line.host === "Marcus";
                  const lc = h1 ? "#00C853" : "#E67E22";
                  return (
                    <div key={li} onClick={() => jumpToLine(globalIdx)}
                      className={`flex gap-2 cursor-pointer rounded-lg p-2 transition-all ${h1 ? "" : "justify-end"} ${isActive ? "bg-white/5" : "hover:bg-white/3"}`}>
                      {h1 && <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-1"
                        style={{ background: lc + "15", color: lc, border: "1px solid " + lc + "30" }}>MC</div>}
                      <div className={`rounded-lg p-3 max-w-[85%] ${h1 ? "rounded-tl-none" : "rounded-tr-none"}`}
                        style={{
                          background: isActive ? lc + "10" : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isActive ? lc + "40" : "rgba(255,255,255,0.05)"}`
                        }}>
                        <span className="text-[9px] font-medium block mb-1" style={{ color: lc }}>
                          {h1 ? "Marcus Cole" : "Tanner Cross"}
                        </span>
                        <p className="text-white/70 text-sm leading-relaxed">{line.text}</p>
                      </div>
                      {!h1 && <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-1"
                        style={{ background: lc + "15", color: lc, border: "1px solid " + lc + "30" }}>TC</div>}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
