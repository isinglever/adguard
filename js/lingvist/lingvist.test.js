const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const scriptDirectory = __dirname;

function runScript(fileName, globals) {
  let result;
  let doneCalls = 0;
  const logs = [];
  const context = {
    ...globals,
    console: { log: (message) => logs.push(String(message)) },
    $done: (value) => {
      doneCalls += 1;
      result = value;
    },
  };

  const source = fs.readFileSync(path.join(scriptDirectory, fileName), "utf8");
  vm.runInNewContext(source, context, { filename: fileName });
  assert.equal(doneCalls, 1, `${fileName} must call $done exactly once`);

  return { result, logs };
}

function parseBody(runResult) {
  assert.equal(typeof runResult.result?.body, "string");
  return JSON.parse(runResult.result.body);
}

{
  const input = {
    services: [],
    has_historical_services: true,
    latest_historical_service_paid: false,
  };
  const output = parseBody(
    runScript("lingvist_services.js", {
      $response: { body: JSON.stringify(input) },
    }),
  );

  assert.equal(output.services.length, 1);
  assert.equal(output.services[0].service, "unlimited");
  assert.equal(output.services[0].is_active, true);
  assert.equal(output.services[0].is_infinite, true);
  assert.equal(output.services[0].subscription.status, "permanent-full");
  assert.match(output.services[0].subscription.expiration_ts, /^2099-/);
  assert.equal(output.has_historical_services, false);
}

{
  const input = {
    subscription: {
      status: "free",
      expiration_ts: null,
      trial_duration: "P14D",
      on_hold: false,
      trial_available: false,
    },
  };
  const output = parseBody(
    runScript("lingvist_sync.js", {
      $response: { body: JSON.stringify(input) },
    }),
  );

  assert.equal(output.subscription.status, "intro-trial");
  assert.equal(output.subscription.trial_duration, "P100Y");
  assert.equal(output.subscription.trial_available, true);
  assert.match(output.subscription.expiration_ts, /^2099-/);
}

{
  const bookmark = {
    schema: "urn:lingvist:schemas:api:course_bookmark:1.6",
    questions: { new_unit_sn: -1 },
    subscription_limited: true,
  };
  const input = {
    course_state: {
      bookmark: JSON.stringify(bookmark),
      queues: {
        new: 2,
        repeats_below_horizon: 2,
        repeats_waiting: 2,
        exercises: 0,
      },
    },
  };
  const output = parseBody(
    runScript("lingvist_course_request.js", {
      $request: {
        method: "POST",
        body: JSON.stringify(input),
      },
    }),
  );
  const outputBookmark = JSON.parse(output.course_state.bookmark);

  assert.equal(outputBookmark.subscription_limited, false);
  assert.equal(outputBookmark.questions.new_unit_sn, -1);
  assert.equal(output.course_state.queues.new, 0);
  assert.equal(output.course_state.queues.repeats_waiting, 100);
  assert.equal(output.course_state.queues.repeats_below_horizon, 100);
}

{
  const input = {
    course_state: {
      bookmark: JSON.stringify({
        questions: { new_unit_sn: 42 },
        subscription_limited: true,
      }),
      queues: {
        new: 1,
        repeats_below_horizon: 120,
        repeats_waiting: 125,
      },
    },
  };
  const output = parseBody(
    runScript("lingvist_course_request.js", {
      $request: {
        method: "POST",
        body: JSON.stringify(input),
      },
    }),
  );

  assert.equal(output.course_state.queues.new, 0);
  assert.equal(output.course_state.queues.repeats_below_horizon, 120);
  assert.equal(output.course_state.queues.repeats_waiting, 125);
  assert.equal(
    JSON.parse(output.course_state.bookmark).questions.new_unit_sn,
    42,
  );
}

{
  const questions = [
    { lexical_unit_uuid: "question-1", variation_uuid: "general" },
    { lexical_unit_uuid: "question-2", variation_uuid: "general" },
  ];
  const input = {
    course_state: {
      expiration_ts: null,
      questions,
      upsells: [{ type: "store-uri" }],
      variation_categories: [
        {
          variations: [
            { name: "General language", paid: false },
            { name: "Travel", paid: true },
          ],
        },
      ],
    },
    meta: {
      bookmark: JSON.stringify({ subscription_limited: true }),
    },
  };
  const output = parseBody(
    runScript("lingvist_course_response.js", {
      $response: { body: JSON.stringify(input) },
    }),
  );
  const outputBookmark = JSON.parse(output.meta.bookmark);

  assert.equal(outputBookmark.subscription_limited, false);
  assert.match(output.course_state.expiration_ts, /^2099-/);
  assert.deepEqual(output.course_state.upsells, []);
  assert.equal(
    output.course_state.variation_categories.every((category) =>
      category.variations.every((variation) => variation.paid === false),
    ),
    true,
  );
  assert.deepEqual(output.course_state.questions, questions);
}

console.log("Lingvist scripts: all tests passed");
