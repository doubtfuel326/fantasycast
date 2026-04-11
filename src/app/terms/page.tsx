import Link from "next/link";
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080808] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="font-display text-xl tracking-wider mb-12 block">LEAGUE<span className="text-[#00C853]">WIRE</span></Link>
        <h1 className="font-display text-5xl tracking-wide mb-4">TERMS OF SERVICE</h1>
        <p className="text-white/40 text-sm mb-12">Last updated: April 11, 2026</p>
        <div className="space-y-10 text-white/70 leading-relaxed">
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">1. ACCEPTANCE</h2><p>By using LeagueWire, you agree to these Terms. If you do not agree, do not use the Service. LeagueWire is owned and operated by DoubtFuel Entertainment LLC, a Rhode Island LLC.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">2. THE SERVICE</h2><p>LeagueWire generates AI-powered fantasy sports broadcast episodes using data from your connected fantasy leagues (Sleeper, Yahoo Fantasy). Episodes feature AI-generated scripts and voices and may not be 100% accurate.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">3. ACCOUNTS</h2><p>You must be 13 or older to use LeagueWire. You are responsible for keeping your account secure and for all activity under your account.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">4. SUBSCRIPTIONS AND PAYMENTS</h2><p>Subscriptions are billed monthly via Stripe. You may cancel anytime — cancellation takes effect at end of the billing period. No refunds for partial months. We reserve the right to change prices with 30 days notice.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">5. ACCEPTABLE USE</h2><p>You agree not to violate any laws, harass other users, reverse engineer the Service, or resell access without our written permission.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">6. INTELLECTUAL PROPERTY</h2><p>You retain ownership of your fantasy league data. AI-generated episodes are licensed to you for personal, non-commercial use. You may share episodes with your league members. LeagueWire is not affiliated with ESPN, Yahoo, Sleeper, the NFL, NBA, MLB, or any sports organization.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">7. DISCLAIMER</h2><p>LeagueWire is provided as-is without warranties. AI-generated content may contain inaccuracies. We do not guarantee uninterrupted service.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">8. LIMITATION OF LIABILITY</h2><p>DoubtFuel Entertainment LLC shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed what you paid us in the prior 12 months.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">9. GOVERNING LAW</h2><p>These Terms are governed by the laws of the State of Rhode Island, USA.</p></section>
          <section><h2 className="font-display text-2xl tracking-wide text-white mb-4">10. CONTACT</h2>
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
          <Link href="/privacy" className="hover:text-white/60">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
