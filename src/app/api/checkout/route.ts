import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getProductsFromDb, createOrderInDb, updateProductStockInDb } from "@/lib/server/db";
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert } from "@/lib/server/mail";
import { generatePayHereHash, getPayHereConfig } from "@/lib/server/payhere";
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
        status: paymentMethod === 'card' ? 'pending_payment' : 'processing',
        courier: "PromptX Logistics",
        tracking_number: `PX-${randomHex}`,
        notes: paymentMethod === 'card' ? 'Awaiting PayHere Card Payment' : 'Placed via HELLO! Storefront'
      });

      // Update stock in Neon for each ordered product
      for (const item of preview.items) {
        const prod = dbProducts.find(p => p.id === item.productId);
        if (prod && prod.stock >= item.quantity) {
          await updateProductStockInDb(prod.id, Math.max(0, prod.stock - item.quantity)).catch(() => {});
        }
      }

      // Automatically send Resend emails for COD and Bank Transfer (Card emails trigger upon PayHere approval)
      if (paymentMethod !== 'card') {
        Promise.allSettled([
          sendOrderConfirmationEmail({
            reference,
            customer,
            items: preview.items,
            subtotal: preview.subtotal,
            delivery: preview.delivery,
            total: preview.total,
            paymentMethod,
          }),
          sendAdminNewOrderAlert({
            reference,
            customer,
            items: preview.items,
            total: preview.total,
            paymentMethod,
          }),
        ]).catch((err) => console.error("Email sending error:", err));
      }
    } catch (dbErr) {
      console.error("Failed to persist order to Neon:", dbErr);
    }

    // Generate PayHere Parameters for Card Payment
    let payhere = null;
    if (paymentMethod === 'card') {
      const nameParts = (customer.name || '').trim().split(' ');
      const firstName = nameParts[0] || 'Valued';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost') 
        ? process.env.NEXT_PUBLIC_SITE_URL 
        : 'https://www.helloclothing.store';

      const hash = generatePayHereHash(reference, preview.total, 'LKR');
      const { merchantId, isSandbox } = getPayHereConfig();

      payhere = {
        sandbox: isSandbox,
        merchant_id: merchantId,
        return_url: `${siteUrl}/order-confirmation/${reference}`,
        cancel_url: `${siteUrl}/checkout`,
        notify_url: `${siteUrl}/api/payhere/notify`,
        order_id: reference,
        items: preview.items.map(it => it.name).join(', ') || 'HELLO! Clothing Order',
        amount: (preview.total / 100).toFixed(2),
        currency: 'LKR',
        hash,
        first_name: firstName,
        last_name: lastName,
        email: customer.email || 'customer@helloclothing.store',
        phone: customer.phone || '0786191260',
        address: customer.address || 'Colombo',
        city: customer.city || 'Colombo',
        country: 'Sri Lanka',
        delivery_address: customer.address || 'Colombo',
        delivery_city: customer.city || 'Colombo',
        delivery_country: 'Sri Lanka',
      };
    }

    return NextResponse.json({
      mode: "live",
      orderPlaced: true,
      paymentCollected: paymentMethod === 'card',
      message: "Order placed successfully! Keep your reference code for tracking.",
      preview: {
        reference,
        ...preview,
        customer,
        paymentMethod,
        status: paymentMethod === 'card' ? 'pending_payment' : 'processing',
        courier: "PromptX Logistics",
        trackingNumber: `PX-${randomHex}`
      },
      payhere,
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
