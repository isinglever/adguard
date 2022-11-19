/**
 * @fileoverview Example of HTTP rewrite of request header.
 *
 * @supported Quantumult X (v1.0.5-build188)
 *
 * [rewrite_local]
 * ^http://example\.com/resource9/ url script-request-header sample-rewrite-request-header.js
 */

// $request.scheme, $request.method, $request.url, $request.path, $request.headers

const pre = "https://pbs.twimg.com";
const rear = ".jpg";

let url = $request.url;
let path = $request.path;

let mid = url.substr(21,44);

let modifiedPath = mid.concat(rear);
let modifiedURL = pre.concat(mid, rear);


$done({url: modifiedURL, path: modifiedPath});
// $done({path : modifiedPath});
// $done({}); // Not changed.
