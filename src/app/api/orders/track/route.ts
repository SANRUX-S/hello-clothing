import { NextResponse } from "next/server";
import { privateHeaders } from "@/lib/server/http";

export async function POST() {
  return NextResponse.json({ error: "Order tracking is unavailable in this preview. Preview references are not orders." }, { status: 503, headers: privateHeaders });
}
