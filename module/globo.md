# Globo Elite response test

The 2026-09-25 Surge capture of Globo 2.3.1 (`app.getglobo.ios`) shows that
Apple transaction verification through `POST /api/billing/apple/verify`
activated the server-side `elite` plan. After verification,
`GET /api/app-config` gained `entitlement.plan: "elite"` and an expiration,
while `GET /api/users/{id}/profile/full` gained `badge: "elite"`.

The response scripts rewrite only those two GET responses for Globo's recorded
user-agent. It keeps other response fields and other applications unchanged.
It does not modify Apple verification, purchases, courses, streaks, or signed
tokens. The captured paid access followed a real free-trial transaction, so
the archive cannot establish that these two local changes alone unlock content
when the account has no active plan.

Import `module/globo.module` in Surge, enable HTTPS decryption for
`api.getglobo.app`, reopen Globo, and check whether the account and restricted
features reflect Elite. Capture the relevant request if a feature remains
locked. While the real Apple trial is active, an unlocked feature cannot
independently establish that this module caused the access.

The module also suppresses the startup subscription prompt with a Map Local rule
for `GET /api/screen-flow/app_launch`. In the 2026-10-09 capture, request 16628
returned an array containing only the `app_launch_paywall` subscription page.
The rule returns HTTP 200 with a JSON empty array (`[]`). It requires Surge
iOS 5.9.1+ or Mac 5.5.1+ with Rewrite and MITM enabled, as described in the
[Map Local documentation](https://manual.nssurge.com/http/map-local.html).
If the endpoint later includes other startup notices, those will also be hidden.
Device behavior still needs verification; remove the Map Local rule to restore
the startup flow without disabling the existing response scripts.

Local verification: `node js/globo.test.js`.
