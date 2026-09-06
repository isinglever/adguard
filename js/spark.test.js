const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "spark.js"), "utf8");
const url = "https://api.revenuecat.com/v1/subscribers/test-user";
const headers = { "User-Agent": "Spark/575 CFNetwork/test", "X-Client-Bundle-Id": "com.mindcompany.spark" };
const fixture = {
  request_date: "2026-09-06T13:56:26Z",
  subscriber: {
    original_app_user_id: "test-user",
    entitlements: { unrelated: { product_identifier: "other" } },
    subscriptions: { other: { expires_date: null } },
    non_subscriptions: { keepsake: [] }
  }
};
function run({ request = {}, body = JSON.stringify(fixture), status = 200, requestOnly = false } = {}) {
  const results = [];
  const context = {
    $request: { url, headers, ...request },
    $done: result => results.push(JSON.parse(JSON.stringify(result)))
  };
  if (!requestOnly) context.$response = { body, status };
  vm.runInNewContext(source, context);
  assert.equal(results.length, 1, "complete exactly once");
  return results[0];
}
const result = JSON.parse(run().body);
const entitlement = result.subscriber.entitlements.premium;
const subscription = result.subscriber.subscriptions[entitlement.product_identifier];
assert.equal(entitlement.product_identifier, "ios_subscription_annual_intro_7d_39.99_2026.03.10");
assert.ok(Date.parse(entitlement.expires_date) > Date.parse(fixture.request_date));
assert.equal(subscription.expires_date, entitlement.expires_date);
assert.equal(subscription.period_type, "normal");
assert.equal(subscription.store, "app_store");
assert.equal(result.subscriber.original_app_user_id, "test-user");
assert.deepEqual(result.subscriber.non_subscriptions, fixture.subscriber.non_subscriptions);
assert.deepEqual(result.subscriber.entitlements.unrelated, fixture.subscriber.entitlements.unrelated);
assert.deepEqual(result.subscriber.subscriptions.other, fixture.subscriber.subscriptions.other);
assert.deepEqual(JSON.parse(run({ body: JSON.stringify(result) }).body), result);
for (const request of [
  { headers: {} },
  { headers: { "User-Agent": "Elevate/1" } },
  { headers: { "User-Agent": "SparkMail/1" } },
  { headers: { ...headers, "X-Client-Bundle-Id": "com.other.spark" } },
  { url: url + "/offerings" },
  { url: url + "/entitlements" },
  { url: "https://example.com/v1/subscribers/test-user" },
  { url: "https://api.spark.mindcompany.com/api/v1/users" }
]) assert.deepEqual(run({ request }), {});
for (const body of ["", "invalid", "null", "[]", '{"error":"unauthorized"}', '{"subscriber":{}}', '{"subscriber":{"entitlements":[],"subscriptions":{}}}']) {
  assert.deepEqual(run({ body }), {});
}
for (const status of [304, 401, 500, "HTTP/2 403 Forbidden"]) assert.deepEqual(run({ status }), {});
for (const request of [
  { headers: { "user-agent": "Spark/575" } },
  { headers: { "x-client-bundle-id": "com.mindcompany.spark" } },
  { url: url + "?test=1" },
  { url: url + "/" },
  { url: "https://api.rc-backup.com/v1/subscribers/test-user" },
  { url: "https://api.revenuecat.com/v1/receipts", method: "POST" }
]) assert.ok(run({ request }).body);
const cachedHeaders = { ...headers, "X-RevenueCat-ETag": "etag", "x-revenuecat-etag": "duplicate", "If-None-Match": "etag", Authorization: "test-only" };
assert.deepEqual(run({ requestOnly: true, request: { headers: cachedHeaders } }).headers, { ...headers, Authorization: "test-only" });
assert.equal(cachedHeaders["X-RevenueCat-ETag"], "etag");
assert.deepEqual(run({ requestOnly: true, request: { headers: { "User-Agent": "Elevate/1" } } }), {});
const moduleText = fs.readFileSync(path.join(__dirname, "../module/spark.module"), "utf8");
for (const line of moduleText.split("\n").filter(line => line.startsWith("spark_"))) {
  const pattern = new RegExp(line.match(/pattern=(.*?),requires-body=/)[1]);
  assert.ok(pattern.test(url));
  assert.ok(pattern.test(url + "?test=1"));
  assert.ok(!pattern.test(url + "/offerings"));
  assert.ok(!pattern.test("https://example.com/v1/subscribers/test-user"));
}
console.log("Spark: subscription consistency, app isolation, cache headers, malformed responses, and module patterns passed.");
