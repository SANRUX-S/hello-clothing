import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_COOKIE = "__hello_session";

export function adminAuth() {
  const app = getApps()[0] ?? (() => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Firebase Admin service account is not configured.");
    }
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  })();
  return getAuth(app);
}

export async function verifiedSession(): Promise<DecodedIdToken | null> {
  const session = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!session) return null;
  try {
    return await adminAuth().verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export function isStaff(user: DecodedIdToken | null) {
  if (!user?.uid || user.email_verified !== true) return false;
  const ids = (process.env.HELLO_ADMIN_UIDS || "").split(",").map(s => s.trim()).filter(Boolean);
  return ids.includes(user.uid);
}

export async function staffOnly() {
  const user = await verifiedSession();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!isStaff(user)) return NextResponse.json({ error: "Not authorized" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  return null;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}
