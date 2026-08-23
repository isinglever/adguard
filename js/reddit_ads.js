// Reddit 去广告：
// 1. 请求阶段拦截独立的评论广告操作 PdpCommentsAds。
// 2. 响应阶段移除 HomeFeedSdui 信息流中带 adPayload 的条目。
const INVALID_OPERATION_NAME = "NoSuchOperation";

(function () {
  try {
    if (typeof $response !== "undefined" && $response) {
      return handleResponse();
    }

    return handleRequest();
  } catch (error) {
    console.log("[reddit_ads] " + (error && error.stack || error));
    $done({});
  }
})();

function handleResponse() {
  if (!$response.body) return $done({});

  let payload;
  try {
    payload = JSON.parse($response.body);
  } catch (_) {
    return $done({});
  }

  const edges = payload
    && payload.data
    && payload.data.homeV3
    && payload.data.homeV3.elements
    && payload.data.homeV3.elements.edges;

  if (!Array.isArray(edges)) return $done({});

  const filteredEdges = edges.filter(function (edge) {
    const node = edge && edge.node;
    return !(node && node.adPayload);
  });

  const removedCount = edges.length - filteredEdges.length;
  if (removedCount === 0) return $done({});

  payload.data.homeV3.elements.edges = filteredEdges;
  console.log("[reddit_ads] removed " + removedCount + " HomeFeedSdui ad(s)");
  $done({ body: JSON.stringify(payload) });
}

function handleRequest() {
  if (typeof $request === "undefined" || !$request) return $done({});

  const headers = Object.assign({}, $request.headers || {});
  delete headers["x-reddit-translations"];
  delete headers["X-Reddit-Translations"];
  headers["x-reddit-translations"] = "enabled, seo, en";

  if (!$request.body) return $done({ headers: headers });

  const method = ($request.method || "GET").toUpperCase();
  if (method !== "POST") {
    return $done({ headers: headers, body: $request.body });
  }

  const contentType = (
    headers["Content-Type"]
    || headers["content-type"]
    || ""
  ).toLowerCase();

  if (contentType.includes("application/json")) {
    try {
      const payload = JSON.parse($request.body);
      if (invalidateCommentsAdOperation(payload)) {
        return $done({ headers: headers, body: JSON.stringify(payload) });
      }
      return $done({ headers: headers, body: $request.body });
    } catch (_) {
      // 解析失败时继续使用下方的精确文本替换。
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    try {
      const params = new URLSearchParams($request.body);
      if (params.has("operations")) {
        const operations = JSON.parse(params.get("operations"));
        if (invalidateCommentsAdOperation(operations)) {
          params.set("operations", JSON.stringify(operations));
          return $done({ headers: headers, body: params.toString() });
        }
      }
    } catch (_) {
      // 解析失败时继续使用下方的精确文本替换。
    }
  }

  const operationPattern = /("operationName"\s*:\s*")PdpCommentsAds(")/;
  if (operationPattern.test($request.body)) {
    return $done({
      headers: headers,
      body: $request.body.replace(
        operationPattern,
        "$1" + INVALID_OPERATION_NAME + "$2"
      )
    });
  }

  $done({ headers: headers, body: $request.body });
}

function invalidateCommentsAdOperation(payload) {
  if (!payload || payload.operationName !== "PdpCommentsAds") return false;
  payload.operationName = INVALID_OPERATION_NAME;
  return true;
}
