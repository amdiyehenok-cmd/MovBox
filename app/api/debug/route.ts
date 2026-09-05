import { NextResponse } from "next/server";

/**
 * GET /api/debug — returns which Supabase env vars are set (without
 * leaking the actual key value). Lets us see if Vercel is actually
 * injecting the env vars at runtime.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return NextResponse.json({
    supabaseUrl: url ? `${url.slice(0, 30)}...` : "(empty)",
    supabaseUrlEmpty: !url,
    supabaseAnonKey: key ? `${key.slice(0, 20)}...(${key.length} chars)` : "(empty)",
    supabaseAnonKeyEmpty: !key,
    supabaseServiceKey: service ? `${service.slice(0, 20)}...(${service.length} chars)` : "(empty)",
    supabaseServiceKeyEmpty: !service,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "(empty)",
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      ? `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.slice(0, 20)}...`
      : "(empty)",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "set" : "(empty)",
    nodeEnv: process.env.NODE_ENV,
  });
}
