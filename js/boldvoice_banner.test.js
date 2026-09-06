const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "boldvoice_banner.js"), "utf8");
const url = "https://production-server-mbem.onrender.com/api/v1/generative/scenarios/page";
const fixture = {
  level: 1, count: 7, numCompleted: 7, nextCursor: "keep",
  items: [
    { id: "beach", title: "Beach Vacation", score: 78, requiresSubscription: true },
    { id: "locked" },
    { id: "interview", locked: true, score: 79 },
    { id: "locked-lesson", requiresSubscription: true },
    { id: "LOCKED" }
  ]
};
function run({ request = {}, body = JSON.stringify(fixture), status = 200, requestOnly = false } = {}) {
  const calls = [], logs = [];
  const context = {
    $request: { url, method: "GET", headers: {}, ...request },
    $done: result => calls.push(JSON.parse(JSON.stringify(result))),
    console: { log: message => logs.push(message) }
  };
  if (!requestOnly) context.$response = { body, status };
  vm.runInNewContext(source, context, { timeout: 1000 });
  assert.equal(calls.length, 1);
  return { result: calls[0], logs };
}
const expected = { ...fixture, items: [fixture.items[0], ...fixture.items.slice(2)] };
const single = run({ request: { url: url + "?level=1" } });
assert.deepEqual(JSON.parse(single.result.body), expected);
assert.deepEqual(single.logs, ["[BoldVoice banner v1] removed 1 upgrade row(s)"]);
assert.deepEqual(run({ body: JSON.stringify(expected) }).result, {}, "no rewrite when banner absent");
const multiple = {
  pages: [fixture, { level: 2, count: 1, numCompleted: 0, items: [{ id: "locked" }, { id: "real-lesson" }, { id: "locked" }] }],
  allLevels: [1, 2], subscription: { isProSubscriber: false }, metadata: { id: "locked" }
};
const multiResult = run({ request: { url: url + "?level=all" }, body: JSON.stringify(multiple) });
assert.deepEqual(JSON.parse(multiResult.result.body), {
  ...multiple, pages: [expected, { ...multiple.pages[1], items: [{ id: "real-lesson" }] }]
});
assert.deepEqual(multiResult.logs, ["[BoldVoice banner v1] removed 3 upgrade row(s)"]);
for (const request of [
  { method: "POST" }, { url: url + "/extra" },
  { url: url.replace("production-server-mbem.onrender.com", "example.com") },
  { url: url.replace("scenarios/page", "conversations") },
  { url: "https://production-server-mbem.onrender.com/api/v1/profile/subscription", method: "PUT" },
  { url: "https://production-server-mbem.onrender.com/api/v3/graphql", method: "POST" }
]) {
  assert.deepEqual(run({ request }).result, {});
  assert.deepEqual(run({ request, requestOnly: true }).result, {});
}
for (const body of ["", "invalid", "null", "[]", '{}', '{"items":[{"id":"locked"}]}', '{"level":1,"items":{}}', '{"pages":[null]}', JSON.stringify({ pages: [fixture, { level: 2 }] })]) {
  assert.deepEqual(run({ body }).result, {});
}
for (const status of [304, 401, 403, 500, "HTTP/2 304"]) assert.deepEqual(run({ status }).result, {});
const headers = { "If-None-Match": "cached", "if-none-match": "duplicate", "IF-MODIFIED-SINCE": "date", Authorization: "synthetic-token", Accept: "application/json" };
assert.deepEqual(run({ requestOnly: true, request: { headers } }).result, { headers: { Authorization: "synthetic-token", Accept: "application/json" } });
assert.equal(headers["If-None-Match"], "cached");
console.log("BoldVoice banner: single/all-level pages, precise sentinel removal, progress preservation, cache headers, routing, and malformed responses passed.");
