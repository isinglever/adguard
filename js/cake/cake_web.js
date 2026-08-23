;(function () {
  try {
    if (!$response || !$response.body) {
      $done({});
      return;
    }

    var body = $response.body;
    var requestUrl =
      typeof $request !== 'undefined' && $request && $request.url
        ? $request.url
        : '';

    function getCommand(url) {
      var match = /[?&]cmd=([^&]*)/.exec(url || '');
      if (!match) {
        return '';
      }

      try {
        return decodeURIComponent(match[1]);
      } catch (e) {
        return match[1];
      }
    }

    function setInitialMembership(nextData) {
      var initialState =
        nextData && nextData.props && nextData.props.initialState;
      var initialAuth = initialState && initialState.initialAuth;

      if (!initialAuth || typeof initialAuth !== 'object') {
        return;
      }

      initialAuth.membership = 'PLUS';
      initialAuth.membershipFamilyType = '';
      initialAuth.hasFamilyMembership = false;
    }

    function safelySerializeForHtml(value) {
      return JSON.stringify(value)
        .replace(/&/g, '\\u0026')
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e');
    }

    function rewriteNextDataHtml(html) {
      var nextDataPattern =
        /(<script\b[^>]*\bid=(["'])__NEXT_DATA__\2[^>]*>)([\s\S]*?)(<\/script>)/i;
      var match = nextDataPattern.exec(html);

      if (!match) {
        return html;
      }

      var nextData = JSON.parse(match[3]);
      setInitialMembership(nextData);
      var serialized = safelySerializeForHtml(nextData);

      return html.replace(nextDataPattern, function (_, opening, quote, json, closing) {
        return opening + serialized + closing;
      });
    }

    function normalizeMembershipAndAccess(value) {
      if (!value || typeof value !== 'object') {
        return;
      }

      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) {
          normalizeMembershipAndAccess(value[i]);
        }
        return;
      }

      if (
        Object.prototype.hasOwnProperty.call(value, 'membership') &&
        typeof value.membership === 'string'
      ) {
        value.membership = 'PLUS';
      }

      if (
        Object.prototype.hasOwnProperty.call(value, 'membershipSource') &&
        typeof value.membershipSource === 'string'
      ) {
        value.membershipSource = 'CAKE';
      }

      if (
        Object.prototype.hasOwnProperty.call(value, 'subscriptionStatus') &&
        typeof value.subscriptionStatus === 'string'
      ) {
        value.subscriptionStatus = 'FREE_TRIAL';
      }

      if (Object.prototype.hasOwnProperty.call(value, 'isMembership')) {
        value.isMembership = true;
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
        normalizeMembershipAndAccess(value[keys[j]]);
      }
    }

    function hasMembershipSaleTarget(value) {
      if (!value || typeof value !== 'object') {
        return false;
      }

      if (value.actionScreen === 'MembershipTimeSaleLayer') {
        return true;
      }

      var targets = [value.link, value.uri, value.actionUrl, value.deepLink];
      for (var i = 0; i < targets.length; i += 1) {
        if (
          typeof targets[i] === 'string' &&
          targets[i].indexOf('MembershipTimeSaleLayer') !== -1
        ) {
          return true;
        }
      }

      return false;
    }

    function isPromotionNode(value) {
      if (!value || typeof value !== 'object') {
        return false;
      }

      var type = typeof value.type === 'string' ? value.type.toLowerCase() : '';

      if (type === 'ad' || type === 'membershiptimesalehomebanner') {
        return true;
      }

      if (
        typeof value.stepTitle === 'string' &&
        value.stepTitle.trim().toUpperCase() === 'AD'
      ) {
        return true;
      }

      if (hasMembershipSaleTarget(value)) {
        return true;
      }

      return (
        (type === 'cakemessage' || type === 'forumbanner') &&
        isPromotionNode(value.data)
      );
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
          isPromotionNode(value[key])
        ) {
          delete value[key];
        } else {
          prunePromotions(value[key]);
        }
      }
    }

    function applyCommandOverrides(obj, command) {
      if (command === '/auth/account') {
        obj.data = obj.data && typeof obj.data === 'object' ? obj.data : {};
        obj.extra = obj.extra && typeof obj.extra === 'object' ? obj.extra : {};
        obj.data.membership = 'PLUS';
        obj.extra.membership = 'PLUS';
        obj.extra.membershipSource = 'CAKE';
        obj.extra.subscriptionStatus = 'FREE_TRIAL';
        obj.extra.hasPurchaseHistory = true;
      }

      if (command === '/app/start') {
        obj.extra = obj.extra && typeof obj.extra === 'object' ? obj.extra : {};
        obj.extra.membership = 'PLUS';
        obj.extra.membershipSource = 'CAKE';
        obj.extra.subscriptionStatus = 'FREE_TRIAL';
      }
    }

    if (/^\s*</.test(body) && body.indexOf('__NEXT_DATA__') !== -1) {
      var rewrittenHtml = rewriteNextDataHtml(body);
      $done({ body: rewrittenHtml });
      return;
    }

    if (!/^\s*[\[{]/.test(body)) {
      $done({});
      return;
    }

    var obj = JSON.parse(body);
    var command = getCommand(requestUrl);

    applyCommandOverrides(obj, command);
    normalizeMembershipAndAccess(obj);
    prunePromotions(obj);

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log('cake web script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
  }
})();
