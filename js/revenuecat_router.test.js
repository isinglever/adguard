const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const source = read("js/revenuecat_router.js");
const url = "https://api.rc-backup.com/v1/subscribers/synthetic-user";
const fixture = {
  subscriber: {
    original_app_user_id: "synthetic-user",
    entitlements: { unrelated: { product_identifier: "unrelated" } },
    subscriptions: {
      unrelated: { expires_date: null },
      "com.wellocution.iosapp.subscription.yearone": { purchase_date: "2025-04-22T05:42:44Z" }
    },
    non_subscriptions: { keepsake: [] }
  }
};
function run({ script = source, request = {}, body = JSON.stringify(fixture), status = 200, requestOnly = false } = {}) {
  const calls = [];
  const context = {
    $request: { url, method: "GET", headers: { "User-Agent": "BoldVoice/5" }, ...request },
    $done: result => calls.push(JSON.parse(JSON.stringify(result))),
    console: { log() {} },
    $httpClient: { get() { throw new Error("No runtime downloads allowed"); } }
  };
  if (!requestOnly) context.$response = { body, status };
  vm.runInNewContext(script, context, { timeout: 1000 });
  assert.equal(calls.length, 1, "complete exactly once");
  return calls[0];
}
for (const [ua, file] of [["BoldVoice/5", "js/boldvoice.js"], ["Spark/575", "js/spark.js"], ["Elevate/1", "js/revenuecat.js"]]) {
  const request = { headers: { "User-Agent": ua } };
  assert.deepEqual(run({ request }), run({ request, script: read(file) }), "preserve existing handler behavior: " + ua);
}
const legacy = read("js/revenue.js");
const mapping = vm.runInNewContext("(" + legacy.match(/const mapping = (\{[\s\S]*?\n\});/)[1] + ")");
let count = 0;
for (const key of Object.keys(mapping).filter(key => !["BoldVoice/", "Spark"].includes(key))) {
  const request = { headers: { "User-Agent": key + (key.endsWith("/") ? "1" : "/1") } };
  assert.deepEqual(run({ request }), run({ request, script: legacy }), "legacy compatibility: " + key);
  count++;
}
for (const headers of [
  { "x-client-bundle-id": "com.wellocution.iosapp" },
  { "x-client-bundle-id": "com.wellocution.iosapp", "User-Agent": "Spark/575" },
  { "uSeR-aGeNt": "BoldVoice/5" }
]) assert.equal(JSON.parse(run({ request: { headers } }).body).subscriber.entitlements.subscription.product_identifier, "com.wellocution.iosapp.subscription.yearone");
for (const headers of [
  { "X-Client-Bundle-Id": "com.mindcompany.spark" },
  { "x-client-bundle-id": "com.mindcompany.spark", "User-Agent": "BoldVoice/5" }
]) assert.equal(JSON.parse(run({ request: { headers } }).body).subscriber.entitlements.premium.product_identifier, "ios_subscription_annual_intro_7d_39.99_2026.03.10");
assert.equal(JSON.parse(run({ request: { headers: { "uSeR-aGeNt": "HTTPBot/1" } } }).body).subscriber.entitlements.pro.product_identifier, "com.ddgksf2013.premium.yearly");
for (const headers of [
  {}, { "User-Agent": "UnregisteredApplication/1" }, { "User-Agent": "SparkMail/1" },
  { "User-Agent": "BoldVoice/5", "X-Client-Bundle-Id": "com.other.app" },
  { "User-Agent": "Spark/575", "x-client-bundle-id": "com.other.app" }
]) {
  assert.deepEqual(run({ request: { headers } }), {});
  assert.deepEqual(run({ requestOnly: true, request: { headers: { ...headers, "X-RevenueCat-ETag": "keep" } } }), {});
}
for (const ua of ["BoldVoice/5", "Spark/575", "Elevate/1", "HTTPBot/1"]) {
  const headers = { "User-Agent": ua, "x-revenuecat-etag": "one", "X-RevenueCat-ETag": "two", "IF-NONE-MATCH": "three", "If-Modified-Since": "date", Authorization: "synthetic-token" };
  for (const target of [url, url + "/offerings", url + "/attributes", "https://api.revenuecat.com/v1/product_entitlement_mapping"]) {
    assert.deepEqual(run({ requestOnly: true, request: { url: target, headers } }), { headers: { "User-Agent": ua, Authorization: "synthetic-token" } });
  }
  assert.equal(headers["X-RevenueCat-ETag"], "two");
}
for (const request of [
  { url: url.replace("rc-backup", "revenuecat") }, { url: url + "/?test=1" },
  { url: "https://api.rc-backup.com/v1/receipts?test=1", method: "POST" }
]) assert.ok(run({ request }).body);
for (const request of [
  { url: url + "/offerings" }, { url: url + "/attributes" },
  { url: "https://api.rc-backup.com/v1/product_entitlement_mapping" },
  { url: url + "/unknown" }, { method: "DELETE" },
  { url: "https://api.rc-backup.com/v1/receipts" },
  { url: "https://example.com/v1/subscribers/synthetic-user" },
  { url: "https://boldvoice-prod.herokuapp.com/api/v1/profile" }
]) assert.deepEqual(run({ request }), {});
for (const body of ["", "invalid", "null", "[]", '{"subscriber":{}}', '{"subscriber":{"entitlements":[],"subscriptions":{}}}']) assert.deepEqual(run({ body }), {});
for (const status of [304, 401, 403, 500, "HTTP/2 403 Forbidden"]) assert.deepEqual(run({ status }), {});
console.log("RevenueCat router: four handlers, " + count + " legacy mappings, bundle priority, isolation, cache headers, and invalid responses passed.");
