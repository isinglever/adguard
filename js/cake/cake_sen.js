;(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }

    var obj = JSON.parse($response.body || '{}');

    if (obj && obj.data && Object.prototype.hasOwnProperty.call(obj.data, 'banner')) {
      delete obj.data.banner;
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake sentence script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
