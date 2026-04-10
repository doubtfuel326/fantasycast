import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildYahooSnapshot } from "@/lib/yahoo";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const snapshot = await buildYahooSnapshot(userId, "449.l.130677");
    return NextResponse.json(snapshot);
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
