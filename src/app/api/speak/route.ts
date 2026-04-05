import { NextRequest, NextResponse } from "next/server";
const VOICES: any = {
  host1: { stability: 0.65, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },
  host2: { stability: 0.30, similarity_boost: 0.75, style: 0.55, use_speaker_boost: true },
};
export async function POST(req: NextRequest) {
  const { text, hostId } = await req.json();
  const voiceId = hostId === "host1" ? process.env.ELEVENLABS_HOST1_VOICE_ID : process.env.ELEVENLABS_HOST2_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId || !apiKey) return NextResponse.json({ error: "ElevenLabs not configured" }, { status: 500 });
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_turbo_v2", voice_settings: VOICES[hostId] }),
  });
  if (!response.ok) return NextResponse.json({ error: "ElevenLabs error" }, { status: 500 });
  const audio = await response.arrayBuffer();
  return new NextResponse(audio, { headers: { "Content-Type": "audio/mpeg" } });
}
