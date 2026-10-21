import { describe, expect, it } from 'vitest';
import { isAllowedStoreOrigin, type StoreOriginInput } from '../src/lib/server/origin';

const base: StoreOriginInput = {
  requestUrl: 'http://0.0.0.0:3000/api/checkout', origin: 'http://localhost:3000',
  fetchSite: 'same-origin', environment: 'development', demoMode: true,
};
const allowed = (changes: Partial<StoreOriginInput> = {}) => isAllowedStoreOrigin({ ...base, ...changes });

describe('store origin policy', () => {
  it('allows a local demo browser against the Next bind address', () => {
    expect(allowed()).toBe(true);
    expect(allowed({ origin: 'http://127.0.0.1:3000' })).toBe(true);
    expect(allowed({ origin: 'http://[::1]:3000' })).toBe(true);
  });
  it('requires the exact local port and HTTP protocol for alias matching', () => {
    expect(allowed({ origin: 'http://localhost:4000' })).toBe(false);
    expect(allowed({ origin: 'https://localhost:3000' })).toBe(false);
    expect(allowed({ requestUrl: 'https://0.0.0.0:3000/api/checkout' })).toBe(false);
  });
  it('does not widen local matching to production or live commerce', () => {
    expect(allowed({ environment: 'production' })).toBe(false);
    expect(allowed({ demoMode: false })).toBe(false);
  });
  it('does not accept hostile or lookalike origins', () => {
    for (const origin of ['', 'https://attacker.example', 'http://localhost.attacker.example:3000', 'null', 'http://user@localhost:3000', 'http://localhost:3000/path']) expect(allowed({ origin })).toBe(false);
    expect(allowed({ requestUrl: 'http://shop.example:3000/api/checkout' })).toBe(false);
  });
  it('rejects explicit cross-site requests even with a matching configured origin', () => {
    expect(allowed({ fetchSite: 'cross-site', configuredOrigin: 'http://localhost:3000' })).toBe(false);
    expect(allowed({ fetchSite: 'cross-site', origin: null })).toBe(false);
  });
  it('pins an explicitly configured public origin behind a reverse proxy', () => {
    expect(allowed({ configuredOrigin: 'https://hello.example/', origin: 'https://hello.example', environment: 'production' })).toBe(true);
    expect(allowed({ configuredOrigin: 'https://hello.example', environment: 'production' })).toBe(false);
    expect(allowed({ configuredOrigin: 'https://hello.example', origin: 'http://0.0.0.0:3000' })).toBe(false);
  });
  it('fails closed for malformed configuration', () => {
    for (const configuredOrigin of ['not-a-url', 'file:///private', 'https://hello.example/path', 'https://user:password@hello.example', 'https://hello.example?query=1']) expect(allowed({ configuredOrigin })).toBe(false);
  });
  it('allows exact origins without development aliases', () => {
    expect(allowed({ requestUrl: 'https://hello.example/api/checkout', origin: 'https://hello.example', environment: 'production', demoMode: false })).toBe(true);
  });
  it('allows non-browser JSON clients without Origin while retaining configuration validation', () => {
    expect(allowed({ origin: null, fetchSite: null })).toBe(true);
    expect(allowed({ origin: null, configuredOrigin: 'broken' })).toBe(false);
  });
});
