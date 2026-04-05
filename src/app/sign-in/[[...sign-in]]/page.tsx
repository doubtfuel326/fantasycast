import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-wider mb-2">
            FANTASY<span className="text-[#378ADD]">CAST</span>
          </h1>
          <p className="text-white/40 text-sm">Sign in to your dashboard</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#0a0f1e] border border-white/10 shadow-none rounded-2xl",
              headerTitle: "text-white font-display tracking-wide",
              headerSubtitle: "text-white/40",
              formFieldLabel: "text-white/60 text-xs",
              formFieldInput:
                "bg-white/5 border-white/10 text-white placeholder-white/20 rounded-lg focus:border-[#378ADD]",
              formButtonPrimary:
                "bg-[#378ADD] hover:bg-[#2d70bb] text-white rounded-lg",
              footerActionLink: "text-[#378ADD] hover:text-[#2d70bb]",
              identityPreviewText: "text-white/60",
              identityPreviewEditButtonIcon: "text-[#378ADD]",
            },
          }}
        />
      </div>
    </div>
  );
}
