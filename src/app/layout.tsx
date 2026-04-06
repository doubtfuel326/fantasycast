import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeagueWire — Your League's Show",
  description:
    "AI-generated weekly video recaps for your fantasy football league. SportsCenter, Debate Show, and Podcast formats.",
  openGraph: {
    title: "LeagueWire",
    description: "Your league. Your show.",
    siteName: "LeagueWire",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-[#080808] text-white font-body antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
