/**
 * Surge response inspector for Raycast account and trial routes.
 *
 * Default: log a summary and return the original body unchanged.
 * argument=mock-status=1: mock account fields on the two account GET routes.
 * Mock responses are labeled; this does not update the server-side account.
 */

(function inspectRaycastTrialResponse() {
  const originalBody =
    typeof $response !== "undefined" && typeof $response.body === "string"
      ? $response.body
      : "";
  const request = typeof $request !== "undefined" ? $request : {};
  const url = typeof request.url === "string" ? request.url : "unknown";
  const method = typeof request.method === "string" ? request.method : "unknown";
  const mockStatus =
    typeof $argument === "string" && $argument === "mock-status=1";
  let outputBody = originalBody;

  function trialSummary(user) {
    const subscription =
      user && typeof user.subscription === "object" && user.subscription
        ? user.subscription
        : {};
    const analytics =
      user && typeof user.trial_analytics === "object" && user.trial_analytics
        ? user.trial_analytics
        : {};

    return {
      subscription_status:
        subscription.status ?? user?.stripe_subscription_status ?? null,
      running:
        subscription.running ?? user?.has_running_subscription ?? null,
      active_subscription: user?.has_active_subscription ?? null,
      has_pro_features: user?.has_pro_features ?? null,
      trial_period_days: subscription.trial_period_days ?? null,
      trial_days_left: subscription.trial_days_left ?? null,
      awaiting_opt_in: subscription.awaiting_opt_in ?? null,
      can_apply_for_free_trial: user?.can_apply_for_free_trial ?? null,
      activation_state: user?.trial_activation_state ?? null,
      analytics_state: analytics.state ?? null,
      analytics_duration_days: analytics.duration_days ?? null,
    };
  }

  const summary = {
    method,
    url,
    response_bytes: originalBody.length,
    kind: "unknown",
  };

  try {
    const parsed = JSON.parse(originalBody || "{}");
    const accountRoute =
      /^https:\/\/backend\.raycast\.com\/api\/v1\/me(?:[?#].*)?$/.test(url);
    const sessionRoute =
      /^https:\/\/www\.raycast\.com\/frontend_api\/session(?:[?#].*)?$/.test(url);
    const user = sessionRoute ? parsed?.user : accountRoute ? parsed : null;
    if (
      mockStatus && method === "GET" &&
      user && typeof user === "object" && !Array.isArray(user) &&
      user.subscription && typeof user.subscription === "object" &&
      !Array.isArray(user.subscription)
    ) {
      summary.before = trialSummary(user);
      Object.assign(user.subscription, {
        status: "trialing",
        running: true,
        trial_days_left: 7,
        trial_period_days: 7,
        awaiting_opt_in: false,
      });
      Object.assign(user, {
        stripe_subscription_status: "trialing",
        has_running_subscription: true,
        has_pro_features: true,
        has_active_subscription: true,
        can_apply_for_free_trial: true,
      });
      parsed._raycast_inspector_test = "MOCK STATUS — client response only";
      outputBody = JSON.stringify(parsed);
      summary.mock_applied = true;
    }

    if (parsed && typeof parsed.user === "object" && parsed.user) {
      summary.kind = "frontend-session";
      summary.trial = trialSummary(parsed.user);
    } else if (parsed && typeof parsed.subscription === "object") {
      summary.kind = "current-user";
      summary.trial = trialSummary(parsed);
    } else if (
      parsed &&
      (Object.prototype.hasOwnProperty.call(parsed, "outcome") ||
        Object.prototype.hasOwnProperty.call(parsed, "retryable"))
    ) {
      summary.kind = "pro-trial-activation";
      summary.outcome = parsed.outcome ?? null;
      summary.retryable = parsed.retryable ?? null;
    } else {
      summary.kind = "json-other";
    }
  } catch (error) {
    if (/\/upgrade\/trial\/continue(?:[?#]|$)/.test(url)) {
      summary.kind = "trial-continue-rsc";
      summary.markers = {
        mentions_trial: /trial/i.test(originalBody),
        mentions_subscription: /subscription/i.test(originalBody),
        mentions_opt_in: /opt[_ -]?in/i.test(originalBody),
      };
    } else {
      summary.kind = "non-json";
      summary.parse_error = String(error && error.message ? error.message : error);
    }
  }

  console.log(`[raycast-trial-inspector] ${JSON.stringify(summary)}`);
  $done({ body: outputBody });
})();
