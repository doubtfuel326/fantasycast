"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function StandingsPage() {
  const [leagueData, setLeagueData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fantasycast_league");
    if (saved) {
      try { setLeagueData(JSON.parse(saved)); } catch {}
    }
  }, []);

  const standings = leagueData?.standings || [];
  const matchups = leagueData?.matchups || [];
  const league = leagueData?.league;

  return (
    <div className="min-h-screen bg-[#060b18]">
      <div className="fixed left-0 top-0 bottom-0 w-56 border-r border-white/5 bg-[#0a0f1e] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-xl tracking-wider">FANTASY<span className="text-[#378ADD]">CAST</span></Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{ label: "Episodes", href: "/dashboard", icon: "▶" }, { label: "Standings", href: "/dashboard/standings", icon: "📊", active: true }, { label: "Settings", href: "/dashboard/settings", icon: "⚙" }].map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${(item as any).active ? "bg-white/8 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <span className="text-xs">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-56 p-8 max-w-3xl">
        <div className="mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
            {league ? `Week ${leagueData?.currentWeek} · ${league.season}` : "Standings"}
          </p>
          <h1 className="font-display text-4xl tracking-wide">{league?.leagueName || "STANDINGS"}</h1>
        </div>

        {standings.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm mb-3">No league connected yet</p>
            <Link href="/dashboard" className="btn-primary text-sm inline-block">Connect League →</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="font-display text-sm tracking-widest text-white/60">FULL STANDINGS</span>
                <span className="text-xs text-white/30">{league?.scoringType} · {league?.totalTeams} teams</span>
              </div>
              <div className="divide-y divide-white/5">
                {standings.map((team: any, i: number) => (
                  <div key={team.teamId} className="px-5 py-4 flex items-center gap-4">
                    <span className={`text-sm font-display w-6 text-center ${i < 4 ? "text-[#378ADD]" : "text-white/20"}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{team.teamName}</p>
                      <p className="text-xs text-white/30">{team.managerName}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{team.wins}-{team.losses}</p>
                        <p className="text-[10px] text-white/30">W-L</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{team.pointsFor?.toFixed(1)}</p>
                        <p className="text-[10px] text-white/30">PF</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{team.pointsAgainst?.toFixed(1)}</p>
                        <p className="text-[10px] text-white/30">PA</p>
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${team.streak?.startsWith("W") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {team.streak}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {matchups.length > 0 && (
              <div className="glass rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5">
                  <span className="font-display text-sm tracking-widest text-white/60">WEEK {leagueData?.currentWeek} MATCHUPS</span>
                </div>
                <div className="divide-y divide-white/5">
                  {matchups.map((m: any) => (
                    <div key={m.matchupId} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium">{m.team1.teamName}</p>
                        <p className="text-xs text-white/30">{m.team1.managerName}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-lg font-display ${m.winner === m.team1.teamName ? "text-white" : "text-white/30"}`}>{m.team1Score?.toFixed(1)}</span>
                        <span className="text-white/20 text-xs">vs</span>
                        <span className={`text-lg font-display ${m.winner === m.team2.teamName ? "text-white" : "text-white/30"}`}>{m.team2Score?.toFixed(1)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{m.team2.teamName}</p>
                        <p className="text-xs text-white/30">{m.team2.managerName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
