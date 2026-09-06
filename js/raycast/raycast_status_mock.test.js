const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const script = fs.readFileSync(path.join(__dirname, "raycast_trial_inspector.js"), "utf8");
const me = "https://backend.raycast.com/api/v1/me";
const session = "https://www.raycast.com/frontend_api/session";
const account = {
  id: "test-account",
  has_pro_features: false,
  has_active_subscription: false,
  can_apply_for_free_trial: false,
  subscription: { status: "canceled", trial_days_left: 0, untouched: "keep" },
};
function run(url, body, argument = "mock-status=1", method = "GET") {
  const results = [], logs = [];
  vm.runInNewContext(script, {
    $request: { url, method }, $response: { body }, $argument: argument,
    console: { log: (line) => logs.push(line) },
    $done: (result) => results.push(result),
  });
  assert.equal(results.length, 1);
  assert.equal(logs.length, 1);
  return { body: results[0].body, summary: JSON.parse(logs[0].replace(/^\[raycast-trial-inspector\] /, "")) };
}
for (const url of [me, session]) {
  const body = JSON.stringify(url === me ? account : { user: account, unrelated: "keep" });
  assert.equal(run(url, body, "").body, body, "default must preserve the body");
  const result = run(url, body);
  const parsed = JSON.parse(result.body), user = parsed.user || parsed;
  assert.equal(user.subscription.status, "trialing");
  assert.equal(user.subscription.trial_days_left, 7);
  for (const key of ["has_pro_features", "has_active_subscription", "can_apply_for_free_trial"])
    assert.equal(user[key], true);
  assert.equal(user.id, account.id);
  assert.equal(user.subscription.untouched, "keep");
  assert.match(parsed._raycast_inspector_test, /MOCK STATUS/);
  assert.equal(result.summary.before.subscription_status, "canceled");
  assert.equal(result.summary.trial.subscription_status, "trialing");
  assert.equal(result.summary.mock_applied, true);
  if (url === session) assert.equal(parsed.unrelated, "keep");
}
for (const [url, body, method] of [
  [me, "not json", "GET"],
  [me, "null", "GET"],
  [me, '{"error":"unauthorized"}', "GET"],
  [me, JSON.stringify(account), "POST"],
  [me + "/pro_trial", JSON.stringify({ outcome: "already-started" }), "POST"],
  ["https://example.com/api/v1/me", JSON.stringify(account), "GET"],
]) assert.equal(run(url, body, "mock-status=1", method).body, body);
console.log("Raycast status mock: all tests passed");
