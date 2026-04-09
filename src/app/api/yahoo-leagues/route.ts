import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getYahooLeagues } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const leagues = await getYahooLeagues(userId);
    return NextResponse.json({ leagues });
  } catch (err: any) {
    console.error("Yahoo leagues error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
