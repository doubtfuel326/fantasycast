import Anthropic from "@anthropic-ai/sdk";
import type { LeagueSnapshot } from "@/types";
import type { ShowFormat, EpisodeType } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MARCUS = `MARCUS COLE — Lead Anchor
- Authoritative, polished, professional sports broadcaster energy
- Measured but passionate — he builds drama with his voice
- Occasionally gets pulled into arguments by Tanner but tries to stay composed
- Uses phrases like: "Let's get into it", "Here's what we know", "The numbers don't lie", "Mark my words"
- Never uses filler words. Every line lands with purpose.`;

const TANNER = `TANNER CROSS — Co-Host
- Bold, brash, opinionated — takes the hottest take in the room
- Loves to roast managers by name, calls out bad decisions immediately
- Interrupts Marcus when he disagrees, which is often
- Uses phrases like: "I said what I said", "Come on man", "Nobody wants to hear that", "This is exactly what I predicted"
- Brings the energy up every time he speaks. Never passive.`;

function getFormatInstructions(format: ShowFormat): string {
  const formats = {
    thewire: `FORMAT: THE WIRE — Breaking news broadcast style.
- Marcus leads as the authoritative anchor delivering headlines with urgency
- Tanner adds heat, analysis, and reactions
- Fast paced, punchy. Maximum 2-3 exchanges per segment.
- Use news-style phrases: "Breaking tonight", "We have developing news", "Here's what we know"
- Every segment feels like breaking news. Urgent. Important. Can't look away.`,
    debate: `FORMAT: DEBATE SHOW — First Take / PTI energy.
- Marcus and Tanner DISAGREE on almost everything — that's the format
- They argue trade grades, call out bad decisions, defend their picks
- Tanner takes the hottest take. Marcus tries to be measured but gets drawn in.
- Each segment has genuine tension. Someone is wrong. Someone wins the argument.
- Hot takes only. No safe opinions.`,
    podcast: `FORMAT: PODCAST — Fantasy football roundtable.
- Conversational, longer form, more nuanced
- Marcus sets up topics, Tanner digs into details and stories
- They go on tangents, make jokes, reference league history and past seasons
- More personal — use manager names constantly, tell stories about the league
- Feels like two friends who know this league inside and out breaking it down over drinks.`,
  };
  return formats[format];
}

function getWeekContext(week: number): string {
  if (week <= 3) return `WEEK CONTEXT: Early season (Week ${week}). Anything can happen energy. Overreactions are welcome and encouraged.`;
  if (week <= 7) return `WEEK CONTEXT: Mid season (Week ${week}). Trends are emerging. Who's real and who's a fraud is becoming clear. Call it out.`;
  if (week <= 11) return `WEEK CONTEXT: Playoff push (Week ${week}). Desperation is setting in. Every game matters. Teams are making or breaking their season right now.`;
  if (week <= 13) return `WEEK CONTEXT: Final playoff push (Week ${week}). The pressure is on. Playoff spots are being locked up or lost.`;
  if (week === 14) return `WEEK CONTEXT: Regular season finale (Week 14). Last week of the regular season. Who locks up seeds? Who gets eliminated on the final day?`;
  return `WEEK CONTEXT: Week ${week} of the fantasy season.`;
}

function getEpisodeTypeContext(type: EpisodeType, snapshot: LeagueSnapshot): string {
  const { teams, standings, matchups, recentTrades, currentWeek, league } = snapshot;
  const isDynasty = (league as any).leagueType === "dynasty" || (league as any).type === "dynasty";
  const leagueType = isDynasty ? "DYNASTY LEAGUE" : "REDRAFT LEAGUE";

  const standingsText = standings
    .map((t) => `${t.rank}. ${t.teamName} (${t.managerName}): ${t.wins}-${t.losses}, ${t.pointsFor.toFixed(1)} pts scored, Streak: ${t.streak}`)
    .join("\n");

  const matchupText = matchups
    .map((m) => `${m.team1.teamName} (${m.team1.managerName}) ${m.team1Score.toFixed(1)} vs ${m.team2.teamName} (${m.team2.managerName}) ${m.team2Score.toFixed(1)} — Winner: ${m.winner}`)
    .join("\n");

  const tradeText = recentTrades.length > 0
    ? recentTrades.map((t) => `${t.team1} traded with ${t.team2} — ${t.team1} received: ${t.team1Received?.join(", ")} | ${t.team2} received: ${t.team2Received?.join(", ")}`).join("\n")
    : "No trades this week.";

  const weekCtx = getWeekContext(currentWeek);
  const avgPoints = standings.length > 0 ? (standings.reduce((s, t) => s + t.pointsFor, 0) / standings.length).toFixed(1) : "0";
  const topScorer = standings.reduce((a, b) => a.pointsFor > b.pointsFor ? a : b, standings[0]);

  const types: Record<string, string> = {
    weekly_recap: `
EPISODE: WEEKLY RECAP — Week ${currentWeek}
${leagueType} | ${league.leagueName} | ${league.totalTeams} teams | ${league.scoringType} scoring
${weekCtx}

MATCHUP RESULTS THIS WEEK:
${matchupText || "No matchup data available — use standings to infer stories."}

CURRENT STANDINGS:
${standingsText}

THIS WEEK'S TRADES (ONLY mention trades from this week):
${tradeText}

LEAGUE AVG POINTS: ${avgPoints} | TOP SCORER: ${topScorer?.teamName} (${topScorer?.pointsFor.toFixed(1)} total pts)

EPISODE STRUCTURE — follow exactly:
1. OPENING: Marcus sets the scene with week number and biggest headline. Tanner jumps in hot immediately with a reaction.
2. SCORES + RESULTS: Go through EVERY matchup with the STORY behind it. Not just scores — who got blown out, who won ugly, who had a comeback. Call out the biggest win and worst loss specifically by name.
3. PERFORMANCE OF THE WEEK: Best manager this week. Specific points and specific player names if available. Make them feel like a star.
4. BIGGEST LOSER: Worst week. Tanner roasts them by name. Be specific, brutal, and funny.
5. STANDINGS UPDATE: Playoff picture drama. Who's in, who's on the bubble, who's eliminated. Create real stakes.
6. THIS WEEK'S TRADES: ONLY trades from this specific week. Who won the trade, who got robbed. If no trades — say so briefly and move on.
7. BOLD PREDICTIONS: Marcus makes one bold prediction for next week. Tanner completely disagrees and makes his own. They must contradict each other.
8. CLOSING: Sign off with energy. Tease next week.

RULES: Use manager names constantly. Every matchup gets a story. Marcus and Tanner must sound completely different.`,

    weekly_preview: `
EPISODE: WEEKLY PREVIEW — Week ${currentWeek}
${leagueType} | ${league.leagueName} | ${league.totalTeams} teams
${weekCtx}

THIS WEEK'S MATCHUPS:
${matchupText || "Use standings data to build preview matchups."}

CURRENT STANDINGS:
${standingsText}

${isDynasty ? "DYNASTY NOTE: Consider tanking implications — who benefits from losing for draft position." : ""}

EPISODE STRUCTURE — follow exactly:
1. OPENING: Marcus sets this week's storylines and what's at stake. Tanner jumps in with his take on the most important game this week.
2. MATCHUP BREAKDOWN: Go through EVERY matchup. Who has the edge and why. Use points averages and recent form. Be specific.
3. KEY BATTLES: Highlight the biggest playoff implications. Number one seed race. Elimination games. Bubble teams facing each other.
4. ${isDynasty ? "DYNASTY ANGLE: Who is tanking for the 1.01? Who is fighting to avoid last place? Name the tankers and call them out." : "PLAYOFF PICTURE: Who controls their destiny this week? Who needs help from other games?"}
5. PLAYERS TO WATCH: Name specific players who could be the difference maker this week on key teams.
6. PREDICTIONS: Marcus and Tanner each pick a winner for EVERY matchup. They must disagree on at least half. Give reasoning for each pick — make it a mini debate.
7. CLOSING: Get it going energy. This week matters. Let's go.`,

    matchup_of_the_week: `
EPISODE: MATCHUP OF THE WEEK — Week ${currentWeek}
${leagueType} | ${league.leagueName} | ${league.totalTeams} teams
${weekCtx}

ALL MATCHUPS:
${matchupText || "Use standings to build the marquee matchup."}

STANDINGS:
${standingsText}

EPISODE STRUCTURE — follow exactly:
1. OPENING: Introduce THE marquee matchup of the week like a heavyweight fight announcement. Team vs Team. Make it dramatic. What's at stake for both sides.
2. TALE OF THE TWO TEAMS: Season story for each manager. Their record, are they hot or cold, what kind of season have they had. Make it personal and narrative.
3. THE LINES: Who is the favorite and who is the underdog. Use season points averages to set the lines. Make it feel like Vegas odds — give specific averages for each team and declare a clear favorite.
4. KEY ADVANTAGES: Which team has the edge position by position. RB depth, WR corps, QB situation, bench strength.
5. THE X FACTOR: Name one player on each team that could flip this matchup. The boom or bust guy. The one to watch.
6. INJURY/BYE WATCH: Any key players that could change the outcome. Questionable starts, bye week impacts.
7. WHAT EACH TEAM NEEDS: What does a win mean for each side. Playoff clinch? Elimination? First place? ${isDynasty ? "Dynasty draft positioning?" : ""}
8. MARCUS'S PICK: He makes his prediction with reasoning and gives a specific projected final score.
9. TANNER'S PICK: He completely disagrees and gives his own projected score with different reasoning.
10. CLOSING: Hype it up. Tell the whole league to watch this one. This is THE game of the week.`,

    draft_recap: isDynasty ? `
EPISODE: DYNASTY ROOKIE DRAFT RECAP — ${league.leagueName} ${league.season}
DYNASTY LEAGUE | ${league.totalTeams} teams

TEAM ROSTERS:
${teams.map((t) => `${t.teamName} (${t.managerName}): ${t.wins}-${t.losses}, ${t.pointsFor.toFixed(1)} pts`).join("\n")}

EPISODE STRUCTURE — follow exactly:
1. OPENING: Set the context. This is not about winning now — it is about building a dynasty. Who is rebuilding, who is competing, who is selling the future. Make the stakes clear.
2. TOP PICKS BREAKDOWN: Who got the 1.01, 1.02, 1.03 and why it matters. Is this a stacked rookie class or a weak one? Grade each top pick.
3. REBUILDING TEAMS: Which teams are clearly in tear-down mode. Multiple early picks, loading up on rookies, punting on this season. Name them, explain the strategy, grade the rebuild.
4. CONTENDERS MAKING MOVES: Which championship-caliber teams traded up or traded away picks to win now. Were they right? Grade those decisions.
5. BEST PICK OF THE DRAFT: The rookie who fell further than expected or the best value pick of the entire draft. Make a strong case.
6. TRADE RECAP: All the pick trading during the draft. Who won which trades, who gave up too much, who robbed someone.
7. SLEEPERS: Late round rookies Marcus and Tanner think could surprise everyone. They each name one and disagree on the other.
8. BOLD PREDICTIONS: Which rookie hits big, which busts, which rebuilding team becomes a contender in 2-3 years. Marcus and Tanner disagree on all of them.
9. CLOSING: Dynasty is a marathon not a sprint. See everyone at the end of the season.` : `
EPISODE: DRAFT RECAP — ${league.leagueName} ${league.season}
REDRAFT LEAGUE | ${league.totalTeams} teams

TEAM ROSTERS:
${teams.map((t) => `${t.teamName} (${t.managerName}): ${t.wins}-${t.losses}, ${t.pointsFor.toFixed(1)} pts`).join("\n")}

EPISODE STRUCTURE — follow exactly:
1. OPENING: Recap the draft day energy. How long it took, any drama, set the scene like you were there.
2. BEST DRAFT: Who had the best draft and why. Specific rounds, specific picks, why this team is set up to win. Give a letter grade.
3. WORST DRAFT: Who had the worst draft. Tanner is brutal. Specific bad picks, specific reaches. Give a grade and explain why they are in trouble.
4. STEAL OF THE DRAFT: Best value pick of the entire draft. The player who fell further than they should have. Who got lucky?
5. REACH OF THE DRAFT: Worst value pick. Who overpaid in draft capital and why it will hurt them all season.
6. BOLD SEASON PREDICTIONS: Marcus and Tanner each predict the champion, the biggest bust, and the biggest surprise team. They disagree on all three.
7. CLOSING: Season preview hype. Everyone thinks they won the draft. Let's see who was right in 14 weeks.`,

    preseason: `
EPISODE: PRESEASON PREVIEW — ${league.leagueName} ${league.season}
${leagueType} | ${league.totalTeams} teams

TEAMS:
${teams.map((t) => `${t.teamName} (${t.managerName})`).join("\n")}

HISTORICAL CONTEXT FROM STANDINGS:
${standingsText}

EPISODE STRUCTURE — follow exactly:
1. OPENING: The season is HERE. Marcus and Tanner hype it up like NFL opening night. Set the tone for the whole season.
2. DEFENDING CHAMPION: Who won it all last year. Back-to-back is on the line. ${isDynasty ? "Did they keep their core together? Are they still the team to beat or did the offseason weaken them?" : "They had to redraft just like everyone else. Did they draft well enough to defend? The crown is up for grabs."}
3. LAST PLACE SHAME: Who finished last. Tanner roasts them without mercy. Are they better this year or doomed to repeat?
4. LEAGUE STORYLINES — hit every applicable one using the standings data:
   - The team that has been to multiple championships but never won — is this finally their year?
   - The team that has never made the playoffs — do they break the curse?
   - The team with the most playoff wins — are they still the standard?
   - Teams on win streaks or losing streaks entering the season
   - One hit wonders — won once and never got back
   - Consistent contenders who can never close the deal
   - How many playoff wins does each team have — call out the best and worst records
5. ${isDynasty ? "DYNASTY OFFSEASON MOVES: Who has been trading in the offseason? Who is making a championship push vs rebuilding? Grade the offseason moves." : ""}
6. TITLE CONTENDERS: Marcus and Tanner each pick their top 3 teams to make the championship. They must disagree on at least one.
7. SLEEPER TEAMS: One pick each — a team nobody is talking about that could surprise. They disagree.
8. BIGGEST BUSTS: Which manager is going to disappoint this year. Be specific.
9. BOLD SEASON PREDICTIONS: 3 bold predictions each — who wins it all, who finishes last, biggest storyline. They disagree on everything.
10. CLOSING: Let's get the season started. See everyone week one.`,

    playoff: `
EPISODE: PLAYOFF PREVIEW — ${league.leagueName} Week ${currentWeek}
${leagueType} | ${league.totalTeams} teams

PLAYOFF PICTURE:
${standingsText}

MATCHUPS:
${matchupText || "Use standings to identify playoff matchups."}

${currentWeek >= 16 ? `
2ND ROUND — ONE GAME FROM THE CHAMPIONSHIP:
EPISODE STRUCTURE:
1. OPENING: We are ONE GAME AWAY from the championship. Set the final four. Who survived round one, who got upset. The stakes have never been higher.
2. SEMIFINAL MATCHUP BREAKDOWNS: Both matchups in detail. Who has the edge, projected scores, key advantages for each side.
3. CHAMPIONSHIP IMPLICATIONS: What each semifinal means for the title game. Who do the potential finalists want to face? Legacy on the line for everyone.
4. THE PRESSURE: Who handles big moments in this league historically? Who has choked before when it mattered?
5. THE X FACTOR: One player per team that decides their season.
6. CHAMPIONSHIP PREDICTIONS: Marcus and Tanner each predict both semifinal winners AND who wins the championship. They disagree on at least one semifinal.
7. CLOSING: Championship week is almost here. One game away. Build maximum anticipation.
` : `
1ST ROUND PLAYOFF PREVIEW:
EPISODE STRUCTURE:
1. OPENING: The playoffs are HERE. Regular season is over. Set the bracket. Name every team that made it and acknowledge who got eliminated before this moment.
2. MATCHUP BREAKDOWNS: Every playoff matchup. Who is the favorite, who is the underdog, projected scores based on season averages. Be specific.
3. THE X FACTOR: One player per team that decides their playoff fate.
4. UPSET ALERT: Tanner picks one upset he believes in. Marcus defends the favorite. They argue about it.
5. BOLD PREDICTIONS: Who advances, who goes home. Marcus and Tanner each pick every matchup winner. They disagree on at least one.
6. CLOSING: Playoff energy. Anything can happen. Let's go.
`}`,

    playoff_recap: `
EPISODE: PLAYOFF RECAP — ${league.leagueName} Week ${currentWeek}
${leagueType} | ${league.totalTeams} teams

RESULTS:
${matchupText || "Use standings to infer playoff results."}

STANDINGS:
${standingsText}

${currentWeek >= 16 ? `
2ND ROUND RECAP — WE HAVE OUR FINALISTS:
EPISODE STRUCTURE:
1. OPENING: WE HAVE OUR FINALISTS. Announce who made the championship and how they got there. Make it feel like a major moment.
2. GAME RECAPS: Both semifinal results. Score, story, turning point, key performances that decided it.
3. CHAMPION'S ROAD: Tell the journey of both finalists. Did they dominate all season or sneak in? Any upsets along the way? Build their story.
4. CHAMPIONSHIP PREVIEW TEASE: Who has the edge going into the title game? Early lean from Marcus and Tanner — they disagree on the favorite.
5. LEGACY MOMENT: What would a championship mean for each finalist? First time champion? Back to back? Redemption story? Make it emotional.
6. CLOSING: Championship week is HERE. One game. One trophy. Build maximum anticipation.
` : `
1ST ROUND RECAP:
EPISODE STRUCTURE:
1. OPENING: First round is DONE. Who survived, who got sent home early. Set the tone immediately with the biggest result.
2. GAME RECAPS: Every playoff matchup result. Score, story, key performances, what decided it. Make each game feel significant.
3. BIGGEST UPSET: If there was one — Tanner loses his mind about it. If not — acknowledge the favorites held serve.
4. WHO CHOKED: The team that was supposed to win and didn't. Tanner roasts them specifically and brutally by name.
5. CHAMPIONSHIP CONTENDERS: Who looks scary heading into round two. Who has the momentum and why.
6. ROUND 2 PREVIEW TEASE: Quick look at the semifinal matchups coming up. Build anticipation for next week.
7. CLOSING: Round two hype. We are getting close to a champion.
`}`,

    championship: `
EPISODE: CHAMPIONSHIP PREVIEW — ${league.leagueName} ${league.season}
${leagueType} | ${league.totalTeams} teams

FINALISTS:
${standings.slice(0, 2).map((t) => `${t.teamName} (${t.managerName}): ${t.wins}-${t.losses}, ${t.pointsFor.toFixed(1)} pts scored this season`).join("\n")}

FULL STANDINGS:
${standingsText}

EPISODE STRUCTURE — follow exactly:
1. OPENING: THIS IS IT. Marcus sets the stage like it is the Super Bowl. The biggest week of the fantasy season. Tanner comes in immediately with a hot take on who wins.
2. ROAD TO THE CHAMPIONSHIP: How each finalist got here. Their full season story. Did they dominate all year or sneak in? Did they upset anyone in the playoffs? Tell both journeys.
3. THE STORYLINES — hit every applicable one:
   - Is this their first championship appearance or are they a veteran of the big game?
   - Have they been here before and lost? Are they cursed?
   - Is this a Cinderella story — nobody saw them coming at the start of the season?
   - Did they live up to preseason hype — were they the favorite all along?
   - Is back-to-back on the line?
   - Is this a redemption story — they lost the championship before and now they're back?
4. THE FAVORITE VS THE UNDERDOG: Who has the edge and why. Use season points averages and recent form. Give projected scores — make it feel like Vegas lines on the biggest game of the year.
5. KEY MATCHUPS: Position by position breakdown. Who wins the RB battle, WR battle, QB situation.
6. THE X FACTOR: One player on each team that decides the championship. Name them.
7. CHAMPIONSHIP PICKS: Marcus makes his prediction with a specific projected score. Tanner completely disagrees with his own projected score and different reasoning. Make it a real debate.
8. CLOSING: Championship week energy. One game. One trophy. One legend. Let's go.`,

    championship_recap: `
EPISODE: CHAMPIONSHIP RECAP — ${league.leagueName} ${league.season} CHAMPION
${leagueType} | ${league.totalTeams} teams

CHAMPION: ${standings[0]?.teamName} (${standings[0]?.managerName})
RUNNER UP: ${standings[1]?.teamName} (${standings[1]?.managerName})

FULL STANDINGS:
${standingsText}

EPISODE STRUCTURE — follow exactly:
1. OPENING: WE HAVE A CHAMPION. Marcus announces it like breaking news. The biggest moment of the fantasy season. Tanner reacts immediately — hot take on what just happened and what it means.
2. THE GAME: How it went down. Blowout or nail biter? What was the turning point? Which players delivered when it mattered most and which ones let their manager down at the worst time.
3. CHAMPION'S STORY — cover everything that applies:
   - Is this their first championship? How long have they been in this league waiting for this moment?
   - Is this back to back? Are they building a dynasty?
   - How many championships do they now have all time in this league?
   - Were they the preseason favorite who delivered or did they come out of nowhere?
   - Cinderella story — nobody believed in them and they proved everyone wrong
   - Redemption — did they lose a championship before and finally got over the hump?
4. THE RUNNER UP — be real and specific:
   - Is this their first championship loss or are they now officially cursed?
   - Multiple losses — Tanner declares the curse is real
   - Did they choke or were they just outplayed? Be honest about what happened.
   - Which specific players let them down at the worst moment?
   - How devastating is this loss — were they the favorite?
5. LEGACY MOMENT: Where does this champion rank in league history? All time wins and championships — are they the greatest manager this league has ever seen?
6. AWARD SHOW — give all three:
   - MVP of the championship game
   - Biggest choke of the championship
   - Player who saved the season for the champion
7. SEASON SENDOFF: Marcus and Tanner reflect on the whole season. Best moment, worst moment, most surprising team, best trade of the year. Make it feel like a real season finale.
8. CLOSING: Congratulate the champion. See everyone next season. Offseason hype tease.`,

    legacy: `
EPISODE: LEGACY — ${league.leagueName} All-Time History
${leagueType} | ${league.totalTeams} teams

ALL-TIME DATA:
${standings.map((t) => `${t.teamName} (${t.managerName}): ${t.wins}W-${t.losses}L all time, ${t.pointsFor.toFixed(1)} career pts scored`).join("\n")}

EPISODE STRUCTURE — follow exactly:
1. OPENING: Marcus sets the tone. This is not about this week or this season. This is about the HISTORY of this league. Who built something legendary and who is still searching for their moment.
2. THE DYNASTY: Who has the most championships in league history. How did they build it. Are they still dominant or is their window closing. Is anyone close to catching them.
3. THE WINLESS: Who has never won a championship. How long have they been in this league without a title. Tanner is brutal — is there hope or are they destined to never win.
4. CHAMPIONSHIP APPEARANCES: Who has been to the most championship games. Are they a winner or do they keep coming up short. Multiple losses with no wins starts the official curse conversation.
5. THE CONSISTENT CONTENDERS: Teams that make the playoffs every year but can never close the deal. What is holding them back. Tanner has a theory.
6. THE ONE HIT WONDERS: Teams that won once and never got back. Was it luck or did something fundamentally change.
7. MOST PLAYOFF WINS ALL TIME: Who has dominated the postseason historically. Give them their flowers.
8. NEVER MADE THE PLAYOFFS: If there is a team that has never made the playoffs — call them out specifically. Tanner goes in hard. Marcus tries to be kind. Tanner wins.
9. LEGACY RANKINGS: Marcus and Tanner rank the top 3 managers in league history based on championships, playoff appearances, and consistency. They disagree on the order and argue about it passionately.
10. CLOSING: History is still being written. Who adds to their legacy this season. Who rewrites theirs.`,

    offseason: `
EPISODE: OFFSEASON — ${league.leagueName} Post-${league.season}
${leagueType} | ${league.totalTeams} teams

FINAL STANDINGS:
${standingsText}

CHAMPION: ${standings[0]?.teamName} (${standings[0]?.managerName})
RUNNER UP: ${standings[1]?.teamName} (${standings[1]?.managerName})
LAST PLACE: ${standings[standings.length - 1]?.teamName} (${standings[standings.length - 1]?.managerName})

EPISODE STRUCTURE — follow exactly:
1. OPENING: The season is officially over. Marcus and Tanner reflect on everything that happened. Was it a wild season or did it go as expected? Set the tone.
2. FINAL STANDINGS: Top to bottom — quick one sentence story for each team's season. From champion to last place. Make each one feel specific.
3. THE CHAMPION: One more celebration. What they accomplished this season, what their legacy looks like now, where they rank all time in this league.
4. THE LAUGHING STOCK: Who had the worst season. Last place, most embarrassing moments, worst decisions. Tanner is absolutely ruthless. Marcus tries to find something positive. Tanner does not let him.
5. SEASON AWARDS — give all eight:
   - MVP: Best manager of the season, most dominant team
   - Bust of the Year: Biggest disappointment, supposed to contend and fell apart
   - Best Trade: The deal that changed someone's entire season
   - Worst Trade: The deal that ruined someone's season. Tanner names names and explains exactly why.
   - Best Waiver Wire Pickup: The manager who found gold where nobody else was looking
   - Biggest Choke: The team that had it all and collapsed when it mattered most
   - Most Improved: Team nobody expected to be good that surprised everyone
   - Comeback of the Year: Team that started slow and made a serious run
6. CHAMPIONSHIP LOSS RECOVERY — specific section for the runner up:
   - How devastating was this loss on a scale of 1-10
   - Is there a real path back next season or is the window closing
   - What do they need to do differently
   - Are they cursed or just unlucky — Tanner has a very strong opinion on this
7. STORYLINES HEADING INTO NEXT SEASON:
   - Can the champion repeat or is their window closing
   - Will the laughing stock bounce back or hit rock bottom
   - Which contender is one piece away from a championship run
   - ${isDynasty ? "Dynasty offseason — rookie draft positioning, who is rebuilding, who is going all in next season" : "Who looks positioned to win next year based on this season's performance"}
8. BOLD PREDICTIONS FOR NEXT SEASON: Marcus and Tanner each make 3 bold predictions. Champion pick, last place pick, biggest storyline. They disagree on everything.
9. CLOSING: See you next season. The grind never stops. Offseason hype.`,
  };

  return types[type] || types["weekly_recap"];
}

export async function generateEpisodeScript(
  snapshot: LeagueSnapshot,
  format: ShowFormat,
  episodeType: EpisodeType,
  leagueSettings?: any
): Promise<any> {
  const formatInstructions = getFormatInstructions(format);
  const episodeContext = getEpisodeTypeContext(episodeType, snapshot);

  const prompt = `You are writing a fantasy sports broadcast episode for ${snapshot.league.leagueName}.

${formatInstructions}

HOST PERSONAS — these must come through in every single line:
${MARCUS}

${TANNER}

LEAGUE DATA AND EPISODE INSTRUCTIONS:
${episodeContext}

${leagueSettings ? `VERIFIED LEAGUE HISTORY — USE THIS DATA, DO NOT CONTRADICT IT:
League Type: ${leagueSettings.league_type || "redraft"}

LAST SEASON (${leagueSettings.last_season?.year || ""}):
Champion: ${leagueSettings.last_season?.champion_team || "Unknown"} managed by ${leagueSettings.last_season?.champion_manager || "Unknown"}
Runner Up: ${leagueSettings.last_season?.runner_up_team || "Unknown"} managed by ${leagueSettings.last_season?.runner_up_manager || "Unknown"}
Last Place: ${leagueSettings.last_season?.last_place_team || "Unknown"} managed by ${leagueSettings.last_season?.last_place_manager || "Unknown"}
1st Round Eliminated: ${leagueSettings.last_season?.round1_eliminated?.filter((t: string) => t).join(", ") || "Unknown"}
2nd Round Eliminated: ${leagueSettings.last_season?.round2_eliminated?.filter((t: string) => t).join(", ") || "Unknown"}

THIS SEASON (${leagueSettings.this_season?.year || ""}):
Teams That Made Playoffs: ${leagueSettings.this_season?.playoff_teams?.join(", ") || "Not set"}

ALL-TIME CHAMPIONS:
${leagueSettings.past_champions?.map((c: any) => c.year + ": " + c.team + " (" + c.manager + ")").join("\n") || "Not set"}

CRITICAL: The above data is verified by the league commissioner. Use it for all championship, playoff, legacy, offseason, and preseason references. NEVER invent streaks, wins, or results that contradict this data.` : "WARNING: No league setup data available. Only use standings and matchup data provided. Do not invent any playoff results, championship winners, or streaks not shown in the data."}

CRITICAL WRITING RULES — violating these ruins the episode:
1. Use manager names and team names CONSTANTLY — every segment should feel specific to THIS league and THESE people
2. Marcus and Tanner must sound COMPLETELY DIFFERENT. Marcus = authoritative, measured, builds drama. Tanner = loud, opinionated, roasts people, takes hot takes.
3. Never write generic sports content. Every line must reference actual data from the league data provided.
4. Every segment must have genuine energy — no flat writing, no boring lines
5. Tanner should interrupt, disagree, and roast managers by name frequently
6. Marcus builds drama and is the voice of reason that Tanner constantly challenges
7. The format (The Wire / Debate / Podcast) defines HOW they speak. The episode structure defines WHAT they cover. Both must be followed precisely.
8. Write like this is going on a real broadcast that people in the league will share with each other
9. Be specific — mention actual scores, actual records, actual team names in every segment
10. Make people feel something — excitement, laughter, outrage, pride

OUTPUT FORMAT — return ONLY valid JSON, no other text before or after:
{
  "title": "Episode title that captures the biggest story this week (max 8 words, make it compelling)",
  "teaser": "One sentence that makes someone want to listen immediately — hook them",
  "segments": [
    {
      "segmentTitle": "Segment name",
      "lines": [
        { "host": "Marcus", "text": "What Marcus says — authoritative, specific, builds drama" },
        { "host": "Tanner", "text": "What Tanner says — hot take, roasts someone, disagrees" }
      ]
    }
  ]
}

Write 6-10 segments following the episode structure exactly. Each segment should have 4-8 lines of dialogue. Make every single line count. This should feel like a real sports broadcast, not a summary.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 5000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  // Extract JSON more robustly
  let clean = text.replace(/```json|```/g, "").trim();
  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    clean = clean.slice(jsonStart, jsonEnd + 1);
  }

  console.log("Raw AI response (first 500 chars):", clean.slice(0, 500));
  try {
    const parsed = JSON.parse(clean);
    return {
      ...parsed,
      id: `ep_${Date.now()}`,
      format,
      episodeType,
      week: snapshot.currentWeek,
      season: snapshot.league.season,
      leagueId: snapshot.league.leagueId,
      leagueName: snapshot.league.leagueName,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    throw new Error("Failed to parse episode script from AI response");
  }
}

export async function generateLineAudio(text: string, host: "Marcus" | "Tanner"): Promise<Buffer> {
  const voiceId = host === "Marcus"
    ? process.env.ELEVENLABS_HOST1_VOICE_ID
    : process.env.ELEVENLABS_HOST2_VOICE_ID;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2",
      voice_settings: host === "Marcus"
        ? { stability: 0.4, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true, speed: 0.95 }
        : { stability: 0.3, similarity_boost: 0.75, style: 0.55, use_speaker_boost: true, speed: 1.05 },
    }),
  });

  if (!response.ok) throw new Error(`ElevenLabs error: ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}
