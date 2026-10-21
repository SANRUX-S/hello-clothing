import { NextResponse } from "next/server";
import { privateHeaders, RequestError, requireSameOrigin } from "@/lib/server/http";
import { sendDropWelcomeEmail } from "@/lib/server/mail";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof RequestError ? error.message : "Request rejected." }, { status: 403, headers: privateHeaders });
  }

  try {
    const data = await request.json();
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400, headers: privateHeaders });
    }

    // Trigger VIP welcome & discount code email from drops@helloclothing.store
    sendDropWelcomeEmail(email).catch(err => console.error("[Resend] Drop welcome email error:", err));

    return NextResponse.json({
      success: true,
      code: "HELLO10",
      discount: "10%",
      message: "Welcome to the VIP Drop List! A confirmation with your discount code has been sent."
    }, { status: 200, headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400, headers: privateHeaders });
  }
}
