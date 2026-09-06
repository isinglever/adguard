// AI Chat upgrade-row filter, traced from the captured BoldVoice Hermes bundle.
// ScenariosList renders items with id === "locked" as an upsell regardless of
// isProSubscriber. Remove that sentinel, preserving real scenarios and counts.
(function () {
  var request = typeof $request === "object" && $request ? $request : {};
  var endpoint = /^https:\/\/production-server-mbem\.onrender\.com\/api\/v1\/generative\/scenarios\/page\/?(?:\?[^#]*)?$/;
  if (String(request.method || "GET").toUpperCase() !== "GET" || !endpoint.test(request.url || "")) return $done({});

  if (typeof $response === "undefined") {
    var headers = Object.assign({}, request.headers || {});
    Object.keys(headers).forEach(function (key) {
      if (/^(?:if-none-match|if-modified-since)$/i.test(key)) delete headers[key];
    });
    return $done({ headers: headers });
  }

  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function page(value) {
    return record(value) && value.level != null && Array.isArray(value.items);
  }
  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return $done({});
    var body = JSON.parse($response.body);
    if (!record(body)) return $done({});
    // The API returns one {level, items, ...} page or {pages: [...], allLevels}.
    var pages = Array.isArray(body.pages) ? body.pages : [body];
    if (!pages.every(page)) return $done({});
    var removed = 0;
    pages.forEach(function (page) {
      page.items = page.items.filter(function (item) {
        if (record(item) && item.id === "locked") {
          removed++;
          return false;
        }
        return true;
      });
    });
    console.log("[BoldVoice banner v1] removed " + removed + " upgrade row(s)");
    return $done(removed ? { body: JSON.stringify(body) } : {});
  } catch (_) {
    return $done({});
  }
})();
