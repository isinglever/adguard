const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "reddit_response.js"), "utf8");

function run(body) {
  let result;
  vm.runInNewContext(script, {
    console: { log: function () {} },
    $response: { body: JSON.stringify(body) },
    $done: function (value) { result = value; }
  });
  assert.notEqual(result, undefined, "$done should be called");
  return result;
}

const feedResult = run({
  data: {
    homeV3: {
      elements: {
        edges: [
          { node: { id: "normal-cell", adPayload: null } },
          { node: { id: "advertisement", adPayload: { __typename: "AdPayload" } } },
          { node: { id: "normal-post" } }
        ]
      }
    }
  }
});
assert.deepEqual(
  JSON.parse(feedResult.body).data.homeV3.elements.edges.map(function (edge) {
    return edge.node.id;
  }),
  ["normal-cell", "normal-post"]
);

const experimentsResult = run({
  data: {
    experimentVariants: [
      {
        name: "games_tab_without_badging",
        experimentName: "ios_devvit_games_bottom_nav"
      },
      {
        name: "ios_devvit_games_bottom_nav",
        experimentName: "devvit_2026_ablation_meg"
      },
      { name: "enabled", experimentName: "ios_games_feed_evo" }
    ]
  }
});
assert.deepEqual(
  JSON.parse(experimentsResult.body).data.experimentVariants,
  [{ name: "enabled", experimentName: "ios_games_feed_evo" }]
);

assert.equal(Object.keys(run({ data: { postInfoById: {} } })).length, 0);

console.log("reddit_response tests passed");
