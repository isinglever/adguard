const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "boldvoice.js"), "utf8");
const product = "com.wellocution.iosapp.subscription.yearone";
const rcURL = "https://api.rc-backup.com/v1/subscribers/test-user";
const profileURL = "https://boldvoice-prod.herokuapp.com/api/v1/profile";
const headers = { "User-Agent": "BoldVoice/5 CFNetwork/test", "X-Client-Bundle-Id": "com.wellocution.iosapp" };
const subscriber = {
  entitlements: {
    subscription: { product_identifier: product, purchase_date: "2025-04-22T05:42:44Z", expires_date: "2025-04-29T05:42:44Z" },
    other: { product_identifier: "other", expires_date: null }
  },
  subscriptions: {
    [product]: {
      purchase_date: "2025-04-22T05:42:44Z", original_purchase_date: "2025-04-22T05:42:45Z",
      expires_date: "2025-04-29T05:42:44Z", period_type: "trial", store: "app_store",
      unsubscribe_detected_at: "2025-04-23T04:29:27Z", store_transaction_id: "synthetic-transaction",
      price: { amount: 0, currency: "USD" }
    },
    other: { expires_date: null }
  },
  activeSubscriptions: { other: { expires_date: null } },
  original_app_user_id: "test-user", subscriber_attributes: { "$email": { value: "test@example.invalid" } },
  non_subscriptions: {}, other_purchases: {}, management_url: null
};
const user = {
  id: "test-user", subscriptionData: subscriber, isSubscriber: false, isProSubscriber: false,
  subProduct: product, subStatus: "expired_trial", subscription_renews_or_expires_date: "2025-04-29T05:42:44.000Z",
  first_trial_or_purchase_date: "2025-04-22T05:42:45Z", last_purchase_date: "2025-04-22T05:42:44Z",
  cancelled_date: "2025-04-23T04:29:27Z", failed_payment_date: null, refund_date: null,
  subscription_duration_in_months: 12, subscription_store: "app_store", unlockAll: false,
  featureFlags: { "paywall-every-app-open-never-subscribed": true }, latestPurchaserInfo: null
};
function run({ request = {}, body = JSON.stringify({ subscriber }), status = 200, requestOnly = false, script = source } = {}) {
  const calls = [];
  const context = {
    $request: { url: rcURL, method: "GET", headers, ...request },
    $done: result => calls.push(JSON.parse(JSON.stringify(result))),
    console: { log() {} }, $httpClient: {}
  };
  if (!requestOnly) context.$response = { body, status };
  vm.runInNewContext(script, context, { timeout: 1000 });
  assert.equal(calls.length, 1, "complete exactly once");
  return calls[0];
}
function checkSubscriber(result) {
  const s = result.subscriptions[product], e = result.entitlements.subscription;
  assert.equal(e.product_identifier, product);
  assert.equal(s.expires_date, e.expires_date);
  assert.ok(Date.parse(e.expires_date) > Date.now());
  assert.equal(s.period_type, "normal");
  assert.equal(s.unsubscribe_detected_at, null);
  assert.equal(s.refunded_at, null);
  assert.equal(s.purchase_date, subscriber.subscriptions[product].purchase_date);
  assert.equal(s.store_transaction_id, "synthetic-transaction");
  assert.deepEqual(s.price, subscriber.subscriptions[product].price);
  for (const key of ["original_app_user_id", "subscriber_attributes", "non_subscriptions", "other_purchases"]) {
    assert.deepEqual(result[key], subscriber[key]);
  }
  assert.deepEqual(result.entitlements.other, subscriber.entitlements.other);
  assert.deepEqual(result.subscriptions.other, subscriber.subscriptions.other);
}
checkSubscriber(JSON.parse(run().body).subscriber);
for (const [url, method, fixture, nested] of [
  [profileURL + "?includeReferralRedemption=1", "GET", { user, referral: null }, true],
  [profileURL + "/subscription", "PUT", user, false]
]) {
  const request = { url, method, headers: {} };
  const result = JSON.parse(run({ request, body: JSON.stringify(fixture) }).body);
  const u = nested ? result.user : result;
  checkSubscriber(u.subscriptionData);
  assert.equal(u.isSubscriber, true);
  assert.equal(u.isProSubscriber, false);
  assert.equal(u.subStatus, "active");
  assert.equal(u.subProduct, product);
  assert.equal(u.subscription_renews_or_expires_date, u.subscriptionData.entitlements.subscription.expires_date);
  assert.equal(u.cancelled_date, null);
  assert.deepEqual(u.subscriptionData.activeSubscriptions[product], u.subscriptionData.subscriptions[product]);
  assert.deepEqual(u.subscriptionData.activeSubscriptions.other, subscriber.activeSubscriptions.other);
  for (const key of ["id", "featureFlags", "unlockAll", "first_trial_or_purchase_date", "latestPurchaserInfo"]) {
    assert.deepEqual(u[key], user[key]);
  }
  if (nested) assert.equal(result.referral, null);
  assert.deepEqual(JSON.parse(run({ request, body: JSON.stringify(result) }).body), result);
}
for (const request of [
  { headers: {} }, { headers: { "User-Agent": "Other/5" } }, { headers: { "User-Agent": "BoldVoiceOther/5" } },
  { headers: { ...headers, "X-Client-Bundle-Id": "com.other.app" } },
  { url: "https://example.com/v1/subscribers/test-user" }, { url: rcURL + "/attributes" },
  { url: rcURL + "/offerings" }, { url: "https://api.rc-backup.com/v1/product_entitlement_mapping" },
  { url: profileURL + "/referrals" }, { url: profileURL + "/push_settings" },
  { url: profileURL.replace("/profile", "/auth/refresh-token"), method: "POST" },
  { url: profileURL, method: "PUT" }, { url: profileURL + "/subscription", method: "GET" },
  { method: "DELETE" }
]) assert.deepEqual(run({ request }), {});
for (const request of [
  { headers: { "uSeR-aGeNt": "BoldVoice/5" } }, { headers: { "x-client-bundle-id": "com.wellocution.iosapp" } },
  { url: rcURL.replace("rc-backup", "revenuecat") }, { url: rcURL + "?test=1" }, { url: rcURL + "/" },
  { url: "https://api.rc-backup.com/v1/receipts", method: "POST" }
]) assert.ok(run({ request }).body);
const cached = { ...headers, "X-RevenueCat-ETag": "one", "x-revenuecat-etag": "two", "IF-NONE-MATCH": "three", "If-Modified-Since": "date", Authorization: "synthetic-token" };
for (const url of [rcURL, rcURL + "/offerings", "https://api.rc-backup.com/v1/product_entitlement_mapping", profileURL]) {
  assert.deepEqual(run({ requestOnly: true, request: { url, headers: cached } }).headers, { ...headers, Authorization: "synthetic-token" });
}
assert.equal(cached["X-RevenueCat-ETag"], "one", "do not mutate input headers");
assert.deepEqual(run({ requestOnly: true, request: { headers: { "User-Agent": "Spark/5", "x-revenuecat-etag": "keep" } } }), {});
for (const body of ["", "invalid", "null", "[]", '{"error":"unauthorized"}', '{"subscriber":{}}', '{"subscriber":{"entitlements":[],"subscriptions":{}}}']) {
  assert.deepEqual(run({ body }), {});
}
for (const body of ["null", '{"user":null}', '{"user":{"isSubscriber":false}}', JSON.stringify({ user: { ...user, isSubscriber: "false" } })]) {
  assert.deepEqual(run({ request: { url: profileURL }, body }), {});
}
for (const status of [204, 304, 401, 403, 500, "HTTP/2 304 Not Modified"]) {
  assert.deepEqual(run({ status, body: status === 204 ? "" : JSON.stringify({ subscriber }) }), {});
}
const empty = JSON.parse(run({ body: '{"subscriber":{"entitlements":{},"subscriptions":{}}}' }).body).subscriber;
assert.ok(empty.entitlements.subscription);
assert.ok(Date.parse(empty.subscriptions[product].purchase_date) <= Date.now());
assert.deepEqual(JSON.parse(run({ body: JSON.stringify({ subscriber: empty }) }).body).subscriber, empty);

// Verify the actual shared script's mapping, including its obfuscated dispatcher.
const shared = fs.readFileSync(path.join(__dirname, "revenue.js"), "utf8");
const mapped = JSON.parse(run({ script: shared }).body).subscriber;
assert.equal(mapped.entitlements.subscription.product_identifier, product);
assert.ok(mapped.subscriptions[product]);

const moduleText = fs.readFileSync(path.join(__dirname, "../module/boldvoice.module"), "utf8");
const rules = Object.fromEntries(moduleText.split("\n").filter(line => line.startsWith("boldvoice_")).map(line => [line.split(" = ")[0], new RegExp(line.match(/pattern=(.*?),requires-body=/)[1])]));
for (const [name, pattern] of Object.entries(rules)) {
  const url = name.includes("profile") ? profileURL : rcURL;
  for (const suffix of ["", "/", "?includeReferralRedemption=1"]) assert.ok(pattern.test(url + suffix));
  assert.ok(!pattern.test(url + "/attributes"));
  assert.ok(!pattern.test(url.replace(new URL(url).hostname, "example.com")));
}
assert.ok(rules.boldvoice_rc_request.test(rcURL + "/offerings"));
assert.ok(rules.boldvoice_rc_request.test("https://api.rc-backup.com/v1/product_entitlement_mapping"));
assert.ok(!rules.boldvoice_rc_response.test(rcURL + "/offerings"));
assert.ok(rules.boldvoice_profile_response.test(profileURL + "/subscription"));
console.log("BoldVoice: backend shapes, subscription consistency, isolation, cache headers, malformed responses, shared mapping, and module patterns passed.");
