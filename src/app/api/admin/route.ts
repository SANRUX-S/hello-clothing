import { NextResponse } from "next/server";
import { privateHeaders } from "@/lib/server/http";

function denied() {
  return NextResponse.json({ error: "Administration requires a configured authentication session and a trusted staff role." }, { status: 401, headers: privateHeaders });
}
export const GET = denied;
export const POST = denied;
export const PATCH = denied;
export const DELETE = denied;
