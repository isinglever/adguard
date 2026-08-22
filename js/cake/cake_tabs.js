;(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }

    var obj = JSON.parse($response.body || '{}');

    function isPromotionNode(value) {
      if (!value || typeof value !== 'object') {
        return false;
      }

      if (value.type === 'AD' || value.type === 'membershipTimeSaleHomeBanner') {
        return true;
      }

      if (
        typeof value.stepTitle === 'string' &&
        value.stepTitle.trim().toUpperCase() === 'AD'
      ) {
        return true;
      }

      if (value.actionScreen === 'MembershipTimeSaleLayer') {
        return true;
      }

      if (
        typeof value.link === 'string' &&
        value.link.indexOf('MembershipTimeSaleLayer') !== -1
      ) {
        return true;
      }

      return value.type === 'cakeMessage' && isPromotionNode(value.data);
    }

    function prunePromotions(value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (Array.isArray(value)) {
        for (var i = value.length - 1; i >= 0; i -= 1) {
          var item = value[i];
          if (isPromotionNode(item)) {
            value.splice(i, 1);
          } else {
            prunePromotions(item);
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
      for (var j = 0; j < keys.length; j += 1) {
        var key = keys[j];
        if (
          /^membershipTimeSale(?:Home)?Banner$/i.test(key) ||
          (key === 'cakeMessage' && isPromotionNode(value[key])) ||
          isPromotionNode(value[key])
        ) {
          delete value[key];
        } else {
          prunePromotions(value[key]);
        }
      }
    }

    prunePromotions(obj);

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake tab promotion script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
