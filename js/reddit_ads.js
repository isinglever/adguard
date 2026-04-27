// reddit_opname_kill.js
// 将 operationName=PdpCommentsAds 改为无效值
const INVALID_NAME = "NoSuchOperation";

(function () {
  try {
    if (!$request || !$request.body) return $done({});

    const headers = $request.headers || {};
    const ct = (headers["Content-Type"] || headers["content-type"] || "").toLowerCase();
    const method = ($request.method || "GET").toUpperCase();

    if (method !== "POST") return $done({});

    // 1) 纯 JSON 的情况（最常见）
    if (ct.includes("application/json")) {
      try {
        const j = JSON.parse($request.body);
        if (j && j.operationName === "PdpCommentsAds") {
          j.operationName = INVALID_NAME;

          // （可选）更“保险”的做法：同时破坏 persistedQuery，避免服务端忽略 operationName 直接用 hash 命中
          // if (j.extensions?.persistedQuery) {
          //   // 方式 A：删掉
          //   // delete j.extensions.persistedQuery;
          //   // 方式 B：篡改
          //   j.extensions.persistedQuery.sha256Hash = "x";
          // }

          return $done({ body: JSON.stringify(j) });
        }
        return $done({});
      } catch (_) {
        // 继续尝试下面的兜底正则
      }
    }

    // 2) x-www-form-urlencoded（GraphQL Upload 等常见把 JSON 放在某个字段里）
    if (ct.includes("application/x-www-form-urlencoded")) {
      try {
        const params = new URLSearchParams($request.body);
        // 常见字段名是 "operations"
        if (params.has("operations")) {
          const ops = JSON.parse(params.get("operations"));
          if (ops && ops.operationName === "PdpCommentsAds") {
            ops.operationName = INVALID_NAME;

            // （可选）同时处理 persistedQuery（见上）
            // if (ops.extensions?.persistedQuery) {
            //   ops.extensions.persistedQuery.sha256Hash = "x";
            // }

            params.set("operations", JSON.stringify(ops));
            return $done({ body: params.toString() });
          }
        }
      } catch (_) {}
      // 没有 operations 或解析失败则继续兜底
    }

    // 3) 兜底：文本直接替换（谨慎，尽量只换这一个键值对）
    // 只替换第一处，避免误伤其它字符串
    const bodyText = $request.body;
    const re = /("operationName"\s*:\s*")PdpCommentsAds(")/;
    if (re.test(bodyText)) {
      const newBody = bodyText.replace(re, `$1${INVALID_NAME}$2`);
      return $done({ body: newBody });
    }

    // 不匹配则放行
    $done({});
  } catch (e) {
    console.log("[opname_kill] " + (e && e.stack || e));
    $done({});
  }
})();