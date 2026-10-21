import "server-only";
import { isAllowedStoreOrigin } from "./origin";

export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Bounded streaming read also protects requests without a Content-Length. */
export async function readJsonBody(request: Request, maxBytes = 16_384): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new RequestError(415, "Send an application/json request.");
  }
  const statedSize = Number(request.headers.get("content-length") || "0");
  if (statedSize > maxBytes) throw new RequestError(413, "The request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, "A JSON request body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestError(413, "The request is too large.");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new RequestError(400, "The JSON request could not be read."); }
}

export function requireSameOrigin(request: Request) {
  if (!isAllowedStoreOrigin({
    requestUrl: request.url,
    origin: request.headers.get("origin"),
    fetchSite: request.headers.get("sec-fetch-site"),
    configuredOrigin: process.env.STORE_ORIGIN,
    environment: process.env.NODE_ENV,
    demoMode: process.env.STORE_MODE !== "live" && process.env.NEXT_PUBLIC_APP_MODE !== "live",
  })) {
    throw new RequestError(403, "This request must come from the store.");
  }
}
// Local safeguard for the side-effect-free demo only. Production requires a
// distributed limiter at the ingress and authenticated write boundaries.
const windows = new Map<string, { start: number; count: number }>();
export function allowDemoRequest(key: string, maximum = 60, now = Date.now()) {
  const window = windows.get(key);
  if (!window || now - window.start > 60_000) {
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  window.count += 1;
  return window.count <= maximum;
}

export const privateHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export const publicCacheHeaders = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", "X-Content-Type-Options": "nosniff" };

