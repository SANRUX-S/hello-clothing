import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { products } from "@/lib/catalog";
import { calculateDemoCheckout, CommerceError } from "@/lib/server/commerce";
import { allowDemoRequest, privateHeaders, readJsonBody, RequestError, requireSameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    // Changing an environment variable must never silently enable order taking.
    if (process.env.STORE_MODE === "live" || process.env.NEXT_PUBLIC_APP_MODE === "live") {
      return NextResponse.json({ error: "Live checkout has not been activated. No order was placed." }, { status: 503, headers: privateHeaders });
    }
    if (!allowDemoRequest("checkout")) {
      return NextResponse.json({ error: "Preview requests are busy. Please try again in a minute." }, { status: 429, headers: { ...privateHeaders, "Retry-After": "60" } });
    }
    const body = await readJsonBody(request);
    const preview = calculateDemoCheckout(body, products);
    return NextResponse.json({
      mode: "demo", orderPlaced: false, paymentCollected: false,
      message: "Demo preview only. No order was placed, no payment was collected, and delivery details were not saved.",
      preview: { reference: `PREVIEW-${randomUUID().slice(0, 8).toUpperCase()}`, ...preview },
    }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Please check the selected items and delivery information.", fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }, { status: 400, headers: privateHeaders });
    }
    if (error instanceof CommerceError) return NextResponse.json({ error: error.message, code: error.code }, { status: 409, headers: privateHeaders });
    if (error instanceof RequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: privateHeaders });
    return NextResponse.json({ error: "The preview could not be prepared. No order was placed." }, { status: 500, headers: privateHeaders });
  }
}
