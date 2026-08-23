const EXPIRATION_TS = "2099-12-31T23:59:59+00:00";

try {
  const obj = JSON.parse($response?.body || "{}");
  const subscription =
    obj.subscription && typeof obj.subscription === "object"
      ? obj.subscription
      : {};

  Object.assign(subscription, {
    status: "intro-trial",
    expiration_ts: EXPIRATION_TS,
    trial_duration: "P100Y",
    on_hold: false,
    trial_available: true,
  });

  obj.subscription = subscription;
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`Lingvist sync script error: ${e}`);
  $done($response?.body ? { body: $response.body } : {});
}
