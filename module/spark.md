# Spark subscription experiment

The 2026-09-25 Surge captures identify Spark 1.45.0 (600), bundle
`com.mindcompany.spark`. This module applies an Elevate-style local response
rewrite to Spark's RevenueCat customer-info and receipt responses.

For normal use, enable `module/revenuecat.module` (RevenueCat Router), which
includes this Spark handler, and disable `module/spark.module`. This allows
Spark to coexist with BoldVoice and the other supported apps without competing
RevenueCat rules. See [the router migration guide](revenuecat.md).

## Capture findings

- The 23:14 capture shows that the previous script added `premium` to the
  customer-info response, but Spark still showed a paywall for `locked_game`.
- The 23:18 capture contains an Apple trial transaction for
  `ios_subscription_annual_intro_7d_39.99_2026.03.10`. The receipt response
  contains a `pro` entitlement expiring on 2026-10-02. The old script added
  `premium` and changed the subscription dates, but left `pro` unchanged.
  Spark then logged `pro purchased`, confirming that `pro` is the relevant
  entitlement. The revised script updates `pro` and the matching subscription
  consistently while preserving unrelated subscriber fields.
- Spark's `streaks`, `user_puzzle_stats`, `user_knowledge_categories`, and
  `chili_free_plays` responses contain user state but no separate subscription
  entitlement. This module does not change those endpoints.

## Standalone local testing (alternative to the shared router)

1. Copy `js/spark.js` into Surge's local script directory. Import a local copy
   of `module/spark.module`, replacing both remote `script-path` values with
   the local script location. The remote URLs require these files to be
   published to the repository first; creating them locally does not do that.
2. Disable overlapping generic RevenueCat response scripts while testing,
   including `module/revenuecat.module` or the RevenueCat rule in
   `conf/qx_crack.conf`, if applicable. The capture already shows such a rewrite.
3. Enable the Spark module with HTTPS decryption working for its two listed
   hosts. Reopen Spark and capture a fresh customer-info request.
4. Confirm that `subscriber.entitlements.pro.product_identifier` matches
   the captured annual product, with a matching subscription expiration in
   2099. Test previously locked content in-app. An active Apple trial can confirm
   the app reads `pro`, but cannot by itself prove the rewrite grants access.

The script checks Spark's bundle header, falling back to its exact `Spark/`
user-agent prefix only when the bundle header is absent. It preserves other
apps, offerings, account profiles, unrelated purchases, and malformed/error
responses. It removes conditional-cache request headers only for Spark's
customer-info/receipt endpoints.

Local tests: `node js/spark.test.js`.

This is a client response experiment, not a server-side subscription grant.
The corrected `pro` rewrite has not been verified in-app without an active
Apple trial. If it still fails, obtain a capture with all RevenueCat rewrites
disabled to investigate cache behavior and any server-side content checks.
RevenueCat documents
[entitlement identifiers](https://www.revenuecat.com/docs/customers/customer-info),
[persistent caching](https://www.revenuecat.com/docs/test-and-launch/debugging/caching),
and [response signature verification](https://www.revenuecat.com/docs/customers/trusted-entitlements);
the archive does not establish whether Spark enforces signature verification.
