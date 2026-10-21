# HELLO! commerce setup and activation

This site runs as an interactive **demo** using `src/lib/catalog.ts`. Supabase credentials are unnecessary for preview. Products, prices, stock, images, delivery fees, descriptions, and policies require owner approval.

## Implemented demo

- `POST /api/checkout` uses strict Zod validation, rejects client prices/payment states, merges duplicate variants, checks shared product stock, and calculates server totals. Money uses integer minor units: LKR 3,490 = 349000.
- Responses declare `mode: "demo"`, `orderPlaced: false`, `paymentCollected: false`. A PREVIEW reference is not an order. No customer details are saved and no stock is reserved.
- **LKR 500 demo delivery** only exercises the total; it is not a production quote.
- Either `STORE_MODE=live` or `NEXT_PUBLIC_APP_MODE=live` refuses checkout. Environment settings cannot activate selling.
- Contact returns 503 without reading/storing messages; tracking returns 503; admin operations return 401.
- Bounded JSON reads, same-origin checks, no-store responses, and a process-local demo throttle are implemented. Production needs distributed rate limiting.

Example request:

```json
{"mode":"demo","items":[{"productId":"essential-tee","size":"M","color":"Black","quantity":1}]}
```

Optional `customer` requires name, email, phone, address, city; postalCode is optional. It is validated, excluded from output, and never persisted. Use example information during testing.

## Supabase staging

Use a new disposable development/staging project. Review migrations and backups before applying to an existing schema. With an installed Supabase CLI:

```powershell
supabase init
supabase login
supabase link --project-ref YOUR_STAGING_PROJECT_REF
supabase db push
```

Or execute these in order through the Supabase SQL editor/PostgreSQL client:

1. `supabase/migrations/202610170001_commerce.sql`
2. `supabase/migrations/202610170002_atomic_orders.sql`
3. `supabase/migrations/202610170003_storage.sql`

**Migrations have not been executed against a configured database.** Verify permissions, transactions, migration application, and recovery in staging.

No automatic seed runs. Explicitly import `supabase/seed.demo.sql` only into isolated development. Seed products/categories are flagged is_demo; live order creation rejects demo merchandise. No customers/orders are seeded.

## Environment and access

Copy `.env.example` to `.env.local`; keep credentials out of Git and chat.

- `STORE_MODE=demo` and `NEXT_PUBLIC_APP_MODE=demo` keep preview consistent. Live in either refuses checkout.
- `NEXT_PUBLIC_SITE_URL` becomes the approved canonical deployment origin.
- `STORE_ORIGIN` optionally pins the exact approved HTTP(S) public origin, e.g. `https://hello.example`. Set it for production/reverse proxies; paths, credentials, queries and fragments are rejected. The API does not trust arbitrary forwarded-host headers. Without it, the request URL must match the browser origin; local nonproduction demos additionally permit HTTP localhost/127.0.0.1/[::1] at the same port as Next's 0.0.0.0 bind address. Production alias matching requires explicit configuration. Cross-site Fetch Metadata is always rejected.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` identify a future catalog/auth project; setting them does not replace the local catalog.
- `SUPABASE_SERVICE_ROLE_KEY` is a future server-only secret. Never prefix it NEXT_PUBLIC_, print it, send it to clients, or store it in content. Current HTTP handlers never use it.

`src/lib/server/supabase.ts` is only a read-only client helper; the Supabase catalog/auth integration is incomplete. Live commerce remains disabled in code.

Create a verified account in the intended Auth project. Obtain its exact UUID from Auth. Provision the first owner **as database owner in the SQL editor**:

```sql
insert into public.user_roles(user_id, role, assigned_by)
values ('YOUR_VERIFIED_AUTH_USER_UUID', 'owner', 'YOUR_VERIFIED_AUTH_USER_UUID');
```

Provision staff through the same trusted process. There is no public role mutation grant, editable profile role, or reliance on user metadata. The admin UI remains a preview. Production needs Supabase SSR sessions, email verification/recovery, secure cookies, and role checks at every page/action/API boundary before mutations connect.

## Database safety model

All created public tables enable RLS and explicit grants.

- Published catalog/content is public; products also require published categories.
- Customers access only their own profiles/wishlists and read their own orders/items/history. They cannot set prices/payment/fulfillment state.
- Privilege comes from user_roles. Security-definer helpers live in non-exposed private, pin search_path, and accept no arbitrary user ID.
- Staff edit catalog. Column grants prevent direct authenticated stock writes. The staff-only `adjust_inventory` RPC deduplicates UUIDs, rejects changed retries, prevents negative stock, and records inventory events.
- Orders/payments/inventory/audit/roles have no public/customer write path. There is no insecure guest lookup by reference/email.
- Protected order snapshots hold contact/address data. No card fields or raw provider payloads exist.

`create_cod_order` is a **service-role-only database foundation** with a disabled live switch. It rejects demo products, validates/merges quantities, recalculates catalog/configured shipping totals, locks stock/catalog rows, creates immutable item snapshots, deducts stock, and records history/inventory events atomically. Unique idempotency keys plus input fingerprints prevent repeated deductions and reject changed retries. COD always starts unpaid.

Shipping tables start empty/disabled. An active approved COD method and exact allowed district are required. No production rates or delivery promises are seeded.

The live HTTP adapter is **not implemented**. It must verify the shopper, validate canonical district choices, generate a cryptographically random guest token, store only its SHA-256 hash, apply distributed throttling, and call the RPC. The current API cannot invoke it. Deliver raw guest tokens privately, never through logs/public responses/query strings, and verify them before releasing order information.

Cancellation/restock, fulfillment transitions, reconciliation, PII retention/deletion, and operational recovery still require implementation/tests. Never grant raw order/payment writes to browsers.

## Media

The private `hello-media-private` bucket holds staff drafts. Public `hello-media` uploads/changes require owner role. Both permit JPEG/PNG/WebP/AVIF up to 5 MiB, with paths `products/<uuid>/<safe-file-name>.<extension>`. SVG/HTML/arbitrary documents are excluded.

Public URLs remain public after product archival. Never upload personal documents there. Production uploads still need file-signature checks, safe re-encoding, size validation, audited publication, and a connected upload UI. MIME labels alone do not validate file contents.

## Tests and verification

Commerce unit tests cover injected prices, invalid quantities/variants, product-wide stock aggregation, duplicate lines, exact arithmetic, invalid catalog amounts, and PII exclusion.

After migrations, run rollback-only assertions **as database owner on disposable staging/local Supabase**:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f supabase/tests/security.sql
```

The SQL script checks RLS flags, public RPC denial, draft visibility, customer A/B isolation, role escalation/payment-write denial, stock-column denial, stock idempotency, and the disabled live gate. It requires no pgTAP. It has not run without a configured database.

Add separate-session concurrency tests before activation: two requests for the last unit create one order; retrying one key deducts once; changed payload on that key fails; rollback leaves stock/order/history intact. Verify actual JWT and Storage permissions for each role. Text review does not replace database execution.

## Remaining production work

1. Obtain approved catalog, stock/prices, licensed images/logo, contacts, district/rate rules, policies, and explicit launch permission.
2. Complete Supabase SSR auth, public catalog, and guarded admin/media/order adapters; run real-session RLS tests.
3. Add distributed throttling, HTTP idempotency, minimal PII retention, redacted logs, secure guest tracking, monitoring, backups/recovery.
4. Integrate only approved payments. COD stays unpaid; bank transfer requires real verification. PayHere hosted checkout, signature/amount validation, webhook idempotency, and sandbox tests are **not implemented**. Browser return URLs never prove payment.
5. Connect a real contact/email provider and verified sender; claim delivery only after actual provider success.
6. Verify migrations, authorization, last-unit concurrency, cancellation/restock, callbacks, build, and staging checkout before opening commerce.

Guidance checked against official [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security), [database function security](https://supabase.com/docs/guides/database/functions), and [Storage restrictions](https://supabase.com/docs/guides/storage/buckets/fundamentals). Recheck current provider docs while completing integrations.
