const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
function rules(file) {
  return fs.readFileSync(path.join(root, "module", file), "utf8").split("\n")
    .filter(line => /^\w+\s*=\s*type=http-/.test(line))
    .map(line => ({
      name: line.split(" = ")[0],
      type: line.match(/type=(http-\w+)/)[1],
      pattern: new RegExp(line.match(/pattern=(.*?),requires-body=/)[1]),
      script: path.basename(new URL(line.match(/script-path=([^,]+)/)[1]).pathname)
    }));
}
const shared = rules("revenuecat.module"), boldvoice = rules("boldvoice.module");
assert.equal(shared.length, 2);
assert.equal(boldvoice.length, 4);
assert.ok(shared.every(rule => rule.script === "revenuecat_router.js"));
function execute(rule, url, headers, body) {
  const calls = [];
  vm.runInNewContext(fs.readFileSync(path.join(root, "js", rule.script), "utf8"), {
    $request: { url, method: "GET", headers }, $response: { status: 200, body: JSON.stringify(body) },
    $httpClient: {}, console: { log() {} }, $done: result => calls.push(result)
  }, { timeout: 1000 });
  assert.equal(calls.length, 1);
  return JSON.parse(calls[0].body);
}
for (const enabled of [[...shared, ...boldvoice], [...boldvoice, ...shared]]) {
  for (const host of ["api.revenuecat.com", "api.rc-backup.com"]) {
    for (const endpoint of ["subscribers/test-user", "subscribers/test-user/?q=1", "receipts?q=1"]) {
      const url = "https://" + host + "/v1/" + endpoint;
      for (const type of ["http-request", "http-response"]) {
        const matches = enabled.filter(rule => rule.type === type && rule.pattern.test(url));
        assert.equal(matches.length, 1, "one owner for " + type + " " + url);
        assert.ok(matches[0].name.startsWith("revenuecat_router_"));
      }
    }
    for (const endpoint of ["subscribers/test-user/offerings", "subscribers/test-user/attributes", "product_entitlement_mapping"]) {
      const url = "https://" + host + "/v1/" + endpoint;
      assert.equal(enabled.filter(rule => rule.type === "http-request" && rule.pattern.test(url)).length, 1);
      assert.equal(enabled.filter(rule => rule.type === "http-response" && rule.pattern.test(url)).length, 0);
    }
  }
  for (const url of [
    "https://boldvoice-prod.herokuapp.com/api/v1/profile?includeReferralRedemption=1",
    "https://boldvoice-prod.herokuapp.com/api/v1/profile/subscription",
    "https://production-server-mbem.onrender.com/api/v1/generative/scenarios/page?level=all"
  ]) {
    for (const type of ["http-request", "http-response"]) {
      const matches = enabled.filter(rule => rule.type === type && rule.pattern.test(url));
      assert.equal(matches.length, 1);
      assert.ok(matches[0].name.startsWith("boldvoice_"));
    }
  }
  const url = "https://api.rc-backup.com/v1/subscribers/test-user";
  const rule = enabled.find(rule => rule.type === "http-response" && rule.pattern.test(url));
  for (const [ua, entitlement, product] of [
    ["BoldVoice/5", "subscription", "com.wellocution.iosapp.subscription.yearone"],
    ["Spark/575", "premium", "ios_subscription_annual_intro_7d_39.99_2026.03.10"],
    ["Elevate/1", "pro", "com.elevateapp.elevate.lifetime_subscription"]
  ]) {
    const result = execute(rule, url, { "User-Agent": ua }, { subscriber: { entitlements: {}, subscriptions: {} } });
    assert.equal(result.subscriber.entitlements[entitlement].product_identifier, product);
  }
}
const retired = rules("spark.module");
assert.ok([...shared, ...retired].filter(rule => rule.type === "http-response" && rule.pattern.test("https://api.rc-backup.com/v1/subscribers/test-user")).length > 1, "migration must disable the standalone Spark module");
console.log("RevenueCat modules: single owner per phase and app routing verified in both recommended module orders.");
