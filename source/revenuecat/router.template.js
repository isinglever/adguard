// Generated entry point: node tools/build-revenuecat-router.js
// One RevenueCat owner for Surge; app handlers are bundled locally at build time.
(function () {
  var request = typeof $request === "object" && $request ? $request : {};
  var headers = request.headers || {};
  var completed = false;
  function finish(result) {
    if (!completed) {
      completed = true;
      $done(result);
    }
  }
  function header(name) {
    var key = Object.keys(headers).find(function (key) { return key.toLowerCase() === name; });
    return key ? String(headers[key]) : "";
  }
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  var match = /^https:\/\/api\.(?:revenuecat|rc-backup)\.com\/v1\/(subscribers\/[^/?#]+(?:\/(?:offerings|attributes))?\/?|receipts|product_entitlement_mapping)(?:\?[^#]*)?$/.exec(request.url || "");
  var method = String(request.method || "GET").toUpperCase();
  if (!match || (match[1] === "receipts" ? method !== "POST" : method !== "GET")) return finish({});

  var bundle = header("x-client-bundle-id");
  var ua = header("user-agent");
  var handler;
  if (bundle === "com.wellocution.iosapp") handler = runBoldVoice;
  else if (bundle === "com.mindcompany.spark") handler = runSpark;
  else if (/^BoldVoice\//.test(ua)) handler = bundle ? null : runBoldVoice;
  else if (/^Spark\//.test(ua)) handler = bundle ? null : runSpark;
  else if (/^Elevate(?:\/|$)/.test(ua)) handler = runElevate;
  else {
    var legacyPrefixes = /*__LEGACY_PREFIXES__*/ [];
    if (legacyPrefixes.some(function (prefix) { return ua.indexOf(prefix) === 0; })) handler = runLegacy;
  }
  // An unknown app must never fall through to the legacy script's generic grant.
  if (!handler) return finish({});

  if (typeof $response === "undefined") {
    var cleanHeaders = Object.assign({}, headers);
    Object.keys(cleanHeaders).forEach(function (key) {
      if (/^(?:x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)) delete cleanHeaders[key];
    });
    return finish({ headers: cleanHeaders });
  }
  if (match[1] === "product_entitlement_mapping" || /\/(?:offerings|attributes)\/?$/.test(match[1])) return finish({});
  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return finish({});
    var body = JSON.parse($response.body);
    if (!record(body) || !record(body.subscriber) || !record(body.subscriber.entitlements) || !record(body.subscriber.subscriptions)) return finish({});
    // Older handlers read only these two header spellings.
    var normalized = Object.assign({}, request, { headers: Object.assign({}, headers, { "User-Agent": ua, "user-agent": ua }) });
    handler(normalized, $response, finish);
  } catch (_) {
    finish({});
  }

  /*__HANDLERS__*/
})();
