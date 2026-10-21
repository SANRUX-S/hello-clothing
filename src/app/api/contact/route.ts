import { NextResponse } from "next/server";
import { privateHeaders, RequestError, requireSameOrigin } from "@/lib/server/http";
import { sendContactInquiryEmails } from "@/lib/server/mail";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
  } catch (error) {
    return NextResponse.json({ error: error instanceof RequestError ? error.message : "Request rejected." }, { status: 403, headers: privateHeaders });
  }

  try {
    const data = await request.json();
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const message = typeof data.message === "string" ? data.message.trim() : "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name (at least 2 characters)." }, { status: 400, headers: privateHeaders });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400, headers: privateHeaders });
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Please enter a message with at least 10 characters." }, { status: 400, headers: privateHeaders });
    }

    const reference = `HL-INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    // Asynchronously dispatch Resend emails from support@helloclothing.store
    sendContactInquiryEmails({
      name,
      email,
      message,
      reference,
    }).catch(err => console.error("[Resend] Contact email dispatch error:", err));

    return NextResponse.json({
      success: true,
      sent: true,
      stored: true,
      reference,
      message: `Thank you, ${name}! Your inquiry has been received (Ref #${reference}). Our concierge will respond to ${email} within 24 hours.`
    }, { status: 200, headers: privateHeaders });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400, headers: privateHeaders });
  }
}


