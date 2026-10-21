# HELLO! Firebase Google sign-in (review branch)

This branch uses **Firebase Authentication** for customer Google sign-in, and keeps **Neon** for products and orders. The old Neon Auth provision is not used.

## Prerequisites

- Firebase project: `hello-clothing`; Google provider enabled.
- Authorized domains: `helloclothing.store`, `www.helloclothing.store`.
- Deploy to Vercel with **Node.js runtime** for Firebase Admin SDK.
- **Never commit** Firebase Admin service-account JSON/private key or any .env.local.

## Dependency installation (required before merging)

Run in the project root and commit the generated lockfile:

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm test
```

This PR updates package.json. The lockfile needs regenerating in an environment with access to npm before preview/merge.

## Vercel environment variables

Set the following as **server-only** Environment Variables (Production + Preview as needed):

- `FIREBASE_PROJECT_ID=hello-clothing`
- `FIREBASE_CLIENT_EMAIL` = `client_email` from a Firebase Admin service account
- `FIREBASE_PRIVATE_KEY` = `private_key` from the same service account; escaped `\\n` is supported
- `HELLO_ADMIN_UIDS` = explicit comma-separated Firebase Auth user UIDs for approved administrators; **leave empty to deny all**

Get the service account in Firebase Console → Project Settings → Service accounts → Generate new private key. Enter the fields **directly in Vercel**, not in chat or source code. Rotate keys if accidentally exposed.

## Security

- Sign-in uses the Firebase browser SDK and Google popup, then exchanges the ID token for an httpOnly, SameSite=Lax, Secure-in-production cookie after server-side verification.
- Session creation requires recent sign-in and origin check.
- Admin pages and admin APIs **deny access by default** until a valid verified session and explicitly allowlisted UID exist.
- Google sign-in alone does **not** confer admin access.
- Existing checkout remains in its current demo mode. No PayHere is integrated.
- Order tracking and other endpoints require a separate privacy/security review before taking real customer orders.
- Existing profile/drawer storage is still transitional and should be migrated to authenticated server-side customer profiles before launch.

## Checklist before merge

- Confirm successful sign-in and sign-out on the Preview URL (add Preview domain to Firebase Authorized Domains).
- Check API `/api/auth/session` returns authenticated=false when logged out, true when logged in.
- Verify unauthorized admin page/API requests return redirect/401/403.
- Test an explicitly allowlisted staff account.
- Review account display and local-storage migration for real customers.
- Review checkout, order-tracking privacy, rate limits, and policies separately.
