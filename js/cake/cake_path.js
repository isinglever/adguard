
try {
  if (typeof $response !== 'undefined' && $response && $response.body) {
    var obj = JSON.parse($response.body || '{}');

    function pruneAds(value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (Array.isArray(value)) {
        for (var i = value.length - 1; i >= 0; i -= 1) {
          var item = value[i];
          if (item && typeof item === 'object' && item.type === 'AD') {
            value.splice(i, 1);
          } else {
            pruneAds(item);
          }
        }
        return;
      }

      var keys = Object.keys(value);
      for (var j = 0; j < keys.length; j += 1) {
        pruneAds(value[keys[j]]);
      }
    }

    pruneAds(obj);
    $done({ body: JSON.stringify(obj) });
    return;
  }
} catch (e) {
  console.log('cake path script error: ' + e);
  if ($response && $response.body) {
    $done({ body: $response.body });
  } else {
    $done({});
  }
  return;
}

if (typeof $request !== 'undefined' && $request && typeof $request.path === 'string') {
  var modifiedPath = $request.path.replace('&appVersion=5.5.0', '');
  $done({ path: modifiedPath });
  return;
}

$done({});
