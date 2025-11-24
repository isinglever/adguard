;(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }

    var obj = JSON.parse($response.body || '{}');

    function unlimitFreeUser(value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) {
          unlimitFreeUser(value[i]);
        }
        return;
      }

      if (Object.prototype.hasOwnProperty.call(value, 'freeUserLimited')) {
        value.freeUserLimited = false;
      }

      var keys = Object.keys(value);
      for (var j = 0; j < keys.length; j += 1) {
        unlimitFreeUser(value[keys[j]]);
      }
    }

    unlimitFreeUser(obj);

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake free user limit script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
