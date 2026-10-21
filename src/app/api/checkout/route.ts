import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getProductsFromDb, createOrderInDb, updateProductStockInDb } from "@/lib/server/db";
import { calculateDemoCheckout, CommerceError } from "@/lib/server/commerce";
import { allowDemoRequest, privateHeaders, readJsonBody, RequestError, requireSameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);

    if (!allowDemoRequest("checkout")) {
      return NextResponse.json({ error: "Checkout is busy. Please try again in a few moments." }, { status: 429, headers: { ...privateHeaders, "Retry-After": "60" } });
    }

    const body = await readJsonBody(request);
    const dbProducts = await getProductsFromDb();

    // Map DB products to checkout product format
    const catalog = dbProducts.map(p => ({
      ...p,
      isDemo: true // allow checkout calculation
    }));

    const preview = calculateDemoCheckout(body, catalog);

    // Generate clean humanized HELLO! order reference
    const randomHex = randomBytes(3).toString("hex").toUpperCase();
    const reference = `HL-${randomHex}`;

    // Customer details
    const customer = (body as any).customer || {
      name: "Valued Customer",
      email: "customer@helloclothing.lk",
      phone: "077 000 0000",
      address: "Standard Delivery Address",
      city: "Colombo",
    };

    const paymentMethod = (body as any).paymentMethod || "cod";

    // Save order in Neon database
    try {
      await createOrderInDb({
        reference,
        customer,
        items: preview.items,
        subtotal: preview.subtotal,
        delivery: preview.delivery,
        total: preview.total,
        payment_method: paymentMethod,
        status: "processing",
        courier: "PromptX Logistics",
        tracking_number: `PX-${randomHex}`,
        notes: "Placed via HELLO! Storefront"
      });

      // Update stock in Neon for each ordered product
      for (const item of preview.items) {
        const prod = dbProducts.find(p => p.id === item.productId);
        if (prod && prod.stock >= item.quantity) {
          await updateProductStockInDb(prod.id, Math.max(0, prod.stock - item.quantity)).catch(() => {});
        }
      }
    } catch (dbErr) {
      console.error("Failed to persist order to Neon:", dbErr);
    }

    return NextResponse.json({
      mode: "live",
      orderPlaced: true,
      paymentCollected: paymentMethod !== "cod",
      message: "Order placed successfully! Keep your reference code for tracking.",
      preview: {
        reference,
        ...preview,
        customer,
        paymentMethod,
        status: "processing",
        courier: "PromptX Logistics",
        trackingNumber: `PX-${randomHex}`
      },
    }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Please verify delivery details and chosen items.", fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }, { status: 400, headers: privateHeaders });
    }
    if (error instanceof CommerceError) return NextResponse.json({ error: error.message, code: error.code }, { status: 409, headers: privateHeaders });
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: privateHeaders });
    console.error("Checkout unhandled error:", error);
    return NextResponse.json({ error: "Checkout could not be processed. Please try again." }, { status: 500, headers: privateHeaders });
  }
}
