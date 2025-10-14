;(function () {
  try {
    var method = '';
    if (typeof $request !== 'undefined' && $request && typeof $request.method === 'string') {
      method = $request.method.trim().toUpperCase();
    }

    var statusCode = '';
    if (typeof $response !== 'undefined' && $response) {
      if (typeof $response.status !== 'undefined') {
        statusCode = $response.status;
      } else if (typeof $response.statusCode !== 'undefined') {
        statusCode = $response.statusCode;
      }
    }

    try {
      console.log('Pocket Casts script invoked, method=' + (method || 'UNKNOWN') + ', status=' + (statusCode || 'UNKNOWN'));
    } catch (logErr0) {}

    if (method && method !== 'GET') {
      try {
        console.log('Pocket Casts script skip: method=' + method);
      } catch (logErr) {}
      if ($response && $response.body) {
        $done({ body: $response.body });
      } else {
        $done({});
      }
      return;
    }

    if (typeof $response !== 'undefined' && $response) {
      var rawBody = '';
      if (typeof $response.body === 'string') {
        rawBody = $response.body;
      }

      try {
        console.log('Pocket Casts script response body length=' + (rawBody ? rawBody.length : 0));
      } catch (logErr1) {}

      var parsed = {};
      if (rawBody) {
        try {
          parsed = JSON.parse(rawBody);
          try {
            console.log('Pocket Casts script parsed JSON successfully');
          } catch (logErr4) {}
        } catch (parseErr) {
          try {
            console.log('Pocket Casts script JSON parse failed: ' + parseErr);
          } catch (logErr5) {}
          parsed = {};
        }
      } else {
        try {
          console.log('Pocket Casts script empty body, using template payload');
        } catch (logErr6) {}
      }

      var plusExpiry = '2029-01-06T00:00:00Z';
      var mobileExpiry = '2029-11-15T14:15:51Z';
      var updateUrl = 'https://subscription-management.paddle.com/subscription/18116649/hash//update';
      var cancelUrl = 'https://subscription-management.paddle.com/subscription/18116649/hash//cancel';

      var payload = {};
      var key;
      if (parsed && typeof parsed === 'object') {
        for (key in parsed) {
          if (Object.prototype.hasOwnProperty.call(parsed, key)) {
            payload[key] = parsed[key];
          }
        }
      }

      var features = {};
      if (payload.features && typeof payload.features === 'object') {
        for (key in payload.features) {
          if (Object.prototype.hasOwnProperty.call(payload.features, key)) {
            features[key] = payload.features[key];
          }
        }
      }
      features.removeBannerAds = true;
      features.removeDiscoverAds = true;

      payload.features = features;
      payload.index = 0;
      payload.updateUrl = updateUrl;
      payload.tier = 'Plus';
      payload.autoRenewing = true;
      payload.giftDays = 0;
      payload.type = 1;
      payload.platform = 3;
      payload.expiryDate = plusExpiry;
      payload.webStatus = 5;
      payload.frequency = 1;
      payload.paid = 1;
      payload.cancelUrl = cancelUrl;
      payload.createdAt = payload.createdAt || '2019-09-21T00:25:33Z';

      payload.web = {
        yearly: 556537,
        trial: 0,
        webStatus: 5,
        monthly: 556536,
        plus: {
          monthly: 556536,
          trialDays: 0,
          yearly: 556537
        },
        patron: {
          monthly: 829092,
          trialDays: 0,
          yearly: 829091
        }
      };

      payload.subscriptions = [
        {
          index: 0,
          podcasts: [],
          updateUrl: updateUrl,
          bundleUuid: '',
          tier: 'Plus',
          eligible: true,
          type: 1,
          autoRenewing: true,
          giftDays: 0,
          platform: 3,
          expiryDate: plusExpiry,
          web: {
            yearly: 0,
            trial: 0,
            webStatus: 5,
            monthly: 0
          },
          cancelUrl: cancelUrl,
          plan: '583361',
          webStatus: 5,
          frequency: 1,
          paid: 1
        },
        {
          index: 1,
          podcasts: [],
          updateUrl: '',
          bundleUuid: '',
          tier: 'Plus',
          eligible: true,
          type: 1,
          autoRenewing: true,
          giftDays: 0,
          platform: 1,
          expiryDate: mobileExpiry,
          cancelUrl: '',
          plan: 'com.pocketcasts.plus.monthly',
          webStatus: 0,
          frequency: 1,
          paid: 1
        }
      ];

      var result = JSON.stringify(payload);
      try {
        console.log('Pocket Casts Plus payload applied, length=' + result.length);
      } catch (logErr3) {}
      $done({ body: result });
      return;
    }
  } catch (e) {
    console.log('Pocket Casts Plus script error: ' + e);
    if ($response && $response.body) {
      $done({ body: $response.body });
    } else {
      $done({});
    }
    return;
  }

  $done({});
})();
