# Shared RevenueCat router

Enable one RevenueCat module for all supported apps. The router selects a
handler inside that single script, so switching between BoldVoice, Spark,
Elevate, and the legacy apps does not require switching modules.

Surge runs only the first matching request script and the first matching
response script. Returning `$done({})` does not hand a request to the next
matching script. Separate app scripts with the same RevenueCat URL patterns
therefore compete even when they check the app header internally. See the
[Surge scripting documentation](https://manual.nssurge.com/scripting/overview.html).

## Install together

| Module | Responsibility | Enabled with router? |
| --- | --- | --- |
| `revenuecat.module` (RevenueCat Router) | All supported RevenueCat traffic | Yes, exactly one copy |
| Updated `boldvoice.module` | BoldVoice profile responses and scenario banners | Yes |
| `spark.module` | Legacy standalone RevenueCat handler | No; Spark is included in the router |
| Old generic/app-specific RevenueCat scripts | Competing rules on the same hosts | No |
| Other Crack module rules | Non-RevenueCat services | Yes, if they do not duplicate another enabled rule |

Replace both the old RevenueCat module and the old BoldVoice module with their
updated versions. An older commit-pinned BoldVoice module still contains
RevenueCat rules and must be replaced, not left enabled beside the new one.
Disable `spark.module` and any remaining scripts matching RevenueCat in the main
Surge profile or other modules. The Quantumult X rules in `conf/qx_crack.conf`
are a separate configuration and are not migrated by this Surge module update.

The resulting recommended setup has exactly one request rule and one response
rule for RevenueCat, regardless of module order. BoldVoice's banner rules still
work on their own, but its full subscription experiment now uses both modules.
The existing `File/boldvoice/bold.json` Map Local rule found in the captures is
outside the router and has not been changed.

## Routing and behavior

1. Known `x-client-bundle-id` values select BoldVoice or Spark. Header lookup is
   case-insensitive. The known bundle takes priority over user-agent text.
2. When that header is absent, exact `BoldVoice/` and `Spark/` prefixes select
   those apps. A conflicting bundle prevents those user-agent fallbacks.
3. `Elevate/` selects the existing Elevate handler. Other supported apps use
   the user-agent prefixes in `js/revenue.js` (177 legacy mappings).
4. Unrecognized apps pass through. The legacy script's generic grant for an
   unmatched app is deliberately not invoked by this router.

The router strips conditional-cache headers only for recognized apps and only
on supported RevenueCat GET endpoints or POST `/v1/receipts`. It edits only
successful customer-info JSON, leaving offerings, attributes, and product
mapping bodies unchanged. Error responses, bodyless 304s, malformed JSON, and
unexpected subscriber shapes pass through. Authorization headers are preserved.

Existing response behavior is bundled from `js/boldvoice.js`, `js/spark.js`,
`js/revenuecat.js` (Elevate), and `js/revenue.js` (legacy). The router does not
download or evaluate remote handlers at runtime. Legacy handlers retain their
existing behavior, including replacement of entitlement maps where applicable;
the refactor does not redesign those responses or validate server-side access.
Earlier app-specific entitlement and active-status assumptions still apply.

## Updating and verification

Edit the original app handler or `source/revenuecat/router.template.js`, then run:

```sh
node tools/build-revenuecat-router.js
node tools/build-revenuecat-router.js --check
node js/revenuecat_router.test.js
node js/revenuecat_modules.test.js
```

The generated `js/revenuecat_router.js` records each input file's SHA-256. Commit
the generated script, then update the two `script-path` pins in
`module/revenuecat.module` to that commit and publish both commits. Refresh the
module in Surge to load the new URL. Backend-only BoldVoice changes may also
require updating its separate script pin.

Tests compare all bundled handlers with their existing outputs, cover all 177
legacy prefixes, verify cache/header handling and unknown-app isolation, and
simulate both module orders to enforce exactly one matching owner per phase.
Live app access and the user's installed Surge configuration require in-app
verification after migration.
