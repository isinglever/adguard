# Globo Elite response test and ad blocking

The 2026-09-25 Surge capture of Globo 2.3.1 (`app.getglobo.ios`) shows that
Apple transaction verification through `POST /api/billing/apple/verify`
activated the server-side `elite` plan. After verification,
`GET /api/app-config` gained `entitlement.plan: "elite"` and an expiration,
while `GET /api/users/{id}/profile/full` gained `badge: "elite"`.

This module rewrites only those two GET responses for Globo's recorded
user-agent. For `GET /api/app-config`, it also sets `ads.enabled: false` when
the response contains an ads object, including responses without an entitlement
object. It preserves the paywall settings, ad unit ID, purchase account token,
and other response fields.
It does not modify Apple verification, purchases, courses, streaks, or signed
tokens. The captured paid access followed a real free-trial transaction, so
the archive cannot establish that these two local changes alone unlock content
when the account has no active plan.

Import `module/globo.module` in Surge, enable HTTPS decryption for
`api.getglobo.app`, refresh the Globo script, reopen Globo, and check that
`ads.enabled` is false in the app-config response and whether the account and restricted
features reflect Elite. Capture the relevant request if a feature remains
locked. While the real Apple trial is active, an unlocked feature cannot
independently establish that this module caused the access.

The module loads `js/globo.js` from `main` so it receives the ad-blocking update
after the changes are published to that branch.

Local verification: `node js/globo.test.js`.
