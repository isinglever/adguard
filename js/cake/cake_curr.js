;(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }

    var obj = JSON.parse($response.body || '{}');

    function markAvailable(value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) {
          markAvailable(value[i]);
        }
        return;
      }

      if (Object.prototype.hasOwnProperty.call(value, 'available')) {
        value.available = true;
      }

      var keys = Object.keys(value);
      for (var j = 0; j < keys.length; j += 1) {
        markAvailable(value[keys[j]]);
      }
    }

    markAvailable(obj);

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake curriculum script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
