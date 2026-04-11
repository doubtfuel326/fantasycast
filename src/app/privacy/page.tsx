import Link from "next/link";
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080808] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="font-display text-xl tracking-wider mb-12 block">LEAGUE<span className="text-[#00C853]">WIRE</span></Link>
        <h1 className="font-display text-5xl tracking-wide mb-4">PRIVACY POLICY</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: April 11, 2026</p>
        <div className="space-y-10 text-white/70 leading-relaxed">
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">1. WHO WE ARE</h2><p>LeagueWire is owned and operated by DoubtFuel Entertainment LLC, a Rhode Island LLC. Contact: <a href="mailto:doubtfuel326@gmail.com" className="text-[#00C853]">doubtfuel326@gmail.com</a></p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">2. WHAT WE COLLECT</h2><p>We collect your name, email, fantasy league data (team names, scores, standings from Sleeper/Yahoo), payment info (processed by Stripe), generated episode content, and usage data.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">3. HOW WE USE YOUR DATA</h2><p>We use your data to generate AI fantasy sports episodes, process payments, send service updates, and improve the platform. We do not sell your data or use it for advertising.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">4. THIRD-PARTY SERVICES</h2><p>We use Clerk (auth), Stripe (payments), Supabase (database), Anthropic (AI), ElevenLabs (voices), Vercel (hosting), Sleeper and Yahoo Fantasy (league data).</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">5. DATA RETENTION</h2><p>We retain your data while your account is active. To delete your account and data, email <a href="mailto:doubtfuel326@gmail.com" className="text-[#00C853]">doubtfuel326@gmail.com</a>.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">6. YOUR RIGHTS</h2><p>You may request access, correction, or deletion of your data by contacting us at <a href="mailto:doubtfuel326@gmail.com" className="text-[#00C853]">doubtfuel326@gmail.com</a>.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">7. COOKIES</h2><p>We use cookies to keep you logged in and remember preferences. We do not use cookies for advertising.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">8. CHILDREN</h2><p>LeagueWire is not intended for children under 13. We do not knowingly collect data from children under 13.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">9. CONTACT</h2>
            <div className="glass rounded-xl p-5">
              <p className="text-white font-medium">DoubtFuel Entertainment LLC</p>
              <p className="text-white/60">Attn: Paul Soares</p>
              <p className="text-white/60">Warwick, Rhode Island, USA</p>
              <p className="mt-2"><a href="mailto:doubtfuel326@gmail.com" className="text-[#00C853]">doubtfuel326@gmail.com</a></p>
            </div>
          </section>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-sm text-white/30">
          <Link href="/" className="hover:text-white/60">Home</Link>
          <Link href="/terms" className="hover:text-white/60">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
