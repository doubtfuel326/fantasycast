"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { PLANS } from "@/lib/stripe";
import type { PlanTier } from "@/types";

const CHECK = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7l3.5 3.5L12 3" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
    <div className="min-h-screen bg-[#060b18] px-6 py-24">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060b18]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl tracking-wider">
            FANTASY<span className="text-[#378ADD]">CAST</span>
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
            <span className="text-[#378ADD]">YOUR PLAN.</span>
          </h1>
          <p className="text-white/40 text-sm">Per league. Cancel anytime. No contracts.</p>
        </div>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 max-lg:max-w-md max-lg:mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col transition-all ${
                plan.highlighted
                  ? "bg-[#378ADD]/10 border-2 border-[#378ADD] relative"
                  : "glass border border-white/8"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#378ADD] text-white text-xs font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-display text-3xl tracking-wide mb-1">{plan.name.toUpperCase()}</h2>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="font-display text-5xl tracking-wide">${plan.price}</span>
                  <span className="text-white/40 text-sm">/mo per league</span>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  {plan.episodesPerWeek === 1 ? "1 episode/week" :
                   plan.episodesPerWeek === 7 ? "Daily episodes" :
                   `${plan.episodesPerWeek} episodes/week`} ·{" "}
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
                    ? "bg-[#378ADD] hover:bg-[#2d70bb] text-white"
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
                q: "When does my episode generate?",
                a: "Episodes auto-generate every Tuesday morning, after Monday Night Football finishes. Draft Recap generates within 2 hours of your draft ending.",
              },
              {
                q: "Can I switch show formats?",
                a: "Yes — you can switch between SportsCenter, Debate Show, and Podcast format at any time from your dashboard. The change takes effect on the next episode.",
              },
              {
                q: "Which fantasy platforms are supported?",
                a: "Sleeper is fully supported now. ESPN and Yahoo Fantasy are coming soon for Pro and Elite plans. We use public APIs so no passwords are ever needed.",
              },
              {
                q: "What's the difference between 1 episode vs 3 per week?",
                a: "On Starter, you get one auto-generated weekly recap. On Pro you can generate additional episodes for things like mid-week trade analysis, waiver wire breakdowns, or playoff previews. On Elite, you can generate a new episode every day.",
              },
              {
                q: "Can I share episodes with my league?",
                a: "Yes — every episode has a shareable link. Pro and Elite subscribers can share publicly so anyone in the league can listen without needing an account.",
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
