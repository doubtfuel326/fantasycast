"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();
  const [leagueId, setLeagueId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [defaultFormat, setDefaultFormat] = useState("sportscenter");

  async function saveLeague() {
    setSaving(true);
    // TODO: POST to /api/connect-league with leagueId
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function openBillingPortal() {
    const res = await fetch("/api/billing-portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen bg-[#060b18]">
      {/* Sidebar same as dashboard — in production extract to a shared component */}
      <div className="fixed left-0 top-0 bottom-0 w-56 border-r border-white/5 bg-[#0a0f1e] flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="font-display text-xl tracking-wider">
            FANTASY<span className="text-[#378ADD]">CAST</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Episodes", href: "/dashboard", icon: "▶" },
            { label: "Standings", href: "/dashboard/standings", icon: "📊" },
            { label: "League", href: "/dashboard/league", icon: "🏈" },
            { label: "Settings", href: "/dashboard/settings", icon: "⚙", active: true },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                item.active
                  ? "bg-white/8 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-56 p-8 max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide mb-8">SETTINGS</h1>

        {/* League Connection */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">CONNECTED LEAGUE</h2>
          <p className="text-white/40 text-sm mb-5">Connect or update your Sleeper fantasy league.</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 block mb-2">Platform</label>
              <div className="flex gap-2">
                {[
                  { id: "sleeper", label: "Sleeper", available: true },
                  { id: "espn", label: "ESPN", available: false },
                  { id: "yahoo", label: "Yahoo", available: false },
                ].map((p) => (
                  <button
                    key={p.id}
                    disabled={!p.available}
                    className={`px-4 py-2 rounded-lg text-xs border transition-colors ${
                      p.id === "sleeper"
                        ? "border-[#378ADD] bg-[#378ADD]/10 text-white"
                        : "border-white/5 text-white/20 cursor-not-allowed"
                    }`}
                  >
                    {p.label} {!p.available && "(soon)"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 block mb-2">League ID</label>
              <input
                type="text"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                placeholder="e.g. 784123456789012345"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#378ADD]/50"
              />
              <p className="text-white/20 text-xs mt-1.5">
                Find this in Sleeper: League → Settings → League ID
              </p>
            </div>

            <button
              onClick={saveLeague}
              disabled={saving || !leagueId}
              className="btn-primary"
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save League"}
            </button>
          </div>
        </section>

        {/* Show preferences */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">SHOW PREFERENCES</h2>
          <p className="text-white/40 text-sm mb-5">Default format for auto-generated weekly episodes.</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "sportscenter", icon: "📺", label: "SportsCenter" },
              { id: "debate", icon: "🔥", label: "Debate Show" },
              { id: "podcast", icon: "🎧", label: "Podcast" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDefaultFormat(f.id)}
                className={`p-4 rounded-xl text-center text-xs border transition-all ${
                  defaultFormat === f.id
                    ? "border-[#378ADD] bg-[#378ADD]/10 text-white"
                    : "glass border-white/8 text-white/50"
                }`}
              >
                <span className="text-2xl block mb-1.5">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          <button className="btn-primary mt-4">Save Preferences</button>
        </section>

        {/* Subscription */}
        <section className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display text-xl tracking-wide mb-1">SUBSCRIPTION</h2>
          <p className="text-white/40 text-sm mb-5">Manage your plan and billing.</p>

          <div className="glass-blue rounded-xl p-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-[#378ADD] font-medium text-sm">Starter Plan</p>
              <p className="text-white/40 text-xs mt-0.5">1 episode/week · 1 league · $9/mo</p>
            </div>
            <span className="text-xs text-green-400 border border-green-400/20 bg-green-400/10 rounded-full px-3 py-1">
              Active
            </span>
          </div>

          <div className="flex gap-3">
            <Link href="/pricing" className="btn-ghost text-sm py-2.5">
              Upgrade Plan
            </Link>
            <button onClick={openBillingPortal} className="btn-ghost text-sm py-2.5">
              Manage Billing →
            </button>
          </div>
        </section>

        {/* Account */}
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl tracking-wide mb-1">ACCOUNT</h2>
          <p className="text-white/40 text-sm mb-5">Your account details.</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Name</span>
              <span className="text-white/80">{user?.fullName || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Email</span>
              <span className="text-white/80">{user?.emailAddresses[0]?.emailAddress || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Member since</span>
              <span className="text-white/80">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "—"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
