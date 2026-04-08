import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", req.url));
  const clientId = process.env.YAHOO_CLIENT_ID || "";
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`;
  const authUrl = new URL("https://api.login.yahoo.com/oauth2/request_auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("language", "en-us");
  return NextResponse.redirect(authUrl.toString());
}
