"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PLANS, TRIAL_PLAN } from "@/lib/stripe";
import type { PlanTier } from "@/types";

const CHECK = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7l3.5 3.5L12 3" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState<PlanTier | null>(null);

  async function handleSubscribe(tier: PlanTier) {
    if (!isSignedIn) {
      window.location.href = `/sign-up?redirect=/pricing`;
      return;
    }
    setLoading(tier);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] px-6 py-24">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl tracking-wider">
            LEAGUE<span className="text-[#00C853]">WIRE</span>
          </Link>
          {isSignedIn ? (
            <Link href="/dashboard" className="btn-ghost py-2 px-4 text-xs">Dashboard</Link>
          ) : (
            <Link href="/sign-in" className="btn-ghost py-2 px-4 text-xs">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-3">Pricing</p>
          <h1 className="font-display text-6xl tracking-wide mb-4">
            YOUR LEAGUE.<br />
            <span className="text-[#00C853]">YOUR PLAN.</span>
          </h1>
          <p className="text-white/40 text-sm">Season passes for the full NFL season. Try it first for $7.</p>
        </div>

        {/* Trial Card */}
        <div className="max-w-sm mx-auto w-full mb-8">
          <div className="glass border border-[#FFD700]/40 rounded-2xl p-6 text-center">
            <div className="inline-block bg-[#FFD700]/10 text-[#FFD700] text-xs font-medium px-3 py-1 rounded-full mb-3">Try Before You Buy</div>
            <h3 className="font-display text-2xl tracking-wide mb-1">NOT SURE YET?</h3>
            <p className="text-white/40 text-sm mb-4">Get one AI video episode for your league. No season commitment.</p>
            <div className="flex items-baseline justify-center gap-1 mb-4">
              <span className="font-display text-4xl tracking-wide">$7</span>
              <span className="text-white/40 text-sm">one video</span>
            </div>
            <ul className="space-y-2 mb-6 text-left">
              {TRIAL_PLAN.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="text-[#FFD700]">✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe("trial" as any)}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl font-medium text-sm bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 transition-all disabled:opacity-50"
            >
              {(loading as any) === "trial" ? "Redirecting..." : "Try For $7 →"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 max-lg:max-w-md max-lg:mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col transition-all ${
                plan.highlighted
                  ? "bg-[#00C853]/10 border-2 border-[#00C853] relative"
                  : "glass border border-white/8"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#00C853] text-white text-xs font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-display text-3xl tracking-wide mb-1">{plan.name.toUpperCase()}</h2>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="font-display text-5xl tracking-wide">${plan.price}</span>
                  <span className="text-white/40 text-sm">/season</span>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  {plan.episodesPerWeek >= 999999 ? "Unlimited episodes" : `${plan.episodesPerWeek} episodes/week`} ·{" "}
                  {plan.leagues === 1 ? "1 league" : `Up to ${plan.leagues} leagues`}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <span className="mt-0.5 flex-shrink-0"><CHECK /></span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id as PlanTier)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                  plan.highlighted
                    ? "bg-[#00C853] hover:bg-[#00A846] text-white"
                    : "bg-white/8 hover:bg-white/12 text-white border border-white/10"
                } disabled:opacity-50`}
              >
                {loading === plan.id ? "Redirecting..." : `Get ${plan.name} →`}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl tracking-wide text-center mb-10">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: "How do I generate an episode?",
                a: "Connect your Sleeper or Yahoo Fantasy league from your dashboard, pick your format and episode type, and hit Generate. Your episode is ready in under 60 seconds.",
              },
              {
                q: "What formats are available?",
                a: "Every plan includes three formats — The Wire (breaking news style), Debate Show (Marcus and Tanner argue everything), and Podcast (conversational deep dive). All 11 episode types are available on every plan.",
              },
              {
                q: "Which fantasy platforms are supported?",
                a: "Sleeper and Yahoo Fantasy are fully supported on all plans. ESPN integration is coming soon.",
              },
              {
                q: "What is the difference between the plans?",
                a: "League gets 3 audio episodes per week for 1 league. Pro League adds 1 video per week plus 5 audio. Elite League gets 4 videos and unlimited audio across 3 leagues. Dynasty gets unlimited everything across up to 6 leagues.",
              },
              {
                q: "Is this a monthly or annual subscription?",
                a: "LeagueWire is a season pass — you pay once and get access for the full NFL season through February 1st. No monthly billing, no surprise charges.",
              },
              {
                q: "Can I share episodes with my league?",
                a: "Yes — every episode has a shareable link. Anyone in your league can watch or listen without needing a LeagueWire account. Split the cost with your league and it is less than a fast food meal per person.",
              },
              {
                q: "What happens when the season ends?",
                a: "Your season pass expires on February 1st. When the new season starts you can renew at any plan level. NBA and MLB seasons coming soon.",
              },
            ].map((item) => (
              <div key={item.q} className="glass rounded-xl p-5">
                <p className="font-medium text-sm mb-2">{item.q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
