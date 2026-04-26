"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// PUBLIC EPISODE PAGE - no login required, anyone with the link can view

const EMOTION_COLORS: Record<string, string> = {
  neutral: "#00C853",
  excited: "#F39C12",
  shocked: "#E74C3C",
  laughing: "#27AE60",
  serious: "#9B59B6",
};

const TYPE_COLOR: Record<string, string> = {
  weekly_recap: "#27AE60",
  draft_recap: "#00C853",
  preseason: "#F39C12",
  playoff: "#E74C3C",
  legacy: "#9B59B6",
  offseason: "#1ABC9C",
};

const FORMAT_LABEL: Record<string, string> = {
  sportscenter: "SportsCenter",
  debate: "Debate Show",
  podcast: "Podcast",
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const { getEpisodeById } = await import("@/lib/supabase");
    const episode = await getEpisodeById(params.id);
    if (!episode) return { title: "LeagueWire Episode" };

    const title = episode.script?.title || "LeagueWire Episode";
    const leagueName = episode.league_name || "Fantasy League";
    const teaser = episode.script?.teaser || "Your league\'s AI-powered broadcast";

    return {
      title: `${title} | LeagueWire`,
      description: teaser,
      openGraph: {
        title: `${title}`,
        description: `${leagueName} · ${teaser}`,
        url: \`https://www.leaguewire.net/episode/${params.id}\`,
        siteName: "LeagueWire",
        images: [
          {
            url: \`https://www.leaguewire.net/og-episode.png\`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title}`,
        description: `${leagueName} · ${teaser}`,
        images: [\`https://www.leaguewire.net/og-episode.png\`],
      },
    };
  } catch {
    return { title: "LeagueWire Episode" };
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    async function loadEpisode() {
      try {
        // First try URL query parameter (most reliable — no DB needed)
        const urlParams = new URLSearchParams(window.location.search);
        const urlData = urlParams.get('data');
        if (urlData) { setEpisode(JSON.parse(decodeURIComponent(urlData))); return; }

        // Try loading from Supabase database
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
          return;
        }

      // Fall back to localStorage
      for (const key of [`fcast_ep_${params.id}`, `leaguewire_episode_${params.id}`, `fc_episode_${params.id}`]) {
        const saved = localStorage.getItem(key);
        if (saved) { setEpisode(JSON.parse(saved)); return; }
      }
      for (const listKey of ["fcast_episodes","leaguewire_episodes","fc_episodes"]) {
        const list = localStorage.getItem(listKey);
        if (list) {
          const eps = JSON.parse(list);
          const found = eps.find((e: any) => e.id === params.id);
          if (found) { setEpisode(found); return; }
        }
      }
    } catch {}
    }
    loadEpisode();
  }, [params.id]);

  const allLines = episode?.script?.segments?.flatMap((s: any, si: number) =>
    s.lines.map((l: any, li: number) => ({
      ...l,
      segmentIndex: si,
      lineIndex: li,
      segmentTitle: s.segmentTitle,
      hostId: l.hostId || (l.host === "Marcus" ? "host1" : "host2"),
      text: l.text || l.line || "",
    }))
  ) || [];

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

        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };

        audio.onerror = () => {
          resolve();
        };

        audio.play();
      } catch (err) {
        setLoadingAudio(false);
        setAudioError("Audio unavailable — check ElevenLabs API key");
        resolve();
      }
    });
  }

  async function playFromLine(startIndex: number) {
    playingRef.current = true;
    setPlaying(true);
    setAudioError("");

    for (let i = startIndex; i < allLines.length; i++) {
      if (!playingRef.current) break;
      setActiveLine(i);
      await speakLine(allLines[i]);
      if (!playingRef.current) break;
    }

    if (playingRef.current) {
      setPlaying(false);
      setTalkingHost(null);
      playingRef.current = false;
    }
  }

  function togglePlay() {
    if (playing) {
      playingRef.current = false;
      setPlaying(false);
      setTalkingHost(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      playFromLine(activeLine);
    }
  }

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
          <p className="text-white/40 text-sm mb-4">Episode not found</p>
          <Link href="/dashboard" className="btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentLine = allLines[activeLine];

  return (
    <div className="min-h-screen bg-[#080808]">
      <nav className="border-b border-white/5 px-6 h-14 flex items-center justify-between">
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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] rounded-full px-2.5 py-0.5 font-medium"
              style={{ background: TYPE_COLOR[episode.episodeType] + "22", color: TYPE_COLOR[episode.episodeType] }}>
              {episode.episodeType?.replace("_", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
            <span className="text-[10px] text-white/25 border border-white/10 rounded-full px-2 py-0.5">{FORMAT_LABEL[episode.format]}</span>
            {episode.week > 0 && <span className="text-[10px] text-white/25">Week {episode.week}</span>}
          </div>
          <h1 className="font-display text-4xl tracking-wide mb-2">{episode.title}</h1>
          <p className="text-white/40 text-sm">{episode.teaser}</p>
        </div>

        {/* Broadcast stage */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <div className="bg-[#111111] px-5 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${playing ? "bg-red-500 animate-pulse-slow" : "bg-white/20"}`} />
              <span className="font-display text-sm tracking-widest text-white/60">
                {playing ? "ON AIR" : loadingAudio ? "LOADING..." : "STUDIO"} · {FORMAT_LABEL[episode.format]?.toUpperCase()}
              </span>
            </div>
            <span className="text-white/20 text-xs">{allLines.length} lines</span>
          </div>

          <div className="p-8 bg-[#0d0d0d]">
            {/* Hosts */}
            <div className="flex items-end justify-center gap-16 mb-8">
              {/* Marcus */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  {talkingHost === "host1" && <div className="absolute inset-0 rounded-full border-2 border-[#00C853]/60 animate-pulse" />}
                  <svg viewBox="0 0 100 100" className="w-24 h-24">
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
                <p className="font-display text-sm tracking-wider" style={{ color: talkingHost === "host1" ? "#00C853" : "rgba(255,255,255,0.4)" }}>MARCUS COLE</p>
                <p className="text-[10px] text-white/25">Lead Anchor</p>
              </div>

              {/* Tanner */}
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  {talkingHost === "host2" && <div className="absolute inset-0 rounded-full border-2 border-orange-500/60 animate-pulse" />}
                  <svg viewBox="0 0 100 100" className="w-24 h-24">
                    <circle cx="50" cy="50" r="48" fill="#1a2a1a" />
                    <circle cx="50" cy="50" r="46" fill="#1e301e" />
                    <ellipse cx="50" cy="85" rx="30" ry="20" fill="#152015" />
                    <rect x="42" y="65" width="16" height="25" fill="#111d11" />
                    <polygon points="50,63 47,72 50,78 53,72" fill="#E67E22" />
                    <ellipse cx="50" cy="40" rx="22" ry="25" fill="#d4956a" />
                    <ellipse cx="50" cy="18" rx="22" ry="8" fill="#4a2800" />
                    <rect x="28" y="18" width="44" height="6" fill="#4a2800" />
                    <ellipse cx="50" cy="52" rx="14" ry="5" fill="#b87040" opacity="0.4" />
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
                <p className="font-display text-sm tracking-wider" style={{ color: talkingHost === "host2" ? "#E67E22" : "rgba(255,255,255,0.4)" }}>TANNER CROSS</p>
                <p className="text-[10px] text-white/25">Co-Host</p>
              </div>
            </div>

            {/* Current line */}
            <div className="glass rounded-xl p-5 min-h-[80px] flex items-center justify-center text-center mb-5">
              {loadingAudio ? (
                <p className="text-white/40 text-sm animate-pulse">Generating audio...</p>
              ) : currentLine ? (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: EMOTION_COLORS[currentLine.emotion] }}>
                    {currentLine.hostId === "host1" ? "Marcus Cole" : "Tanner Cross"} · {currentLine.segmentTitle}
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed max-w-lg">"{currentLine.text}"</p>
                </div>
              ) : (
                <p className="text-white/20 text-sm">Press play to begin the episode</p>
              )}
            </div>

            {audioError && (
              <p className="text-red-400 text-xs text-center mb-3">{audioError}</p>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={() => jumpToLine(Math.max(0, activeLine - 1))}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-white transition-colors text-lg">⏮</button>
              <button onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[#00C853] hover:bg-[#00A846] flex items-center justify-center transition-colors">
                {playing ? (
                  <span className="text-white text-xl">⏸</span>
                ) : (
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white ml-1" />
                )}
              </button>
              <button onClick={() => jumpToLine(Math.min(allLines.length - 1, activeLine + 1))}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/40 hover:text-white transition-colors text-lg">⏭</button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/25">{activeLine + 1}</span>
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#00C853] rounded-full transition-all duration-300"
                  style={{ width: `${((activeLine + 1) / Math.max(allLines.length, 1)) * 100}%` }} />
              </div>
              <span className="text-xs text-white/25">{allLines.length}</span>
            </div>
          </div>
        </div>

        {/* Full Script */}
        <div className="space-y-4">
          <h2 className="font-display text-xl tracking-wide text-white/50">FULL SCRIPT</h2>
          {episode.script?.segments?.map((seg: any, si: number) => (
            <div key={si} className="glass rounded-xl p-5">
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4">{seg.segmentTitle}</p>
              <div className="space-y-3">
                {seg.lines?.map((line: any, li: number) => {
                  const globalIdx = allLines.findIndex((l: any) => l.segmentIndex === si && l.lineIndex === li);
                  const isActive = globalIdx === activeLine;
                  return (
                    <div key={li} onClick={() => jumpToLine(globalIdx)}
                      className={`flex gap-3 cursor-pointer rounded-lg p-2 -mx-2 transition-all ${line.hostId === "host2" ? "justify-end" : ""} ${isActive ? "bg-white/5" : "hover:bg-white/3"}`}>
                      {line.hostId === "host1" && (
                        <div className="w-7 h-7 rounded-full bg-[#1a2744] border border-[#00C853]/30 flex items-center justify-center text-[10px] text-[#00C853] flex-shrink-0 mt-1">MC</div>
                      )}
                      <div className={`glass rounded-lg p-3 max-w-[85%] ${line.hostId === "host2" ? "rounded-tr-none" : "rounded-tl-none"}`}
                        style={{ borderColor: isActive ? EMOTION_COLORS[line.emotion] + "40" : undefined }}>
                        <span className={`text-[10px] font-medium block mb-1 ${line.hostId === "host1" ? "text-[#00C853]" : "text-orange-400"}`}>
                          {line.hostId === "host1" ? "Marcus Cole" : "Tanner Cross"}
                        </span>
                        <p className="text-white/80 text-sm leading-relaxed">{line.text}</p>
                      </div>
                      {line.hostId === "host2" && (
                        <div className="w-7 h-7 rounded-full bg-[#1a2a1a] border border-orange-500/30 flex items-center justify-center text-[10px] text-orange-400 flex-shrink-0 mt-1">TC</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {episode.script?.closingLine && (
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-white/40 text-sm italic">"{episode.script.closingLine}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
