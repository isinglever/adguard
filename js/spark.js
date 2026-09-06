// Spark 1.42.0 (575): local subscription-response experiment for Surge.
// Product captured in secondary_7dtrial_socialproof on 2026-09-06.
// "premium" is inherited from revenue.js, not verified by a clean capture.
(function () {
  var request = typeof $request === "object" ? $request : {};
  var headers = request.headers || {};
  function header(name) {
    var key = Object.keys(headers).find(function (key) {
      return key.toLowerCase() === name;
    });
    return key ? String(headers[key]) : "";
  }
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  var bundle = header("x-client-bundle-id");
  var spark = bundle ? bundle === "com.mindcompany.spark" : /^Spark\//.test(header("user-agent"));
  var endpoint = /^https:\/\/api\.(?:revenuecat|rc-backup)\.com\/v1\/(?:subscribers\/[^/?#]+\/?|receipts)(?:\?[^#]*)?$/;
  if (!spark || !endpoint.test(request.url || "")) return $done({});

  if (typeof $response === "undefined") {
    var cleanHeaders = Object.assign({}, headers);
    Object.keys(cleanHeaders).forEach(function (key) {
      if (/^(?:x-revenuecat-etag|if-none-match)$/i.test(key)) delete cleanHeaders[key];
    });
    return $done({ headers: cleanHeaders });
  }

  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return $done({});
    var body = JSON.parse($response.body);
    if (!record(body) || !record(body.subscriber)) return $done({});
    var subscriber = body.subscriber;
    if (!record(subscriber.entitlements) || !record(subscriber.subscriptions)) return $done({});

    var product = "ios_subscription_annual_intro_7d_39.99_2026.03.10";
    var purchase = "2026-09-06T00:00:00Z";
    var expires = "2099-12-01T00:00:00Z";
    subscriber.subscriptions[product] = Object.assign({}, subscriber.subscriptions[product], {
      is_sandbox: false,
      ownership_type: "PURCHASED",
      period_type: "normal",
      store: "app_store",
      purchase_date: purchase,
      original_purchase_date: purchase,
      expires_date: expires,
      grace_period_expires_date: null,
      billing_issues_detected_at: null,
      unsubscribe_detected_at: null
    });
    subscriber.entitlements.premium = Object.assign({}, subscriber.entitlements.premium, {
      product_identifier: product,
      purchase_date: purchase,
      expires_date: expires,
      grace_period_expires_date: null
    });
    return $done({ body: JSON.stringify(body) });
  } catch (_) {
    return $done({});
  }
})();
