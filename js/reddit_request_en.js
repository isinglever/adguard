// Reddit 请求处理：启用英文翻译，并拦截评论广告操作 PdpCommentsAds。
const INVALID_OPERATION_NAME = "NoSuchOperation";
const TRANSLATIONS_HEADER = "enabled, seo, en";
const TRANSLATION_TOGGLE_OPERATIONS = ["PostsContent", "CommentsByIds"];
const UNTRANSLATED_FEED_OPERATIONS = ["SubredditFeedSdui"];

(function () {
  try {
    return handleRequest();
  } catch (error) {
    console.log("[reddit_request] " + (error && error.stack || error));
    $done({});
  }
})();

function handleRequest() {
  if (typeof $request === "undefined" || !$request) return $done({});

  const headers = Object.assign({}, $request.headers || {});
  let existingTranslationsHeader;
  Object.keys(headers).forEach(function (name) {
    if (name.toLowerCase() !== "x-reddit-translations") return;
    existingTranslationsHeader = headers[name];
    delete headers[name];
  });

  const operationName = getOperationName($request.body, headers);
  const isTranslationToggle = TRANSLATION_TOGGLE_OPERATIONS.includes(operationName);
  const isUntranslatedFeed = UNTRANSLATED_FEED_OPERATIONS.includes(operationName);
  const explicitlyEnabled = typeof existingTranslationsHeader === "string"
    && existingTranslationsHeader.toLowerCase().includes("enabled");

  // PostsContent / CommentsByIds 同时用于 Translate 和 Show original。
  // 有 enabled header 时翻译成英文；没有时保留原文请求，不强制注入。
  if (isUntranslatedFeed) {
    // Reddit 的 subreddit feed 不支持这个翻译 header，注入后会返回空/残缺列表。
  } else if (!isTranslationToggle || explicitlyEnabled) {
    headers["x-reddit-translations"] = TRANSLATIONS_HEADER;
  } else if (existingTranslationsHeader !== undefined) {
    headers["x-reddit-translations"] = existingTranslationsHeader;
  }

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

function getOperationName(body, headers) {
  if (!body) return "";

  const contentType = (
    headers["Content-Type"]
    || headers["content-type"]
    || ""
  ).toLowerCase();
  if (!contentType.includes("application/json")) return "";

  try {
    const payload = JSON.parse(body);
    return payload && payload.operationName || "";
  } catch (_) {
    return "";
  }
}
