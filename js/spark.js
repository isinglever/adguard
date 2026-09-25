// Spark 1.45.0 (600): local subscription-response experiment for Surge.
// The 2026-09-25 receipt response confirms the "pro" entitlement and product.
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
    var currentSubscription = record(subscriber.subscriptions[product]) ? subscriber.subscriptions[product] : {};
    var currentPro = record(subscriber.entitlements.pro) ? subscriber.entitlements.pro : {};
    var purchase = currentPro.purchase_date || currentSubscription.purchase_date || "2026-09-25T00:00:00Z";
    var expires = "2099-12-01T00:00:00Z";
    subscriber.subscriptions[product] = Object.assign({}, currentSubscription, {
      is_sandbox: false,
      ownership_type: "PURCHASED",
      period_type: "normal",
      store: "app_store",
      purchase_date: purchase,
      original_purchase_date: currentSubscription.original_purchase_date || purchase,
      expires_date: expires,
      grace_period_expires_date: null,
      billing_issues_detected_at: null,
      unsubscribe_detected_at: null
    });
    subscriber.entitlements.pro = Object.assign({}, currentPro, {
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
