import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-wider mb-2">
            LEAGUE<span className="text-[#00C853]">WIRE</span>
          </h1>
          <p className="text-white/40 text-sm">Create your account — free to start</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#111111] border border-white/10 shadow-none rounded-2xl",
              headerTitle: "text-white font-display tracking-wide",
              headerSubtitle: "text-white/40",
              formFieldLabel: "text-white/60 text-xs",
              formFieldInput: "bg-white/5 border-white/10 text-white placeholder-white/20 rounded-lg focus:border-[#00C853]",
              formButtonPrimary: "bg-[#00C853] hover:bg-[#00A846] text-white rounded-lg",
              footerActionLink: "text-[#00C853] hover:text-[#00A846]",
              otpCodeFieldInput: "bg-white/10 border border-white/20 text-white rounded-lg text-center text-lg font-bold",
              otpCodeField: "gap-2",
              formHeaderTitle: "text-white",
              formHeaderSubtitle: "text-white/50",
              formResendCodeLink: "text-[#00C853]",
              alertText: "text-white/70",
              dividerLine: "bg-white/10",
              dividerText: "text-white/30",
              socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
              socialButtonsBlockButtonText: "text-white",
            },
          }}
        />
      </div>
    </div>
  );
}
