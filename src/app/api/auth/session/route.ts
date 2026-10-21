import { NextResponse } from "next/server";
import { adminAuth, verifiedSession, AUTH_COOKIE, isSameOrigin } from "@/lib/firebase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const maxAge = 5 * 24 * 60 * 60;
const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStore });
  if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Expected JSON" }, { status: 415, headers: noStore });
  if (Number(request.headers.get("content-length") || 0) > 12_000) return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: noStore });
  try {
    const body = await request.json();
    if (typeof body.idToken !== "string" || body.idToken.length > 10_000) return NextResponse.json({ error: "Invalid token" }, { status: 400, headers: noStore });
    const auth = adminAuth();
    const decoded = await auth.verifyIdToken(body.idToken, true);
    // Prevent creating long-lived sessions from old/stolen Firebase tokens.
    if (!decoded.auth_time || (Date.now() / 1000 - decoded.auth_time) > 5 * 60) {
      return NextResponse.json({ error: "Please sign in again" }, { status: 401, headers: noStore });
    }
    const sessionCookie = await auth.createSessionCookie(body.idToken, { expiresIn: maxAge * 1000 });
    const response = NextResponse.json({ ok: true }, { headers: noStore });
    response.cookies.set(AUTH_COOKIE, sessionCookie, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
    return response;
  } catch {
    return NextResponse.json({ error: "Google sign-in could not be verified" }, { status: 401, headers: noStore });
  }
}

export async function GET() {
  const user = await verifiedSession();
  return NextResponse.json(user ? { authenticated: true, user: { uid: user.uid, name: user.name || "", email: user.email || "", picture: user.picture || "" } } : { authenticated: false }, { headers: noStore });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers: noStore });
  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
