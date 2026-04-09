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
  const standingsData = await yahooRequest(userId, `league/${leagueKey}/standings`);
  
  const leagueInfo = standingsData?.fantasy_content?.league?.[0];
  const teamsObj = standingsData?.fantasy_content?.league?.[1]?.standings?.[0]?.teams;
  
  const teamCount = teamsObj?.count || 0;
  const teams: any[] = [];

  for (let i = 0; i < teamCount; i++) {
    const teamWrapper = teamsObj?.[i]?.team;
    if (!teamWrapper) continue;

    const teamArr = teamWrapper[0];
    const teamPoints = teamWrapper[1]?.team_points;
    const teamStandings = teamWrapper[2]?.team_standings;

    // Parse team name from array
    const name = teamArr?.find((t: any) => typeof t === 'object' && t?.name)?.name || `Team ${i+1}`;
    
    // Parse manager nickname
    const managersObj = teamArr?.find((t: any) => typeof t === 'object' && t?.managers);
    const managerName = managersObj?.managers?.[0]?.manager?.nickname || "Manager";

    const wins = parseInt(teamStandings?.outcome_totals?.wins || "0");
    const losses = parseInt(teamStandings?.outcome_totals?.losses || "0");
    const rank = parseInt(teamStandings?.rank || String(i + 1));
    const pointsFor = parseFloat(teamStandings?.points_for || "0");
    const pointsAgainst = parseFloat(teamStandings?.points_against || "0");
    const streakType = teamStandings?.streak?.type === "win" ? "W" : "L";
    const streakVal = teamStandings?.streak?.value || "1";

    teams.push({
      teamId: String(i + 1),
      teamName: name,
      managerName,
      wins,
      losses,
      ties: 0,
      pointsFor,
      pointsAgainst,
      rank,
      streak: `${streakType}${streakVal}`,
    });
  }

  const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);
  const currentWeek = parseInt(leagueInfo?.current_week || "1");

  return {
    league: {
      id: leagueKey,
      platform: "yahoo" as const,
      leagueId: leagueKey,
      leagueName: leagueInfo?.name || "Yahoo League",
      sport: leagueInfo?.game_code || "nfl",
      season: leagueInfo?.season || "2024",
      totalTeams: parseInt(leagueInfo?.num_teams || "12"),
      scoringType: leagueInfo?.scoring_type || "head",
      userId,
      connectedAt: new Date().toISOString(),
    },
    teams,
    currentWeek,
    matchups: [],
    recentTrades: [],
    topScorer: sortedTeams[0] || teams[0],
    biggestUpset: undefined,
    highestScore: {
      team: sortedTeams[0]?.teamName || "",
      score: sortedTeams[0]?.pointsFor || 0,
      week: currentWeek,
    },
    standings: sortedTeams,
  };
}
