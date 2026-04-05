# FantasyCast 🎙

> AI-generated weekly video broadcasts for your fantasy football league.
> Two hosts. Three show formats. Six storyline types. Fully automated.

---

## What This Is

FantasyCast connects to your Sleeper fantasy league, pulls live scores/trades/standings, then uses Claude AI to generate a full broadcast script with two hosts — Marcus Cole and Zara Banks. Episodes are generated in one of three formats:

- **SportsCenter** — Anchor-led highlights, scores, top plays
- **Debate Show** — Two hosts arguing hot takes, trade grades, who choked
- **Podcast** — Long-form roundtable with deep dives and storylines

Six episode types are supported: Weekly Recap, Draft Recap, Preseason, Playoff Coverage, Legacy Stories, and Offseason.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Auth | Clerk |
| Payments | Stripe |
| AI Script | Anthropic Claude (claude-sonnet-4) |
| AI Voice | ElevenLabs |
| League Data | Sleeper API (free, no auth) |
| Deployment | Vercel |
| Cron Jobs | Vercel Cron |

---

## Pricing Tiers

| Plan | Price | Episodes/week | Leagues |
|---|---|---|---|
| Starter | $9/mo | 1 | 1 |
| Pro | $19/mo | 3 | 3 |
| Elite | $39/mo | 7 (daily) | 10 |

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd fantasycast
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

#### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Set `ANTHROPIC_API_KEY`

#### ElevenLabs (Voices)
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Create two voices (or use existing ones)
3. Copy the Voice IDs from each voice
4. Set `ELEVENLABS_API_KEY`, `ELEVENLABS_HOST1_VOICE_ID`, `ELEVENLABS_HOST2_VOICE_ID`

**Recommended voice settings for the hosts:**
- Marcus (Host 1): Stability 0.5, Similarity 0.75 — use a deep, authoritative male voice
- Zara (Host 2): Stability 0.5, Similarity 0.75, Style 0.4 — use an energetic female voice

#### Clerk (Auth)
1. Create an app at [clerk.com](https://clerk.com)
2. Copy publishable + secret keys
3. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

#### Stripe (Payments)
1. Create an account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create 3 recurring products with monthly prices:
   - **Starter** — $9/month
   - **Pro** — $19/month
   - **Elite** — $39/month
3. Copy the Price IDs into `.env.local`
4. Set up a webhook endpoint pointing to `https://yourdomain.com/api/webhook`
   - Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

### 3. Run locally

```bash
npm run dev
```

App runs at `http://localhost:3000`

### 4. Test episode generation

The dashboard has a "Generate Episode" button. For local testing without a real Sleeper league, the API uses demo data automatically.

To test with a real Sleeper league:
1. Open the Sleeper app → your league → Settings → League ID
2. Go to `http://localhost:3000/onboarding`, paste the ID
3. Subscribe on the pricing page
4. Generate an episode from the dashboard

### 5. Test Stripe webhooks locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhook
```

---

## Database (Production)

This v1 doesn't include a database — episodes are generated on demand and not persisted between sessions. To add persistence:

**Recommended: Supabase (Postgres)**

```bash
npm install @supabase/supabase-js
```

Tables you'll need:
- `users` — clerkId, stripeCustomerId, plan, episodesThisWeek
- `leagues` — userId, leagueId, platform, leagueName, defaultFormat
- `episodes` — leagueId, userId, week, format, episodeType, title, teaser, script (JSON), audioUrl, generatedAt, plays

Or use **Prisma + Neon** for a fully typed ORM approach.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel --prod
```

Add all environment variables in the Vercel dashboard under Settings → Environment Variables.

The weekly cron job (`vercel.json`) runs every Tuesday at 10am UTC automatically on Vercel Pro.

### Cron secret

Add `CRON_SECRET=some_random_secret_string` to your env vars. This protects the cron endpoint from external calls.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing page
│   ├── onboarding/page.tsx         # League connection flow
│   ├── dashboard/
│   │   ├── page.tsx                # Main dashboard
│   │   └── settings/page.tsx       # Settings
│   ├── episode/[id]/page.tsx       # Episode player
│   ├── sign-in/                    # Clerk auth
│   ├── sign-up/                    # Clerk auth
│   └── api/
│       ├── generate-script/        # POST — generate episode script
│       ├── create-checkout/        # POST — create Stripe checkout
│       ├── webhook/                # POST — Stripe webhook handler
│       ├── league-preview/         # GET  — fetch Sleeper data
│       ├── billing-portal/         # POST — open Stripe billing portal
│       └── cron/generate-weekly/   # GET  — weekly auto-generation
├── lib/
│   ├── sleeper.ts                  # Sleeper API client
│   ├── ai.ts                       # Claude script generation + ElevenLabs
│   └── stripe.ts                   # Stripe helpers + plan definitions
├── types/
│   └── index.ts                    # All TypeScript types
└── middleware.ts                   # Clerk auth protection
scripts/
└── generate-weekly.ts              # Manual weekly generation script
```

---

## Roadmap

### v1 (this build)
- [x] Sleeper integration
- [x] Claude AI script generation
- [x] SportsCenter, Debate, Podcast formats
- [x] All 6 episode types
- [x] Stripe subscriptions (Starter/Pro/Elite)
- [x] Clerk auth
- [x] Animated host avatars
- [x] Episode player
- [x] Weekly cron

### v2
- [ ] Database (Supabase)
- [ ] ElevenLabs audio playback (full episode audio)
- [ ] ESPN + Yahoo integrations
- [ ] Episode sharing links
- [ ] NBA, MLB, NHL fantasy support
- [ ] Slack/Discord delivery
- [ ] Custom host names per league

### v3
- [ ] HeyGen/Synthesia video generation
- [ ] Mobile app (React Native)
- [ ] League invite system
- [ ] Highlight clips
- [ ] Commissioner tools

---

## License

MIT
