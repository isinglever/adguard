try {
  if (!$response || !$response.body) {
    $done({});
    return;
  }

  var obj = JSON.parse($response.body || '{}');

  function normalizeAccessFlags(value) {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i += 1) {
        normalizeAccessFlags(value[i]);
      }
      return;
    }

    if (Object.prototype.hasOwnProperty.call(value, 'restrictedNow')) {
      value.restrictedNow = false;
    }

    if (Object.prototype.hasOwnProperty.call(value, 'membershipOnly')) {
      value.membershipOnly = false;
    }

    if (Object.prototype.hasOwnProperty.call(value, 'restrictedAfterFreeTrial')) {
      value.restrictedAfterFreeTrial = false;
    }

    var keys = Object.keys(value);
    for (var j = 0; j < keys.length; j += 1) {
      normalizeAccessFlags(value[keys[j]]);
    }
  }

  function pruneMembershipBanner(value) {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      for (var i = value.length - 1; i >= 0; i -= 1) {
        var item = value[i];
        if (item && typeof item === 'object' && item.type === 'membershipTimeSaleHomeBanner') {
          value.splice(i, 1);
        } else {
          pruneMembershipBanner(item);
        }
      }
      return;
    }

    var keys = Object.keys(value);
    for (var k = 0; k < keys.length; k += 1) {
      pruneMembershipBanner(value[keys[k]]);
    }
  }

  normalizeAccessFlags(obj);
  pruneMembershipBanner(obj);

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log('cake services script error: ' + e);
  if ($response && $response.body) {
    $done({ body: $response.body });
  } else {
    $done({});
  }
}
