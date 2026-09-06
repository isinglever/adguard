# BoldVoice capture and response experiment

The 2026-09-06 16:21:56 Surge archive identifies BoldVoice 4.3.9 (build 5),
bundle `com.wellocution.iosapp`. Its backend reports an expired trial. This
change adds the observed entitlement/product pair to `js/revenue.js` and an
app-specific script and Surge module for the additional backend responses.

## Capture evidence

| Requests | Observation | Consequence |
| --- | --- | --- |
| 3686801 | RevenueCat product entitlement mapping: 304, no body | Remove conditional cache headers to obtain a fresh mapping. |
| 3686812, 3686833, 3686853, 3686868 | RevenueCat offerings: 304, no body | Refresh the response without changing the catalog. |
| 3686821, 3686860 | RevenueCat subscriber: 304, no body | A response rewrite alone has no JSON to edit. |
| 3686832, 3686862 | `GET /api/v1/profile?includeReferralRedemption=1`: fields inside `user` | Handle the nested profile object and query string. |
| 3686837, 3686866 | `PUT /api/v1/profile/subscription`: fields at the response root | Handle the subscription refresh response too. |
| 3686815 | Profile: 401, followed by successful token refresh and profile requests | Preserve authentication errors. |

All seven RevenueCat calls use `api.rc-backup.com`. Their request headers still
contain `x-revenuecat-etag`. No matching rewrite execution appears in their
capture notes; this archive does not establish which module was enabled.

The backend bodies are Brotli-compressed. After decoding, both response shapes
contain entitlement `subscription`, product
`com.wellocution.iosapp.subscription.yearone`, expiry `2025-04-29T05:42:44Z`,
`isSubscriber: false`, `isProSubscriber: false`, `subStatus: "expired_trial"`,
and an empty `subscriptionData.activeSubscriptions` object. The entitlement
and product are confirmed by the backend copies, not a fresh RevenueCat body.
No account identifiers, credentials, or raw capture bodies are stored here.

## Behavior and limits

`js/boldvoice.js` refreshes conditional requests, handles RevenueCat customer
info and both backend response shapes, and keeps the standard subscription's
expiry and product references consistent. Existing unrelated entitlements,
profile fields, and purchase metadata are retained. Shared RevenueCat calls
are scoped by the bundle ID, with a `BoldVoice/` user-agent fallback when the
bundle header is absent. Invalid JSON, unexpected shapes, authentication
errors, and bodyless 304 responses pass through.

The backend value `subStatus: "active"` and the product-to-subscription contents
of `activeSubscriptions` are assumptions: this capture contains no active
example. Following the screenshot showing the AI Chat "Upgrade to Super"
banner, both backend response shapes now set `isProSubscriber: true` as a local
upsell suppression experiment. The original capture has that flag set to false;
the screenshot and compiled app asset do not confirm the banner's exact display
condition. This also changes the Pro status seen by other client screens.
No Pro RevenueCat entitlement or product is added, and feature flags remain as
received. The experiment changes local responses;
it does not establish a server-side subscription or prove paid content access.
RevenueCat response-signature behavior and the app's use of local cached
customer info are also unverified by this capture.

## Testing in Surge

1. Load `module/boldvoice.module` with `js/boldvoice.js` available at its configured
   script path. The module pins the four subscription rules to published script revision
   `83423f37ce6f79ff2abf417a41ed61fbc12b81a5`, which includes the Super banner
   experiment, and the two scenario banner rules to revision `6f44453`.
   Future script changes require publishing the script first and
   updating this pin. Local edits require a local script-path override.
2. Disable overlapping generic RevenueCat response rewrites for the test,
   including `module/revenuecat.module` or the rule in `conf/qx_crack.conf`.
3. Enable MITM for the three hosts listed by the module and fully restart
   BoldVoice. Confirm that the BoldVoice request scripts run and the RevenueCat
   subscriber request returns 200 JSON instead of 304.
4. Check both profile and subscription refresh responses for
   `isProSubscriber: true`, then reopen AI Chat. The scenario page request must
   return 200 JSON and show `boldvoice_banner_response` in its script notes.
   A diagnostic line reports `[BoldVoice banner v1] removed N upgrade row(s)`.
   Try a lesson and an AI conversation separately: hiding an upsell or changing
   a subscription screen does not verify content access. If the banner remains,
   capture the AI Chat loading requests, including the scenario page responses.

`node js/boldvoice.test.js` checks the two captured backend shapes using
synthetic account data, RevenueCat routing, cache headers, field consistency,
unrelated-field preservation, invalid responses, and module patterns.

Local validation also replayed all four decoded backend success bodies, the
profile 401, and all seven RevenueCat cache requests from the supplied archive.
Those checks passed, including preservation of unrelated profile data. The
existing Spark regression checks passed after the shared mapping addition.
No live app session was exercised.

## Follow-up capture: 16:44:20

The module is running: request 3687837 (`GET /api/v1/profile`) and request
3687845 (`PUT /api/v1/profile/subscription`) both have response-script execution
notes and modified response bodies. However, both bodies still report
`isProSubscriber: false` alongside `isSubscriber: true` and the 2099 expiry.
That matches the first script revision, before the Super banner change. The
archive does not identify whether the stale code came from Surge's cache, an
upstream cache, or a local override.

The published `83423f3` script was downloaded and compared with the local file.
Replaying both captured responses through it changes only `isProSubscriber`
from false to true. All four module script URLs now use that immutable revision
instead of `main`, giving Surge a distinct URL to fetch. This addresses script
delivery; the banner's behavior with the new flag is still unverified.

Refresh or replace the existing module with the updated version, then restart
BoldVoice. Confirm that the installed script paths contain `83423f37` and both
backend response bodies have `isProSubscriber: true` before drawing conclusions
about the banner. Surge documents remote script caching and its update interval
in the [scripting overview](https://manual.nssurge.com/scripting/overview.html).

## Follow-up capture: 16:50:26 — scenario banner

Requests 3688142 and 3688149 now contain `isProSubscriber: true`, confirming
delivery of the previous update. The user still sees the upgrade banner, so the
boolean change alone is insufficient.

AI Chat uses another backend: `production-server-mbem.onrender.com`. Requests
3688158, 3688178, 3688179, and 3688180 fetch
`GET /api/v1/generative/scenarios/page` and all return 304 without bodies.
These requests were outside the earlier module's scope. A separate existing
Map Local rule also supplies that host's subscription response from
`File/boldvoice/bold.json` (request 3688171); it is not a clean server response
and must not be used as evidence for real subscription field values. This
banner change does not edit that Map Local rule.

The app bundle from the initial capture (asset request 3686817, Hermes v96)
was inspected locally with [hermes-dec](https://github.com/P1sec/hermes-dec).
The relevant control flow is:

- `ScenariosList` (#63874) maps each page's `items` into list sections (#63887).
- Its row renderer (#63893, offsets 0x14–0x1d and 0xbc–0x113) handles
  `id === "locked"` by rendering a sale/upgrade component. That branch chooses
  the component using whether `subStatus` is `never_subscribed`; it does not
  use the separate Pro boolean to suppress the row.
- The page-fetch actions accept `{level, items, ...}` for a single level or
  `{pages: [{level, items, ...}], allLevels: [...]}` for all levels.
- The catalog reducer also excludes `id === "locked"` when collecting actual
  scenarios (#13239–13240), while preserving the page items used for display.

`js/boldvoice_banner.js` targets only this GET endpoint. It removes conditional
cache headers and filters that exact sentinel from each page's `items`. It
preserves real scenarios (including locked lessons), order, scores, count,
numCompleted, pagination, and unrelated fields. No additional entitlement or
subscription-field changes are needed for this filter. Response debug logging
contains only a version label and the number of removed rows.

`node js/boldvoice_banner.test.js` validates both API shapes, exact sentinel
matching, data preservation, cache headers, routing, malformed responses, and
bodyless/error passthrough. These shapes are supported by the inspected client
code; the new capture's 304s do not provide fresh scenario JSON to replay.
The final visual result still needs checking after the updated module is loaded.
