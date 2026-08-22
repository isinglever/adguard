;(function () {
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

      if (Object.prototype.hasOwnProperty.call(value, 'freeCoreQuiz')) {
        value.freeCoreQuiz = true;
      }

      if (Object.prototype.hasOwnProperty.call(value, 'restrictedAfterFreeTrial')) {
        value.restrictedAfterFreeTrial = false;
      }

      var keys = Object.keys(value);
      for (var j = 0; j < keys.length; j += 1) {
        normalizeAccessFlags(value[keys[j]]);
      }
    }

    function isMembershipTimeSaleMessage(value) {
      return value &&
        typeof value === 'object' &&
        (value.actionScreen === 'MembershipTimeSaleLayer' ||
          (typeof value.link === 'string' &&
            value.link.indexOf('MembershipTimeSaleLayer') !== -1));
    }

    function isMembershipPromotionItem(value) {
      return value &&
        typeof value === 'object' &&
        (value.type === 'AD' ||
          value.type === 'membershipTimeSaleHomeBanner' ||
          (typeof value.stepTitle === 'string' &&
            value.stepTitle.trim().toUpperCase() === 'AD') ||
          isMembershipTimeSaleMessage(value) ||
          (value.type === 'cakeMessage' && isMembershipTimeSaleMessage(value.data)));
    }

    function pruneMembershipPromotions(value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (Array.isArray(value)) {
        for (var i = value.length - 1; i >= 0; i -= 1) {
          var item = value[i];
          if (isMembershipPromotionItem(item)) {
            value.splice(i, 1);
          } else {
            pruneMembershipPromotions(item);
            if (
              item &&
              item.type === 'classBanner' &&
              Array.isArray(item.data) &&
              item.data.length === 0
            ) {
              value.splice(i, 1);
            }
          }
        }
        return;
      }

      var keys = Object.keys(value);
      for (var k = 0; k < keys.length; k += 1) {
        var key = keys[k];
        if (
          /^membershipTimeSale(?:Home)?Banner$/i.test(key) ||
          (key === 'cakeMessage' && isMembershipTimeSaleMessage(value[key])) ||
          isMembershipPromotionItem(value[key])
        ) {
          delete value[key];
        } else {
          pruneMembershipPromotions(value[key]);
        }
      }
    }

    normalizeAccessFlags(obj);
    pruneMembershipPromotions(obj);

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake services script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
