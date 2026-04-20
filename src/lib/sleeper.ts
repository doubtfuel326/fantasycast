import axios from "axios";
import type {
  SleeperLeague,
  SleeperRoster,
  SleeperUser,
  SleeperMatchup,
  LeagueSnapshot,
  FantasyTeam,
  WeeklyMatchup,
} from "@/types";

const BASE = "https://api.sleeper.app/v1";

// ─── Raw Sleeper fetchers ─────────────────────────────────────────────────────

export async function getSleeperLeague(leagueId: string): Promise<SleeperLeague> {
  const { data } = await axios.get(`${BASE}/league/${leagueId}`);
  return data;
}

export async function getSleeperRosters(leagueId: string): Promise<SleeperRoster[]> {
  const { data } = await axios.get(`${BASE}/league/${leagueId}/rosters`);
  return data;
}

export async function getSleeperUsers(leagueId: string): Promise<SleeperUser[]> {
  const { data } = await axios.get(`${BASE}/league/${leagueId}/users`);
  return data;
}

export async function getSleeperMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  const { data } = await axios.get(`${BASE}/league/${leagueId}/matchups/${week}`);
  return data;
}

export async function getNFLState(): Promise<{ week: number; season: string; season_type: string }> {
  const { data } = await axios.get(`${BASE}/state/nfl`);
  return data;
}

export async function getSleeperTransactions(leagueId: string, week: number) {
  const { data } = await axios.get(`${BASE}/league/${leagueId}/transactions/${week}`);
  return data;
}

// ─── Build unified league snapshot ───────────────────────────────────────────

export async function buildLeagueSnapshot(leagueId: string): Promise<LeagueSnapshot> {
  const [league, rosters, users, nflState] = await Promise.all([
    getSleeperLeague(leagueId),
    getSleeperRosters(leagueId),
    getSleeperUsers(leagueId),
    getNFLState(),
  ]);

  const currentWeek = Math.max(1, nflState.week - 1);

  // Build user map for quick lookup
  const userMap = new Map<string, SleeperUser>();
  users.forEach((u) => userMap.set(u.user_id, u));

  // Build roster map
  const rosterUserMap = new Map<number, string>();
  rosters.forEach((r) => rosterUserMap.set(r.roster_id, r.owner_id));

  // Fetch current week matchups
  const matchupsRaw = await getSleeperMatchups(leagueId, currentWeek);
  const recentTransactions = await getSleeperTransactions(leagueId, currentWeek);

  // Pair matchups
  const matchupPairs = new Map<number, SleeperMatchup[]>();
  matchupsRaw.forEach((m) => {
    const existing = matchupPairs.get(m.matchup_id) || [];
    existing.push(m);
    matchupPairs.set(m.matchup_id, existing);
  });

  // Build FantasyTeam list
  const teams: FantasyTeam[] = rosters.map((roster) => {
    const ownerId = roster.owner_id;
    const user = userMap.get(ownerId);
    const s = roster.settings;
    return {
      teamId: String(roster.roster_id),
      teamName: user?.metadata?.team_name || user?.display_name || `Team ${roster.roster_id}`,
      managerName: user?.display_name || "Unknown",
      wins: s.wins,
      losses: s.losses,
      ties: s.ties,
      pointsFor: parseFloat(`${s.fpts}.${s.fpts_decimal || 0}`),
      pointsAgainst: parseFloat(`${s.fpts_against}.${s.fpts_against_decimal || 0}`),
      rank: 0,
      streak: s.wins > s.losses ? `W${s.wins}` : `L${s.losses}`,
      waiverPriority: s.waiver_priority,
    };
  });

  // Sort for standings
  const standings = [...teams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
  standings.forEach((t, i) => (t.rank = i + 1));

  // Build matchup objects
  const matchups: WeeklyMatchup[] = [];
  matchupPairs.forEach((pair, matchupId) => {
    if (pair.length < 2) return;
    const [m1, m2] = pair;
    const r1 = rosters.find((r) => r.roster_id === m1.roster_id);
    const r2 = rosters.find((r) => r.roster_id === m2.roster_id);
    const t1 = teams.find((t) => t.teamId === String(m1.roster_id));
    const t2 = teams.find((t) => t.teamId === String(m2.roster_id));
    if (!t1 || !t2 || !r1 || !r2) return;

    const isPlayoff = currentWeek >= (league.settings?.playoff_week_start || 14);

    matchups.push({
      matchupId: String(matchupId),
      week: currentWeek,
      team1: t1,
      team2: t2,
      team1Score: m1.points,
      team2Score: m2.points,
      winner: m1.points > m2.points ? t1.teamName : t2.teamName,
      isPlayoff,
    });
  });

  // Find top scorer this week
  const topMatchupScore = matchupsRaw.reduce(
    (best, m) => (m.points > best.score ? { rosterId: m.roster_id, score: m.points } : best),
    { rosterId: 0, score: 0 }
  );
  const topTeam = teams.find((t) => t.teamId === String(topMatchupScore.rosterId)) || standings[0];

  // Biggest upset: lowest-ranked team beats highest-ranked
  const biggestUpset = matchups.find((m) => {
    const t1rank = standings.findIndex((t) => t.teamId === m.team1.teamId) + 1;
    const t2rank = standings.findIndex((t) => t.teamId === m.team2.teamId) + 1;
    return (
      (m.winner === m.team1.teamName && t1rank > t2rank + 2) ||
      (m.winner === m.team2.teamName && t2rank > t1rank + 2)
    );
  });

  // All-time high score
  const highScore = standings.reduce(
    (best, t) => (t.pointsFor > best.score ? { team: t.teamName, score: t.pointsFor } : best),
    { team: "", score: 0 }
  );

  // Parse trades from transactions
  const trades = recentTransactions
    .filter((tx: any) => tx.type === "trade")
    .slice(0, 3)
    .map((tx: any, i: number) => ({
      tradeId: tx.transaction_id || String(i),
      week: currentWeek,
      team1: teams.find((t) => t.teamId === String(tx.roster_ids?.[0]))?.teamName || "Team A",
      team2: teams.find((t) => t.teamId === String(tx.roster_ids?.[1]))?.teamName || "Team B",
      team1Received: (tx.adds ? Object.keys(tx.adds).slice(0, 2) : []),
      team2Received: [],
      processedAt: new Date(tx.status_updated).toISOString(),
    }));

  return {
    league: {
      id: leagueId,
      platform: "sleeper",
      leagueId,
      leagueName: league.name,
      sport: (league.sport || "nfl") as "nfl" | "nba" | "mlb" | "nhl",
      season: league.season,
      totalTeams: league.total_rosters,
      scoringType: league.scoring_settings?.rec ? "PPR" : "Standard",
      userId: "",
      connectedAt: new Date().toISOString(),
    },
    teams,
    currentWeek,
    matchups,
    recentTrades: trades,
    topScorer: topTeam,
    biggestUpset,
    highestScore: { ...highScore, week: currentWeek },
    standings,
  };
}
