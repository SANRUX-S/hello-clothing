/** Pure origin policy, separate from server-only request handling for testing. */
export type StoreOriginInput = {
  requestUrl: string;
  origin: string | null;
  fetchSite: string | null;
  configuredOrigin?: string;
  environment?: string;
  demoMode: boolean;
};

function originUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url;
  } catch { return null; }
}

export function isAllowedStoreOrigin(input: StoreOriginInput): boolean {
  if (input.fetchSite === 'cross-site') return false;
  const configured = input.configuredOrigin?.trim();
  const expected = configured ? originUrl(configured) : null;
  // A broken deployment setting must not silently widen the origin policy.
  if (configured && !expected) return false;
  // Non-browser API clients may omit Origin; JSON content-type validation and
  // request size checks still apply at the request boundary.
  if (input.origin === null) return true;
  const supplied = originUrl(input.origin);
  if (!supplied || supplied.origin !== input.origin) return false;
  if (expected) return supplied.origin === expected.origin;

  let target: URL;
  try { target = new URL(input.requestUrl); } catch { return false; }
  if (supplied.origin === target.origin) return true;
  if (
    supplied.protocol === target.protocol &&
    supplied.port === target.port &&
    supplied.hostname.replace(/^www\./, '') === target.hostname.replace(/^www\./, '')
  ) {
    return true;
  }

  // Next can construct the internal URL from its 0.0.0.0 bind address. Only a
  // local development demo may match that URL to a loopback browser origin.
  if (input.environment === 'production' || !input.demoMode || target.protocol !== 'http:' || supplied.protocol !== 'http:') return false;
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
  return loopback.has(supplied.hostname)
    && (loopback.has(target.hostname) || target.hostname === '0.0.0.0')
    && supplied.port === target.port;
}
