import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard?error=yahoo_auth_failed", req.url));
  }

  if (!userId) {
    return NextResponse.redirect(new URL(`/sign-in?redirect=/api/auth/yahoo/callback?code=${code}`, req.url));
  }

  try {
    const clientId = process.env.YAHOO_CLIENT_ID || "";
    const clientSecret = process.env.YAHOO_CLIENT_SECRET || "";
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const tokenRes = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
      method: "POST",
      headers: { 
        "Authorization": `Basic ${credentials}`, 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: new URLSearchParams({ 
        grant_type: "authorization_code", 
        code, 
        redirect_uri: redirectUri 
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("Yahoo token response:", JSON.stringify(tokenData));
    
    if (!tokenData.access_token) throw new Error("Failed to get access token");

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { error: dbError } = await supabase.from("yahoo_tokens").upsert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

    if (dbError) console.error("DB error:", dbError);

    return NextResponse.redirect(new URL("/dashboard?yahoo=connected", req.url));
  } catch (err: any) {
    console.error("Yahoo OAuth error:", err);
    return NextResponse.redirect(new URL(`/dashboard?error=${err.message}`, req.url));
  }
}
