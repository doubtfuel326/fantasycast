import Anthropic from "@anthropic-ai/sdk";
import type {
  LeagueSnapshot,
  ShowFormat,
  EpisodeType,
  EpisodeScript,
  Host,
} from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Host Personas ────────────────────────────────────────────────────────────

export const HOSTS: Record<"host1" | "host2", Host> = {
  host1: {
    id: "host1",
    name: "Marcus Cole",
    role: "Lead Anchor",
    personality:
      "Professional, authoritative, loves stats and records. Occasionally drops dry one-liners. Think Stuart Scott energy.",
    voiceId: process.env.ELEVENLABS_HOST1_VOICE_ID || "",
    avatarColor: "#1a2744",
    accentColor: "#378ADD",
  },
  host2: {
    id: "host2",
    name: "Tanner Cross",
    role: "Co-Host & Analyst",
    personality:
      "Bold, opinionated, takes hot takes and won't back down. Brings the humor and chaos. Loves an underdog story. Quick delivery, gets louder when making a point, naturally argumentative — sounds like he genuinely cares too much about fantasy sports.",
    voiceId: process.env.ELEVENLABS_HOST2_VOICE_ID || "",
    avatarColor: "#2a1a3e",
    accentColor: "#9B59B6",
  },
};

// ─── Format system prompts ────────────────────────────────────────────────────

function getFormatInstructions(format: ShowFormat): string {
  const formats = {
    sportscenter: `You are writing a SPORTSCENTER-style fantasy football broadcast.
      - Marcus leads as the authoritative anchor with scores and headlines
      - Tanner adds analysis, color commentary, and occasional humor
      - Use classic ESPN-style phrases: "Let's get to the highlights", "Here's what happened", etc.
      - Keep it punchy and fast-paced. Maximum 2-3 exchanges per segment.
      - Include actual scores and stats in the dialogue.`,

    debate: `You are writing a DEBATE SHOW (like First Take / PTI) about fantasy football.
      - Marcus and Tanner DISAGREE on most things — that's the format
      - They argue trade grades, call out bad decisions, defend their picks
      - Tanner is more aggressive and takes hotter takes
      - Marcus tries to be measured but gets pulled into arguments
      - Each segment should have genuine tension and a "winner" of the argument.`,

    podcast: `You are writing a PODCAST (like a fantasy football roundtable).
      - Conversational, longer-form, more nuanced analysis
      - Marcus sets up topics, Tanner digs into the details
      - They can go on tangents, make jokes, reference league history
      - More personal — reference managers by name, tell stories
      - Feels like two friends who know this league very well.`,
  };
  return formats[format];
}

// ─── Episode type context ─────────────────────────────────────────────────────

function getEpisodeTypeContext(type: EpisodeType, snapshot: LeagueSnapshot): string {
  const { teams, standings, matchups, recentTrades, currentWeek, league } = snapshot;

  const standingsText = standings
    .slice(0, 6)
    .map((t) => `${t.rank}. ${t.teamName} (${t.wins}-${t.losses}, ${t.pointsFor.toFixed(1)} pts)`)
    .join("\n");

  const matchupText = matchups
    .map(
      (m) =>
        `${m.team1.teamName} ${m.team1Score.toFixed(1)} vs ${m.team2.teamName} ${m.team2Score.toFixed(1)} — Winner: ${m.winner}`
    )
    .join("\n");

  const tradeText =
    recentTrades.length > 0
      ? recentTrades
          .map((t) => `${t.team1} traded with ${t.team2}`)
          .join("\n")
      : "No trades this week.";

  const types: Record<EpisodeType, string> = {
    weekly_recap: `
WEEK ${currentWeek} RESULTS — ${league.leagueName}
League: ${league.leagueName} | ${league.totalTeams} teams | ${league.scoringType} scoring

MATCHUP RESULTS:
${matchupText}

STANDINGS:
${standingsText}

RECENT TRADES:
${tradeText}

TOP SCORER THIS WEEK: ${snapshot.topScorer.teamName} (${snapshot.topScorer.pointsFor.toFixed(1)} pts)
${snapshot.biggestUpset ? `BIGGEST UPSET: ${snapshot.biggestUpset.winner} won despite being a major underdog` : ""}

Cover: scores, best/worst performances, trades, standings race, and bold predictions for next week.`,

    draft_recap: `
DRAFT RECAP — ${league.leagueName} ${league.season}
League: ${league.leagueName} | ${league.totalTeams} teams

ROSTER OVERVIEW (use this to simulate draft grades):
${teams
  .map(
    (t) =>
      `${t.teamName} (${t.managerName}): W${t.wins}-L${t.losses}, ${t.pointsFor.toFixed(1)} pts`
  )
  .join("\n")}

Cover: overall draft grades (A through F) for each team, biggest steals, worst reaches, bold season predictions based on rosters, and who's the early favorite.`,

    preseason: `
PRESEASON PREVIEW — ${league.leagueName} ${league.season}
League: ${league.leagueName} | ${league.totalTeams} teams

TEAMS:
${teams.map((t) => `${t.teamName} (${t.managerName})`).join("\n")}

Cover: season storylines to watch, returning champion pressure, sleeper teams, must-watch managers, and bold predictions for the season.`,

    playoff: `
PLAYOFF COVERAGE — ${league.leagueName} Week ${currentWeek}
League: ${league.leagueName}

PLAYOFF PICTURE:
${standingsText}

MATCHUPS:
${matchupText}

Cover: playoff seeding drama, who's in/out, this week's matchup previews, championship contenders, and who's playing scared.`,

    legacy: `
LEGACY EPISODE — ${league.leagueName} ${league.season}
League: ${league.leagueName} | All-time leaders

CURRENT LEADERS:
${standings
  .slice(0, 3)
  .map((t) => `${t.teamName}: ${t.wins}W, ${t.pointsFor.toFixed(1)} career pts`)
  .join("\n")}

Cover: all-time records, dynasty discussion, greatest seasons, best draft classes, legendary moments, and where current managers stack up historically.`,

    offseason: `
OFFSEASON SHOW — ${league.leagueName} Post-${league.season}
League: ${league.leagueName}

FINAL STANDINGS:
${standingsText}

Cover: season awards (MVP, bust, best trade, worst trade, best waiver pickup), offseason moves to watch, early next-year predictions, and what changes the league needs to make.`,
  };

  return types[type];
}

// ─── Main script generation function ─────────────────────────────────────────

export async function generateEpisodeScript(
  snapshot: LeagueSnapshot,
  format: ShowFormat,
  episodeType: EpisodeType
): Promise<EpisodeScript> {
  const formatInstructions = getFormatInstructions(format);
  const episodeContext = getEpisodeTypeContext(episodeType, snapshot);

  const prompt = `${formatInstructions}

You have two hosts:
- HOST1 = Marcus Cole: ${HOSTS.host1.personality}
- HOST2 = Tanner Cross: ${HOSTS.host2.personality}

LEAGUE DATA:
${episodeContext}

Generate a complete episode script in valid JSON matching this exact structure:
{
  "title": "Episode title (punchy, broadcast-style)",
  "teaser": "One-sentence teaser shown under the title",
  "format": "${format}",
  "episodeType": "${episodeType}",
  "week": ${snapshot.currentWeek},
  "season": "${snapshot.league.season}",
  "segments": [
    {
      "segmentTitle": "Segment name",
      "lines": [
        {
          "hostId": "host1",
          "text": "What the host says",
          "emotion": "neutral"
        }
      ]
    }
  ],
  "closingLine": "Sign-off line said together or alternating"
}

Rules:
- emotion must be one of: neutral, excited, shocked, laughing, serious
- hostId must be either "host1" or "host2"
- Include 3-5 segments
- Each segment has 4-8 dialogue lines
- ACCURACY IS CRITICAL — only reference facts that are explicitly in the league data above
- Use EXACT team names, manager names, scores, and records from the data — never invent or approximate
- NEVER call someone a champion or winner unless they explicitly won the playoff finale in the data
- NEVER confuse regular season standings with playoff results — they are different things
- NEVER invent players, trades, injuries, or events not in the data
- If the episode type is weekly_recap, only discuss what happened THIS week — do not reference future weeks
- If you don't have data about something, don't mention it — stick to what you know
- Make it genuinely entertaining — this is for a friend group watching their own league
- Every line must reference actual names, scores, or events from the league data
- Return ONLY valid JSON, no markdown, no explanation`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";

  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as EpisodeScript;
  } catch {
    throw new Error(`Failed to parse script JSON: ${cleaned.slice(0, 200)}`);
  }
}

// ─── Generate audio with ElevenLabs ──────────────────────────────────────────

export async function generateHostAudio(
  text: string,
  hostId: "host1" | "host2"
): Promise<Buffer> {
  const host = HOSTS[hostId];
  const voiceId = host.voiceId;

  if (!voiceId) throw new Error(`No voice ID configured for ${hostId}`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: hostId === "host2" ? 0.4 : 0.2,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
