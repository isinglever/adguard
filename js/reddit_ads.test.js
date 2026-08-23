const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "reddit_request.js"), "utf8");

function run(overrides) {
  let result;
  const context = Object.assign({
    console: { log: function () {} },
    URLSearchParams: URLSearchParams,
    $done: function (value) { result = value; }
  }, overrides);

  vm.runInNewContext(script, context);
  assert.notEqual(result, undefined, "$done should be called");
  return result;
}

const commentsRequest = run({
  $request: {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operationName: "PdpCommentsAds", variables: {} })
  }
});
assert.equal(JSON.parse(commentsRequest.body).operationName, "NoSuchOperation");
assert.equal(
  commentsRequest.headers["x-reddit-translations"],
  "enabled, seo, zh-hans"
);

const feedRequestBody = JSON.stringify({ operationName: "HomeFeedSdui" });
const feedRequest = run({
  $request: {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: feedRequestBody
  }
});
assert.equal(feedRequest.body, feedRequestBody);
assert.equal(
  feedRequest.headers["x-reddit-translations"],
  "enabled, seo, zh-hans"
);

const showOriginalBody = JSON.stringify({ operationName: "PostsContent" });
const showOriginalRequest = run({
  $request: {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: showOriginalBody
  }
});
assert.equal(showOriginalRequest.body, showOriginalBody);
assert.equal(showOriginalRequest.headers["x-reddit-translations"], undefined);

const translateRequest = run({
  $request: {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Reddit-Translations": "enabled, seo, en"
    },
    body: JSON.stringify({ operationName: "CommentsByIds" })
  }
});
assert.equal(
  translateRequest.headers["x-reddit-translations"],
  "enabled, seo, zh-hans"
);
assert.equal(translateRequest.headers["X-Reddit-Translations"], undefined);

console.log("reddit_request tests passed");
