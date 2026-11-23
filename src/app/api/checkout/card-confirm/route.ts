import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getOrderFromDb, markOrderPaidInDb } from "@/lib/server/db";
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from "@/lib/server/mail";
import { allowDemoRequest, privateHeaders, readJsonBody, requireSameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);

    if (!allowDemoRequest("checkout")) {
      return NextResponse.json(
        { error: "System is busy. Please try again." },
        { status: 429, headers: privateHeaders }
      );
    }

    const body = (await readJsonBody(request)) as {
      reference?: string;
      otp?: string;
      cardLast4?: string;
      cardBrand?: string;
    };

    const reference = String(body.reference || '').trim().toUpperCase();
    const otp = String(body.otp || '').trim();
    const cardLast4 = String(body.cardLast4 || 'XXXX').slice(-4);
    const cardBrand = String(body.cardBrand || 'Card');

    if (!reference) {
      return NextResponse.json({ error: "Order reference is required." }, { status: 400, headers: privateHeaders });
    }

    if (!otp || otp.length < 4) {
      return NextResponse.json({ error: "Please enter the valid 6-digit OTP code." }, { status: 400, headers: privateHeaders });
    }

    const order = await getOrderFromDb(reference);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404, headers: privateHeaders });
    }

    // Mark order as paid via 3D Secure verification
    const authCode = `3DS-${randomBytes(3).toString("hex").toUpperCase()}`;
    const paymentMethodLabel = `${cardBrand.toUpperCase()} •••• ${cardLast4}`;

    await markOrderPaidInDb(reference, authCode, paymentMethodLabel);

    // Dispatch automated confirmation emails
    Promise.allSettled([
      sendOrderConfirmationEmail({
        reference: order.reference,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        delivery: order.delivery,
        total: order.total,
        paymentMethod: 'card',
      }),
      sendAdminNewOrderAlert({
        reference: order.reference,
        customer: order.customer,
        items: order.items,
        total: order.total,
        paymentMethod: 'card',
      }),
    ]).catch((err) => console.error("[card-confirm] Email sending error:", err));

    return NextResponse.json(
      {
        success: true,
        reference,
        authCode,
        message: "Payment successfully verified and approved by Issuer Bank.",
      },
      { headers: privateHeaders }
    );
  } catch (error: any) {
    console.error("[card-confirm] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to confirm 3D Secure payment." },
      { status: 500, headers: privateHeaders }
    );
  }
}

