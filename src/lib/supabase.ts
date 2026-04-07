import { createClient } from "@supabase/supabase-js";

// Works on both client and server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!supabaseKey) console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseKey);

// Save episode to database
export async function saveEpisode(episode: any) {
  console.log("Attempting to save episode:", episode.id);
  console.log("Supabase URL:", supabaseUrl ? "SET" : "MISSING");
  console.log("Supabase Key:", supabaseKey ? "SET" : "MISSING");
  
  const { data, error } = await supabase
    .from("episodes")
    .upsert({
      id: episode.id,
      user_id: episode.userId,
      league_id: episode.leagueId,
      league_name: episode.leagueName,
      week: episode.week,
      season: episode.season,
      format: episode.format,
      episode_type: episode.episodeType,
      title: episode.title,
      teaser: episode.teaser,
      script: episode.script,
      generated_at: episode.generatedAt,
      plays: 0,
    });

  if (error) {
    console.error("Supabase error:", JSON.stringify(error));
    throw new Error(JSON.stringify(error));
  }
  
  console.log("Episode saved successfully!");
  return data;
}

// Get episode by ID
export async function getEpisodeById(id: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) console.error("Error fetching episode:", error);
  return data;
}

// Get all episodes for a user
export async function getEpisodesByUser(userId: string) {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false });

  if (error) console.error("Error fetching episodes:", error);
  return data || [];
}

// Increment play count
export async function incrementPlays(id: string) {
  await supabase.rpc("increment_plays", { episode_id: id });
}