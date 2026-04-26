import { getEpisodeById } from "@/lib/supabase";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const episode = await getEpisodeById(params.id);
    if (!episode) return { title: "LeagueWire Episode" };

    const title = episode.script?.title || "LeagueWire Episode";
    const leagueName = episode.league_name || "Fantasy League";
    const teaser = episode.script?.teaser || "Your league\'s AI-powered broadcast";

    return {
      title: `${title} | LeagueWire`,
      description: teaser,
      openGraph: {
        title: title,
        description: `${leagueName} · ${teaser}`,
        url: `https://www.leaguewire.net/episode/${params.id}`,
        siteName: "LeagueWire",
        images: [
          {
            url: "https://www.leaguewire.net/og-episode.png",
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: `${leagueName} · ${teaser}`,
        images: ["https://www.leaguewire.net/og-episode.png"],
      },
    };
  } catch {
    return { title: "LeagueWire Episode" };
  }
}

export default function EpisodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
