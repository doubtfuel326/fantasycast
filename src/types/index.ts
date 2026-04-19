// ─── Fantasy League Types ───────────────────────────────────────────────────

export type Platform = "sleeper" | "espn" | "yahoo" | "nfl" | "fanduel";

export type Sport = "nfl" | "nba" | "mlb" | "nhl";

export interface FantasyLeague {
  id: string;
  platform: Platform;
  leagueId: string;
  leagueName: string;
  sport: Sport;
  season: string;
  totalTeams: number;
  scoringType: string;
  userId: string;
  connectedAt: string;
}

export interface FantasyTeam {
  teamId: string;
  teamName: string;
  managerName: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
  streak: string;
  waiverPriority?: number;
}

export interface WeeklyMatchup {
  matchupId: string;
  week: number;
  team1: FantasyTeam;
  team2: FantasyTeam;
  team1Score: number;
  team2Score: number;
  winner?: string;
  isPlayoff: boolean;
}

export interface TradeRecord {
  tradeId: string;
  week: number;
  team1: string;
  team2: string;
  team1Received: string[];
  team2Received: string[];
  processedAt: string;
}

export interface LeagueSnapshot {
  league: FantasyLeague;
  teams: FantasyTeam[];
  currentWeek: number;
  matchups: WeeklyMatchup[];
  recentTrades: TradeRecord[];
  topScorer: FantasyTeam;
  biggestUpset?: WeeklyMatchup;
  highestScore: { team: string; score: number; week: number };
  standings: FantasyTeam[];
}

// ─── Episode / Show Types ─────────────────────────────────────────────────────

export type ShowFormat = "thewire" | "debate" | "podcast";

export type EpisodeType =
  | "weekly_recap"
  | "draft_recap"
  | "preseason"
  | "playoff"
  | "legacy"
  | "offseason";

export interface Host {
  id: "host1" | "host2";
  name: string;
  role: string;
  personality: string;
  voiceId: string;
  avatarColor: string;
  accentColor: string;
}

export interface ScriptLine {
  hostId: "host1" | "host2";
  text: string;
  emotion: "neutral" | "excited" | "shocked" | "laughing" | "serious";
}

export interface EpisodeScript {
  title: string;
  teaser: string;
  format: ShowFormat;
  episodeType: EpisodeType;
  week: number;
  season: string;
  segments: {
    segmentTitle: string;
    lines: ScriptLine[];
  }[];
  closingLine: string;
}

export interface Episode {
  id: string;
  leagueId: string;
  week: number;
  season: string;
  format: ShowFormat;
  episodeType: EpisodeType;
  title: string;
  teaser: string;
  script: EpisodeScript;
  audioUrl?: string;
  generatedAt: string;
  durationSeconds?: number;
  plays: number;
}

// ─── Subscription Types ───────────────────────────────────────────────────────

export type PlanTier = "league" | "pro_league" | "elite_league" | "dynasty";

export interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  priceId: string;
  episodesPerWeek: number;
  leagues: number;
  features: string[];
  highlighted?: boolean;
}

export interface Subscription {
  userId: string;
  plan: PlanTier;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string;
  episodesGeneratedThisWeek: number;
  episodeLimit: number;
}

// ─── Sleeper API Types ────────────────────────────────────────────────────────

export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  sport: string;
  total_rosters: number;
  scoring_settings: Record<string, number>;
  settings: {
    playoff_week_start: number;
    playoff_teams: number;
  };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    waiver_priority: number;
    total_moves: number;
  };
  players: string[];
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  username: string;
  avatar?: string;
  metadata?: { team_name?: string };
}

export interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  players: string[];
  starters: string[];
}
