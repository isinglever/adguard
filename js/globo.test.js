const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "globo.js"), "utf8");
const headers = { "User-Agent": "globo/2.3.1 (app.getglobo.ios; build:9; iOS 27.2.0) Alamofire/5.12.2" };
const configUrl = "https://api.getglobo.app/api/app-config";
const profileUrl = "https://api.getglobo.app/api/users/120531/profile/full";
function run({ url = configUrl, method = "GET", requestHeaders = headers, body = { entitlement: {}, ads: { enabled: true } }, status = 200 } = {}) {
  const calls = [];
  vm.runInNewContext(source, {
    $request: { url, method, headers: requestHeaders },
    $response: { status, body: JSON.stringify(body) },
    $done: value => calls.push(JSON.parse(JSON.stringify(value)))
  }, { timeout: 1000 });
  assert.equal(calls.length, 1);
  return calls[0];
}

const config = JSON.parse(run().body);
assert.deepEqual(config.entitlement, { plan: "elite", expiresUtc: "2099-12-01T00:00:00Z" });
assert.deepEqual(config.ads, { enabled: true });
assert.deepEqual(JSON.parse(run({ body: config }).body), config);
const profile = JSON.parse(run({ url: profileUrl, body: { id: 120531, name: "Test", level: { number: 6 } } }).body);
assert.equal(profile.badge, "elite");
assert.equal(profile.name, "Test");
assert.equal(profile.level.number, 6);
for (const [url, body] of [
  ["https://api.getglobo.app/api/streak/status", { userId: 120531, freezesAvailable: 1 }],
  ["https://api.getglobo.app/api/billing/apple/verify", { plan: "elite" }],
  ["https://api.getglobo.app/api/courses", { courses: [] }],
  ["https://api.revenuecat.com/v1/subscribers/user", { entitlement: {} }],
  ["https://api.getglobo.app/api/users/120531/profile/full/extra", { id: 120531 }]
]) assert.deepEqual(run({ url, body }), {});
for (const requestHeaders of [{}, { "User-Agent": "Spark/600" }, { "User-Agent": "globo/2.3.1 (other.app; build:9)" }]) {
  assert.deepEqual(run({ requestHeaders }), {});
}
for (const status of [304, 401, 500, "HTTP/2 403 Forbidden"]) assert.deepEqual(run({ status }), {});
for (const body of [null, [], "invalid", { other: true }, { entitlement: [] }]) {
  assert.deepEqual(run({ body }), {});
}
assert.deepEqual(run({ url: profileUrl, body: { badge: "none" } }), {});
assert.deepEqual(run({ method: "POST" }), {});

const moduleText = fs.readFileSync(path.join(__dirname, "../module/globo.module"), "utf8");
const rules = moduleText.split("\n").filter(line => line.startsWith("globo_elite_"));
assert.equal(rules.length, 2);
for (const rule of rules) {
  const pattern = new RegExp(rule.match(/pattern=(.*?),requires-body=/)[1]);
  assert.ok(pattern.test(rule.startsWith("globo_elite_config") ? configUrl : profileUrl));
  assert.ok(!pattern.test("https://api.getglobo.app/api/billing/apple/verify"));
}
console.log("Globo: Elite fields, response preservation, app isolation, and module patterns passed.");
