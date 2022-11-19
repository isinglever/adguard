/**
 * @fileoverview Example of HTTP rewrite of request header.
 *
 * @supported Quantumult X (v1.0.5-build188)
 *
 * [rewrite_local]
 * ^http://example\.com/resource9/ url script-request-header sample-rewrite-request-header.js
 */

// $request.scheme, $request.method, $request.url, $request.path, $request.headers

// https://pbs.twimg.com/profile_images/1402420199878504452/VNa4mmSS_normal.jpg



let url = $request.url;
let path = $request.path;

let index1 = url.lastIndexOf('_'); // return the final _ index
let index2 = path.lastIndexOf('_');
let index3 = url.lastIndexOf('.');

let str1 = url.substr(0, index1);
let str2 = url.substr(index3);
let str3 = path.substr(0, index2);


let modifiedPath = str3 + str2;
let modifiedURL = str1 + str2;


$done({url: modifiedURL, path: modifiedPath});
// $done({path : modifiedPath});
// $done({}); // Not changed.
