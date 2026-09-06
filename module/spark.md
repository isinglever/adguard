# Spark subscription experiment

The supplied 2026-09-06 Surge archive identifies Spark 1.42.0 (575), bundle
`com.mindcompany.spark`. This module applies an Elevate-style local response
rewrite to Spark's RevenueCat customer-info response.

For normal use, enable `module/revenuecat.module` (RevenueCat Router), which
includes this Spark handler, and disable `module/spark.module`. This allows
Spark to coexist with BoldVoice and the other supported apps without competing
RevenueCat rules. See [the router migration guide](revenuecat.md).

## Capture findings

- Request 33023 (`api.spark.mindcompany.com/api/v1/users`) contains profile data,
  with none of the subscription fields used by `js/elevate.js`.
- Request 33021 contains the current offering `secondary_7dtrial_socialproof`,
  including `ios_subscription_annual_intro_7d_39.99_2026.03.10`.
  Surge marks this response modified, so these are captured values rather than
  independently verified upstream data.
- Request 33033 is also marked modified and contains the generic
  `com.ddgksf2013.premium.yearly` product. It cannot establish Spark's original
  subscription state or entitlement name. The `premium` name is an assumption
  inherited from this repository's existing Spark mapping in `js/revenue.js`.
- Request 33031 reports one remaining `chili_free_plays` token. Its relationship
  to paid access is unverified; this module does not change the token counter.

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
4. Confirm that `subscriber.entitlements.premium.product_identifier` matches
   the captured annual product, with a matching subscription expiration in
   2099. Then test the previously locked content in the app.

The script checks Spark's bundle header, falling back to its exact `Spark/`
user-agent prefix only when the bundle header is absent. It preserves other
apps, offerings, account profiles, unrelated purchases, and malformed/error
responses. It removes conditional-cache request headers only for Spark's
customer-info/receipt endpoints.

Local tests: `node js/spark.test.js`.

This is a client response experiment, not a server-side subscription grant.
In-app behavior has not been verified. If it still fails, obtain a capture with
all RevenueCat rewrites disabled to investigate the actual entitlement key,
cache behavior, and any server-side content checks. RevenueCat documents
[entitlement identifiers](https://www.revenuecat.com/docs/customers/customer-info),
[persistent caching](https://www.revenuecat.com/docs/test-and-launch/debugging/caching),
and [response signature verification](https://www.revenuecat.com/docs/customers/trusted-entitlements);
the archive does not establish whether Spark enforces signature verification.
