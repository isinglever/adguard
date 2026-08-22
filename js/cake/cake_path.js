;(function () {
  try {
    if (typeof $response !== 'undefined' && $response && $response.body) {
      var obj = JSON.parse($response.body || '{}');

      function isAdNode(node) {
        if (!node || typeof node !== 'object') {
          return false;
        }

        var type = node.type;
        if (typeof type === 'string' && type.toUpperCase() === 'AD') {
          return true;
        }

        if (type === 'membershipTimeSaleHomeBanner') {
          return true;
        }

        if (node.actionScreen === 'MembershipTimeSaleLayer') {
          return true;
        }

        if (
          typeof node.link === 'string' &&
          node.link.indexOf('MembershipTimeSaleLayer') !== -1
        ) {
          return true;
        }

        if (type === 'cakeMessage' && isAdNode(node.data)) {
          return true;
        }

        if (typeof node.stepTitle === 'string' && node.stepTitle.trim().toUpperCase() === 'AD') {
          return true;
        }

        return false;
      }

      function pruneAds(value) {
        if (!value || typeof value !== 'object') {
          return;
        }

        if (Array.isArray(value)) {
          for (var i = value.length - 1; i >= 0; i -= 1) {
            var item = value[i];
            if (isAdNode(item)) {
              value.splice(i, 1);
            } else {
              pruneAds(item);
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

        if (
          Object.prototype.hasOwnProperty.call(value, 'restrictedNow') &&
          value.restrictedNow !== false
        ) {
          value.restrictedNow = false;
        }

        var keys = Object.keys(value);
        for (var j = 0; j < keys.length; j += 1) {
          var key = keys[j];
          if (
            (/^membershipTimeSale(?:Home)?Banner$/i.test(key)) ||
            (key === 'cakeMessage' && isAdNode(value[key])) ||
            isAdNode(value[key])
          ) {
            delete value[key];
          } else {
            pruneAds(value[key]);
          }
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

  $done({});
})();
