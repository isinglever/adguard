// Globo 2.3.1: local Elite response experiment for Surge.
// The captured Apple verification populated app-config.entitlement and profile.badge.
(function () {
  var request = typeof $request === "object" ? $request : {};
  var headers = request.headers || {};
  var userAgent = "";
  Object.keys(headers).forEach(function (key) {
    if (key.toLowerCase() === "user-agent") userAgent = String(headers[key]);
  });
  var url = request.url || "";
  var config = /^https:\/\/api\.getglobo\.app\/api\/app-config(?:\?[^#]*)?$/;
  var profile = /^https:\/\/api\.getglobo\.app\/api\/users\/\d+\/profile\/full(?:\?[^#]*)?$/;
  var isConfig = config.test(url);
  var isProfile = profile.test(url);
  if (!/^globo\/[^ ]+ \(app\.getglobo\.ios;/.test(userAgent) ||
      (request.method && String(request.method).toUpperCase() !== "GET") ||
      (!isConfig && !isProfile) || typeof $response === "undefined") return $done({});

  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return $done({});
    var body = JSON.parse($response.body);
    if (!body || typeof body !== "object" || Array.isArray(body)) return $done({});
    if (isConfig) {
      if (!body.entitlement || typeof body.entitlement !== "object" || Array.isArray(body.entitlement)) return $done({});
      body.entitlement.plan = "elite";
      body.entitlement.expiresUtc = "2099-12-01T00:00:00Z";
    } else {
      if (typeof body.id !== "number") return $done({});
      body.badge = "elite";
    }
    return $done({ body: JSON.stringify(body) });
  } catch (_) {
    return $done({});
  }
})();
