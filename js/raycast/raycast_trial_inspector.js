/**
 * Pass-through Surge response inspector for Raycast account and trial routes.
 *
 * The script deliberately does not modify subscription, entitlement, billing,
 * or trial data. It writes a small, non-identifying summary to the Surge script
 * log and returns the original response body unchanged.
 */

(function inspectRaycastTrialResponse() {
  const originalBody =
    typeof $response !== "undefined" && typeof $response.body === "string"
      ? $response.body
      : "";
  const request = typeof $request !== "undefined" ? $request : {};
  const url = typeof request.url === "string" ? request.url : "unknown";
  const method = typeof request.method === "string" ? request.method : "unknown";

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
  $done({ body: originalBody });
})();
