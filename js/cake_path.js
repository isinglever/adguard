
// $request.scheme, $request.method, $request.url, $request.path, $request.headers

var modifiedPath = $request.path;
modifiedPath = modifiedPath.replace("&appVersion=5.4.0", "");


$done({path: modifiedPath});
