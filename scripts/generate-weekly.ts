/**
 * FantasyCast Weekly Episode Generator
 * =====================================
 * Run this script every Tuesday morning after MNF ends:
 *   npx tsx scripts/generate-weekly.ts
 *
 * In production: schedule via Vercel Cron, GitHub Actions, or a cron service
 * like Inngest, QStash, or a simple cron job on a VPS.
 *
 * Vercel Cron example (vercel.json):
 * {
 *   "crons": [{ "path": "/api/cron/generate-weekly", "schedule": "0 10 * * 2" }]
 * }
 */

import { buildLeagueSnapshot } from "../src/lib/sleeper";
import { generateEpisodeScript } from "../src/lib/ai";
import * as fs from "fs";
import * as path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

// In production: fetch all active subscriptions from your DB
// For now, add league IDs manually for testing
const ACTIVE_LEAGUES: Array<{
  leagueId: string;
  platform: "sleeper";
  defaultFormat: "thewire" | "debate" | "podcast";
  userId: string;
}> = [
  // Add your test Sleeper league ID here:
  // { leagueId: "YOUR_LEAGUE_ID", platform: "sleeper", defaultFormat: "thewire", userId: "user_abc" },
];

// ─── Main generator ───────────────────────────────────────────────────────────

async function generateWeeklyEpisodes() {
  console.log(`\n🎙 FantasyCast Weekly Generator — ${new Date().toISOString()}\n`);

  if (ACTIVE_LEAGUES.length === 0) {
    console.log("No leagues configured. Add league IDs to ACTIVE_LEAGUES in this script.");
    return;
  }

  for (const config of ACTIVE_LEAGUES) {
    console.log(`\n📡 Processing league: ${config.leagueId}`);

    try {
      // 1. Fetch league data
      console.log("  → Fetching Sleeper data...");
      const snapshot = await buildLeagueSnapshot(config.leagueId);
      console.log(`  → League: ${snapshot.league.leagueName} | Week ${snapshot.currentWeek}`);

      // 2. Generate script
      console.log(`  → Generating ${config.defaultFormat} script via Claude...`);
      const script = await generateEpisodeScript(snapshot, config.defaultFormat, "weekly_recap");
      console.log(`  → Script: "${script.title}"`);

      // 3. Save script to file (in production: save to DB)
      const outputDir = path.join(process.cwd(), "generated-episodes");
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      const episodeId = `${config.leagueId}_week${snapshot.currentWeek}_${Date.now()}`;
      const scriptPath = path.join(outputDir, `${episodeId}.json`);
      fs.writeFileSync(scriptPath, JSON.stringify({ id: episodeId, script, snapshot: { league: snapshot.league, currentWeek: snapshot.currentWeek } }, null, 2));
      console.log(`  → Script saved: ${scriptPath}`);

      // 4. Generate audio (optional — requires ElevenLabs API key)
      if (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_HOST1_VOICE_ID) {
        console.log("  → Generating audio clips via ElevenLabs...");

        const allLines = script.segments.flatMap((s: any) => s.lines);
        const audioBuffers: Buffer[] = [];

        for (const line of allLines.slice(0, 5)) { // Limit to first 5 lines for testing
          try {
            const audio = await // generateHostAudio(line.text, line.hostId as "host1" | "host2");
            // audioBuffers.push(audio);
            console.log(`    ✓ ${line.hostId}: "${line.text.slice(0, 40)}..."`);
          } catch (audioErr: any) {
            console.warn(`    ⚠ Audio failed for line: ${audioErr.message}`);
          }
        }

        console.log(`  → Generated ${audioBuffers.length} audio clips`);
      } else {
        console.log("  → Skipping audio (ElevenLabs not configured)");
      }

      console.log(`  ✅ Episode generated successfully: ${script.title}`);

    } catch (err: any) {
      console.error(`  ❌ Failed for league ${config.leagueId}: ${err.message}`);
    }
  }

  console.log("\n🏁 Weekly generation complete.\n");
}

generateWeeklyEpisodes().catch(console.error);
