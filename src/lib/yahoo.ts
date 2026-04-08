import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function getYahooToken(userId: string): Promise<string> {
  const { data } = await supabase.from("yahoo_tokens").select("*").eq("user_id", userId).single();
  if (!data) throw new Error("No Yahoo token found. Please reconnect.");
  const expiresAt = new Date(data.expires_at);
  if (expiresAt <= new Date()) return await refreshYahooToken(userId, data.refresh_token);
  return data.access_token;
}

async function refreshYahooToken(userId: string, refreshToken: string): Promise<string> {
  const clientId = process.env.YAHOO_CLIENT_ID || "";
  const clientSecret = process.env.YAHOO_CLIENT_SECRET || "";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: { "Authorization": `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh Yahoo token");
  await supabase.from("yahoo_tokens").upsert({
    user_id: userId,
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  });
  return data.access_token;
}

async function yahooRequest(userId: string, endpoint: string) {
  const token = await getYahooToken(userId);
  const res = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/${endpoint}?format=json`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Yahoo API error: ${res.statusText}`);
  return res.json();
}

export async function getYahooLeagues(userId: string) {
  const data = await yahooRequest(userId, "users;use_login=1/games;game_codes=nfl,nba,mlb,nhl/leagues");
  const games = data?.fantasy_content?.users?.[0]?.user?.[1]?.games;
  if (!games) return [];
  const leagues: any[] = [];
  const gameCount = games?.count || 0;
  for (let i = 0; i < gameCount; i++) {
    const game = games[i]?.game;
    if (!game) continue;
    const gameLeagues = game[1]?.leagues;
    const leagueCount = gameLeagues?.count || 0;
    for (let j = 0; j < leagueCount; j++) {
      const league = gameLeagues[j]?.league?.[0];
      if (!league) continue;
      leagues.push({ leagueId: league.league_key, leagueName: league.name, sport: game[0]?.code || "nfl", season: league.season, totalTeams: league.num_teams, platform: "yahoo" });
    }
  }
  return leagues;
}

export async function buildYahooSnapshot(userId: string, leagueKey: string) {
  const [settingsData, standingsData] = await Promise.all([
    yahooRequest(userId, `league/${leagueKey}/settings`),
    yahooRequest(userId, `league/${leagueKey}/standings`),
  ]);
  const leagueSettings = settingsData?.fantasy_content?.league?.[0];
  const standings = standingsData?.fantasy_content?.league?.[1]?.standings?.[0]?.teams;
  const teamCount = standings?.count || 0;
  const teams = [];
  for (let i = 0; i < teamCount; i++) {
    const team = standings[i]?.team;
    if (!team) continue;
    const teamData = team[0];
    const teamStandings = team[2]?.team_standings;
    teams.push({
      teamId: String(i),
      teamName: teamData?.find((t: any) => t?.name)?.name || `Team ${i + 1}`,
      managerName: teamData?.find((t: any) => t?.managers)?.managers?.[0]?.manager?.nickname || "Manager",
      wins: parseInt(teamStandings?.outcome_totals?.wins || "0"),
      losses: parseInt(teamStandings?.outcome_totals?.losses || "0"),
      ties: 0,
      pointsFor: parseFloat(teamStandings?.points_for || "0"),
      pointsAgainst: parseFloat(teamStandings?.points_against || "0"),
      rank: parseInt(teamStandings?.rank || String(i + 1)),
      streak: "W1",
    });
  }
  const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);
  const currentWeek = parseInt(leagueSettings?.current_week || "1");
  return {
    league: { id: leagueKey, platform: "yahoo" as const, leagueId: leagueKey, leagueName: leagueSettings?.name || "Yahoo League", sport: leagueSettings?.game_code || "nfl", season: leagueSettings?.season || "2024", totalTeams: parseInt(leagueSettings?.num_teams || "10"), scoringType: leagueSettings?.scoring_type || "head", userId, connectedAt: new Date().toISOString() },
    teams,
    currentWeek,
    matchups: [],
    recentTrades: [],
    topScorer: sortedTeams[0] || teams[0],
    biggestUpset: undefined,
    highestScore: { team: sortedTeams[0]?.teamName || "", score: sortedTeams[0]?.pointsFor || 0, week: currentWeek },
    standings: sortedTeams,
  };
}
