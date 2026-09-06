// BoldVoice 4.3.9 (5), captured 2026-09-06: local subscription response experiment.
// See module/boldvoice.md for evidence, setup, and unverified backend fields.
(function () {
  var request = typeof $request === "object" && $request ? $request : {};
  var headers = request.headers || {};
  var url = request.url || "";
  var method = String(request.method || "GET").toUpperCase();
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function header(name) {
    var key = Object.keys(headers).find(function (key) {
      return key.toLowerCase() === name;
    });
    return key ? String(headers[key]) : "";
  }
  var bundle = header("x-client-bundle-id");
  var boldvoice = bundle ? bundle === "com.wellocution.iosapp" : /^BoldVoice\//.test(header("user-agent"));
  var rc = /^https:\/\/api\.(?:revenuecat|rc-backup)\.com\/v1\/(subscribers\/[^/?#]+(?:\/offerings)?\/?|receipts|product_entitlement_mapping)(?:\?[^#]*)?$/.exec(url);
  var profile = /^https:\/\/boldvoice-prod\.herokuapp\.com\/api\/v1\/profile(\/subscription)?\/?(?:\?[^#]*)?$/.exec(url);
  var customerInfo = rc && !/\/offerings\/?$/.test(rc[1]) && rc[1] !== "product_entitlement_mapping";
  var rcMethod = rc && (rc[1] === "receipts" ? method === "POST" : method === "GET");
  var profileMethod = profile && (profile[1] ? method === "PUT" : method === "GET");
  if (!(rc && boldvoice && rcMethod) && !profileMethod) return $done({});

  if (typeof $response === "undefined") {
    var cleanHeaders = Object.assign({}, headers);
    Object.keys(cleanHeaders).forEach(function (key) {
      if (/^(?:x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)) delete cleanHeaders[key];
    });
    return $done({ headers: cleanHeaders });
  }
  // Offerings and the product mapping need fresh bodies, but no response edits.
  if (rc && !customerInfo) return $done({});

  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return $done({});
    var body = JSON.parse($response.body);
    if (!record(body)) return $done({});
    var user = profile ? (profile[1] ? body : body.user) : null;
    if (profile && (!record(user) || typeof user.isSubscriber !== "boolean")) return $done({});
    var subscriber = profile ? user.subscriptionData : body.subscriber;
    if (!record(subscriber) || !record(subscriber.entitlements) || !record(subscriber.subscriptions)) return $done({});

    var product = "com.wellocution.iosapp.subscription.yearone";
    var expires = "2099-12-01T00:00:00Z";
    var previous = record(subscriber.subscriptions[product]) ? subscriber.subscriptions[product] : {};
    var oldEntitlement = record(subscriber.entitlements.subscription) ? subscriber.entitlements.subscription : {};
    // Preserve an existing, valid purchase date; do not generate a future purchase.
    function purchaseDate(value, fallback) {
      var timestamp = typeof value === "string" ? Date.parse(value) : NaN;
      return Number.isFinite(timestamp) && timestamp <= Date.now() ? value : fallback;
    }
    var purchase = purchaseDate(previous.purchase_date, purchaseDate(oldEntitlement.purchase_date, new Date().toISOString()));
    var subscription = Object.assign({}, previous, {
      is_sandbox: false,
      ownership_type: "PURCHASED",
      period_type: "normal",
      store: "app_store",
      purchase_date: purchase,
      original_purchase_date: purchaseDate(previous.original_purchase_date, purchase),
      expires_date: expires,
      grace_period_expires_date: null,
      billing_issues_detected_at: null,
      unsubscribe_detected_at: null,
      refunded_at: null,
      auto_resume_date: null
    });
    subscriber.subscriptions[product] = subscription;
    subscriber.entitlements.subscription = Object.assign({}, oldEntitlement, {
      product_identifier: product,
      purchase_date: purchase,
      expires_date: expires,
      grace_period_expires_date: null
    });
    if (profile) {
      // The capture contains only expired_trial and an empty activeSubscriptions.
      // "active" and this product-keyed map are assumptions for in-app testing.
      user.isSubscriber = true;
      // Local Super upsell experiment; the banner's condition is not verified.
      // This does not establish a RevenueCat Pro entitlement or server access.
      user.isProSubscriber = true;
      user.subStatus = "active";
      user.subProduct = product;
      user.subscription_renews_or_expires_date = expires;
      user.grace_period_expires_date = null;
      user.last_purchase_date = purchase;
      user.failed_payment_date = null;
      user.refund_date = null;
      user.cancelled_date = null;
      if (Object.prototype.hasOwnProperty.call(user, "subscription_duration_in_months")) user.subscription_duration_in_months = 12;
      if (Object.prototype.hasOwnProperty.call(user, "subscription_store")) user.subscription_store = "app_store";
      if (record(subscriber.activeSubscriptions)) subscriber.activeSubscriptions[product] = Object.assign({}, subscription);
    }
    return $done({ body: JSON.stringify(body) });
  } catch (_) {
    return $done({});
  }
})();
