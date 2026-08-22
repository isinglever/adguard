;(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }

    var obj = JSON.parse($response.body || '{}');

    function isMembershipTimeSaleMessage(value) {
      return value &&
        typeof value === 'object' &&
        value.actionScreen === 'MembershipTimeSaleLayer';
    }

    if (obj.extra && isMembershipTimeSaleMessage(obj.extra.cakeMessage)) {
      delete obj.extra.cakeMessage;
    }

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake push script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
