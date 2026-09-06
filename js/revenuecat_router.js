// Generated entry point: node tools/build-revenuecat-router.js
// One RevenueCat owner for Surge; app handlers are bundled locally at build time.
(function () {
  var request = typeof $request === "object" && $request ? $request : {};
  var headers = request.headers || {};
  var completed = false;
  function finish(result) {
    if (!completed) {
      completed = true;
      $done(result);
    }
  }
  function header(name) {
    var key = Object.keys(headers).find(function (key) { return key.toLowerCase() === name; });
    return key ? String(headers[key]) : "";
  }
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  var match = /^https:\/\/api\.(?:revenuecat|rc-backup)\.com\/v1\/(subscribers\/[^/?#]+(?:\/(?:offerings|attributes))?\/?|receipts|product_entitlement_mapping)(?:\?[^#]*)?$/.exec(request.url || "");
  var method = String(request.method || "GET").toUpperCase();
  if (!match || (match[1] === "receipts" ? method !== "POST" : method !== "GET")) return finish({});

  var bundle = header("x-client-bundle-id");
  var ua = header("user-agent");
  var handler;
  if (bundle === "com.wellocution.iosapp") handler = runBoldVoice;
  else if (bundle === "com.mindcompany.spark") handler = runSpark;
  else if (/^BoldVoice\//.test(ua)) handler = bundle ? null : runBoldVoice;
  else if (/^Spark\//.test(ua)) handler = bundle ? null : runSpark;
  else if (/^Elevate(?:\/|$)/.test(ua)) handler = runElevate;
  else {
    var legacyPrefixes = ["Subtracky","Accountit/","Haushaltsbuch","%E8%BD%A6%E7%A5%A8%E7%A5%A8","FinancialNote","QingLong","CircleTime/","ScreenRecordCase/","Chronicling/","Yosum/","Rec/","Currency-Converter/","Precious/","GBA/","mark_cup/","Wake%20Music","Photomator","StepUp/","SleepMaster/","Notedrafts","Photon/","MusicBox/","Rats%20Project","Grain/","Ground%20News","GroundNews","AudioPlayer","FoJiCam/","pdfai_app/","LUTCamera","totowallet","Today%20App/","Aphrodite","timetrack.io","LiveWallpaper","SharkSMS","%E7%BE%8E%E5%A6%86%E6%97%A5%E5%8E%86","Aula/","Project%20Delta/","apollo","Unfold","LockFlow/","iplayTV/","widget_art","OneBox","Taskbit/","Medication%20List/","Pillow","DecibelMeter/","nbcamera/","1Blocker","VSCO","UTC","%E8%AC%8E%E5%BA%95%E9%BB%91%E8%86%A0","%E8%AC%8E%E5%BA%95%E6%99%82%E9%90%98","OffScreen","ScannerPro","Duplete/","Ooga/","WhiteCloud","HTTPBot","audiomack","server_bee","simple-","streaks","andyworks-calculator","vibes","CountDuck","IPTVUltra","Happy%3ADays","PDF_convertor/","ChatGPTApp","APTV","TouchRetouchBasic","My%20Jump%20Lab","%E7%9B%AE%E6%A0%87%E5%9C%B0%E5%9B%BE","Paku","Awesome%20Habits","Gear","MoneyThings","Anybox","Fileball","Noto","Grow","WidgetSmith","Reflix","Percento","Planny","CPUMonitor","Locket","My%20Tim","Photom","mizframa","YzyFit/","ImageX","Fin","Ledger","One4Wall","PhotoMark/","SimpleScan/","OneWidget","CardPhoto","ProCamera","Journal_iOS/","LemonKeepAccounts/","PDF%20Viewer","PhotoRoom","Decision","Tangerine","PastePal","Fiery","Airmail","Stress","PinPaper","Echo","MyThings","Overdue","BlackBox","Spektr","MusicMate","%E4%BA%8B%E7%BA%BF","Tasks","Currency","money_manager","fastdiet","Blurer","Everlog","reader","GetFace","intervalFlow","Period%20Calendar","Cookie","ScientificCalculator","MOZE","1LemonKeepAccounts/","To%20Me/","%E8%A8%80%E5%A4%96%E7%AD%86%E8%A8%98/","alcohol.tracker","DayPoem","Budget%20Flow","G%20E%20I%20S%20T","multitimer_app","Darkroom","tiimo","FaceMa/","Record2Text/","jinduoduo_calculator","Focused%20Work","GoToSleep","kegel","Ochi","Pomodoro","universal/","ShellBean/","AI%20Art%20Generator/","Email%20Me","GoodThing/","Reels%20Editor","com.dison.diary","iRead","jizhi","card/","EraseIt/","Alpenglow","MindBreathYoga/","MetadataEditor","%E6%9F%A5%E5%A6%86%E5%A6%86","%E5%85%83%E6%B0%94%E8%AE%A1%E6%97%B6","WidgetCat","Emphasis/","FormScanner/","streamer/","NeatNook/","Blackout/","Budgetify/","Dedupe/","Wozi"];
    if (legacyPrefixes.some(function (prefix) { return ua.indexOf(prefix) === 0; })) handler = runLegacy;
  }
  // An unknown app must never fall through to the legacy script's generic grant.
  if (!handler) return finish({});

  if (typeof $response === "undefined") {
    var cleanHeaders = Object.assign({}, headers);
    Object.keys(cleanHeaders).forEach(function (key) {
      if (/^(?:x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)) delete cleanHeaders[key];
    });
    return finish({ headers: cleanHeaders });
  }
  if (match[1] === "product_entitlement_mapping" || /\/(?:offerings|attributes)\/?$/.test(match[1])) return finish({});
  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return finish({});
    var body = JSON.parse($response.body);
    if (!record(body) || !record(body.subscriber) || !record(body.subscriber.entitlements) || !record(body.subscriber.subscriptions)) return finish({});
    // Older handlers read only these two header spellings.
    var normalized = Object.assign({}, request, { headers: Object.assign({}, headers, { "User-Agent": ua, "user-agent": ua }) });
    handler(normalized, $response, finish);
  } catch (_) {
    finish({});
  }

  // Source: js/boldvoice.js sha256=13c2f92cc69e4325cd24d7749c4bacd338726e186956f672cd54eb2b129c0595
function runBoldVoice($request, $response, $done) {
// BoldVoice 4.3.9 (5), captured 2026-09-06: local subscription response experiment.
// See module/boldvoice.md for evidence, setup, and unverified backend fields.
(function () {
  var request = typeof $request === "object" && $request ? $request : {};
  var headers = request.headers || {};
  var url = request.url || "";
  var method = String(request.method || "GET").toUpperCase();
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  function header(name) {
    var key = Object.keys(headers).find(function (key) {
      return key.toLowerCase() === name;
    });
    return key ? String(headers[key]) : "";
  }
  var bundle = header("x-client-bundle-id");
  var boldvoice = bundle ? bundle === "com.wellocution.iosapp" : /^BoldVoice\//.test(header("user-agent"));
  var rc = /^https:\/\/api\.(?:revenuecat|rc-backup)\.com\/v1\/(subscribers\/[^/?#]+(?:\/offerings)?\/?|receipts|product_entitlement_mapping)(?:\?[^#]*)?$/.exec(url);
  var profile = /^https:\/\/boldvoice-prod\.herokuapp\.com\/api\/v1\/profile(\/subscription)?\/?(?:\?[^#]*)?$/.exec(url);
  var customerInfo = rc && !/\/offerings\/?$/.test(rc[1]) && rc[1] !== "product_entitlement_mapping";
  var rcMethod = rc && (rc[1] === "receipts" ? method === "POST" : method === "GET");
  var profileMethod = profile && (profile[1] ? method === "PUT" : method === "GET");
  if (!(rc && boldvoice && rcMethod) && !profileMethod) return $done({});

  if (typeof $response === "undefined") {
    var cleanHeaders = Object.assign({}, headers);
    Object.keys(cleanHeaders).forEach(function (key) {
      if (/^(?:x-revenuecat-etag|if-none-match|if-modified-since)$/i.test(key)) delete cleanHeaders[key];
    });
    return $done({ headers: cleanHeaders });
  }
  // Offerings and the product mapping need fresh bodies, but no response edits.
  if (rc && !customerInfo) return $done({});

  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return $done({});
    var body = JSON.parse($response.body);
    if (!record(body)) return $done({});
    var user = profile ? (profile[1] ? body : body.user) : null;
    if (profile && (!record(user) || typeof user.isSubscriber !== "boolean")) return $done({});
    var subscriber = profile ? user.subscriptionData : body.subscriber;
    if (!record(subscriber) || !record(subscriber.entitlements) || !record(subscriber.subscriptions)) return $done({});

    var product = "com.wellocution.iosapp.subscription.yearone";
    var expires = "2099-12-01T00:00:00Z";
    var previous = record(subscriber.subscriptions[product]) ? subscriber.subscriptions[product] : {};
    var oldEntitlement = record(subscriber.entitlements.subscription) ? subscriber.entitlements.subscription : {};
    // Preserve an existing, valid purchase date; do not generate a future purchase.
    function purchaseDate(value, fallback) {
      var timestamp = typeof value === "string" ? Date.parse(value) : NaN;
      return Number.isFinite(timestamp) && timestamp <= Date.now() ? value : fallback;
    }
    var purchase = purchaseDate(previous.purchase_date, purchaseDate(oldEntitlement.purchase_date, new Date().toISOString()));
    var subscription = Object.assign({}, previous, {
      is_sandbox: false,
      ownership_type: "PURCHASED",
      period_type: "normal",
      store: "app_store",
      purchase_date: purchase,
      original_purchase_date: purchaseDate(previous.original_purchase_date, purchase),
      expires_date: expires,
      grace_period_expires_date: null,
      billing_issues_detected_at: null,
      unsubscribe_detected_at: null,
      refunded_at: null,
      auto_resume_date: null
    });
    subscriber.subscriptions[product] = subscription;
    subscriber.entitlements.subscription = Object.assign({}, oldEntitlement, {
      product_identifier: product,
      purchase_date: purchase,
      expires_date: expires,
      grace_period_expires_date: null
    });
    if (profile) {
      // The capture contains only expired_trial and an empty activeSubscriptions.
      // "active" and this product-keyed map are assumptions for in-app testing.
      user.isSubscriber = true;
      // Local Super upsell experiment; the banner's condition is not verified.
      // This does not establish a RevenueCat Pro entitlement or server access.
      user.isProSubscriber = true;
      user.subStatus = "active";
      user.subProduct = product;
      user.subscription_renews_or_expires_date = expires;
      user.grace_period_expires_date = null;
      user.last_purchase_date = purchase;
      user.failed_payment_date = null;
      user.refund_date = null;
      user.cancelled_date = null;
      if (Object.prototype.hasOwnProperty.call(user, "subscription_duration_in_months")) user.subscription_duration_in_months = 12;
      if (Object.prototype.hasOwnProperty.call(user, "subscription_store")) user.subscription_store = "app_store";
      if (record(subscriber.activeSubscriptions)) subscriber.activeSubscriptions[product] = Object.assign({}, subscription);
    }
    return $done({ body: JSON.stringify(body) });
  } catch (_) {
    return $done({});
  }
})();

}

// Source: js/spark.js sha256=093736ee7551e34ad43e39d6100813a03fc89566054e6f37ef03e69bb3320480
function runSpark($request, $response, $done) {
// Spark 1.42.0 (575): local subscription-response experiment for Surge.
// Product captured in secondary_7dtrial_socialproof on 2026-09-06.
// "premium" is inherited from revenue.js, not verified by a clean capture.
(function () {
  var request = typeof $request === "object" ? $request : {};
  var headers = request.headers || {};
  function header(name) {
    var key = Object.keys(headers).find(function (key) {
      return key.toLowerCase() === name;
    });
    return key ? String(headers[key]) : "";
  }
  function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  var bundle = header("x-client-bundle-id");
  var spark = bundle ? bundle === "com.mindcompany.spark" : /^Spark\//.test(header("user-agent"));
  var endpoint = /^https:\/\/api\.(?:revenuecat|rc-backup)\.com\/v1\/(?:subscribers\/[^/?#]+\/?|receipts)(?:\?[^#]*)?$/;
  if (!spark || !endpoint.test(request.url || "")) return $done({});

  if (typeof $response === "undefined") {
    var cleanHeaders = Object.assign({}, headers);
    Object.keys(cleanHeaders).forEach(function (key) {
      if (/^(?:x-revenuecat-etag|if-none-match)$/i.test(key)) delete cleanHeaders[key];
    });
    return $done({ headers: cleanHeaders });
  }

  try {
    var status = $response.status || $response.statusCode;
    if (status && !/^(?:HTTP\/\S+\s+)?2\d\d\b/.test(String(status))) return $done({});
    var body = JSON.parse($response.body);
    if (!record(body) || !record(body.subscriber)) return $done({});
    var subscriber = body.subscriber;
    if (!record(subscriber.entitlements) || !record(subscriber.subscriptions)) return $done({});

    var product = "ios_subscription_annual_intro_7d_39.99_2026.03.10";
    var purchase = "2026-09-06T00:00:00Z";
    var expires = "2099-12-01T00:00:00Z";
    subscriber.subscriptions[product] = Object.assign({}, subscriber.subscriptions[product], {
      is_sandbox: false,
      ownership_type: "PURCHASED",
      period_type: "normal",
      store: "app_store",
      purchase_date: purchase,
      original_purchase_date: purchase,
      expires_date: expires,
      grace_period_expires_date: null,
      billing_issues_detected_at: null,
      unsubscribe_detected_at: null
    });
    subscriber.entitlements.premium = Object.assign({}, subscriber.entitlements.premium, {
      product_identifier: product,
      purchase_date: purchase,
      expires_date: expires,
      grace_period_expires_date: null
    });
    return $done({ body: JSON.stringify(body) });
  } catch (_) {
    return $done({});
  }
})();

}

// Source: js/revenuecat.js sha256=ec6fc551aa7c034a78bfc79ea46381ea1b9a0d3c03af37e3885d2040d048b34a
function runElevate($request, $response, $done) {
var ua = $request.headers['User-Agent'] || $request.headers['user-agent'];
let obj = JSON.parse($response.body);
if (ua.indexOf('ChatGPTApp') != -1)
{

}
else if (ua.indexOf('Elevate') != -1)
{
  obj["subscriber"]["subscriptions"]= {
    "com.elevateapp.elevate.lifetime_subscription": {
      "is_sandbox": false,
      "period_type": "active",
      "billing_issues_detected_at": null,
      "unsubscribe_detected_at": null,
      "expires_date": "2099-12-01T03:51:32Z",
      "original_purchase_date": "2019-10-31T02:51:33Z",
      "purchase_date": "2019-10-31T02:51:32Z",
      "store": "app_store"
    }
  };
obj["subscriber"]["entitlements"]= {
    "pro": {
      "expires_date": "2099-12-01T03:51:32Z",
      "product_identifier": "com.elevateapp.elevate.lifetime_subscription",
      "purchase_date": "2019-10-31T02:51:32Z"
    }
  };
}

$done({body: JSON.stringify(obj)});

}

// Source: js/revenue.js sha256=c1b99d7a5592d2b17de5733e327d5288341df2ad9b1b075224aec3cced642154
function runLegacy($request, $response, $done) {
/***********************************
https://appraven.net/collection/77299969

[rewrite_local]

# ～ RevenueCat@ddgksf2013
^https:\/\/api\.(revenuecat|rc-backup)\.com\/.+\/(receipts$|subscribers\/[^/]+$) url script-response-body https://raw.githubusercontent.com/isinglever/adguard/master/js/revenue.js
^https:\/\/api\.(revenuecat|rc-backup)\.com\/.+\/(receipts|subscribers) url script-request-header https://raw.githubusercontent.com/isinglever/adguard/master/js/revenueHeader.js

[mitm]

hostname=api.revenuecat.com, api.rc-backup.com

***********************************/




// ========= 动态ID ========= //
const mapping = {
  'BoldVoice/': ['subscription', 'com.wellocution.iosapp.subscription.yearone'],
  'Subtracky': ['premium','premium_subtracky_lifetime'],
  'Accountit/': ['spenditPlus','DesignTech.SIA.Spendit.Plus.Lifetime'],
  'Haushaltsbuch': ['full_access','com.fabian.hasse.haushaltsbuch.upgrade.combined'],
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
  'FinancialNote': ['category'],
  'QingLong': ['Premium'],
  'CircleTime/': ['Premium'],
  'ScreenRecordCase/': ['Premium'],
  'Chronicling/': ['Premium'],
  'Yosum/': ['Premium'],
  'Rec/': ['rec.paid','rec.paid.onetime'],
  'Currency-Converter/': ['pro'],
  'Precious/': ['Pro'],
  'GBA/': ['xGBA.pro'],
  'mark_cup/': ['premiun'],
  'Wake%20Music': ['premium','com.OfflineMusic.www.lifetime198'],
  'Photomator': ['pixelmator_photo_pro_access'],
  'StepUp/': ['premiun'],
  'SleepMaster/': ['premium','sm_14999_lifetime'],
  'Notedrafts': ['pro_entitlement'],
  'Photon/': ['photon.paid','photon.bundle.yearly'],
  'MusicBox/': ['Premium','musicbox_2999_lifetime'],
  'Rats%20Project': ['PandaTracker_Premiumv2','monthly_subscription_discount_idv3'],
  'Grain/': ['gold','lifetimeMembership'],
  'Ground%20News': ['premium','com.groundnews.ios.yearly.premium'],
  'GroundNews': ['premium','com.groundnews.ios.yearly.premium'],
  'AudioPlayer': ['Pro'],
  'FoJiCam/': ['ProVersionLifeTime'],
  'pdfai_app/': ['premium'],
  'LUTCamera': ['ProVersion', 'com.uzero.funforcam.monthlysub'],
  'totowallet': ['all', 'com.ziheng.totowallet.yearly'],
  'Today%20App/': ['Premium', 'TodayApp_Lifetime'],
  'Aphrodite': ['all'],
  'timetrack.io': ['atimelogger-premium-plus'],
  'LiveWallpaper': ['Pro access'],
  'SharkSMS': ['VIP','com.lixkit.diary.permanent_68'],
  '%E7%BE%8E%E5%A6%86%E6%97%A5%E5%8E%86': ['Pro access'],
  'Aula/': ['Pro access'],
  'Project%20Delta/': ['rc_entitlement_obscura_ultra'],
  'apollo': ['all'],
  'Unfold': ['REDUCED_PRO_YEARLY','UNFOLD_PRO_YEARLY'],
  'LockFlow/': ['unlimited_access'],
  'iplayTV/': ['com.ll.btplayer.12'],
  'widget_art': ['all'],
  'OneBox': ['all'],
  'Taskbit/': ['Pro'],
  'Spark': ['premium'],
  'Medication%20List/': ['Premium'],
  'Pillow': ['premium'],
  'DecibelMeter/': ['Premium'],
  'nbcamera/': ['patron','com.andyworks.camera.yearlyPatron'],
  '1Blocker': ['premium'],
  'VSCO': ['membership'],
  'UTC': ['Entitlement.Pro'],
  '%E8%AC%8E%E5%BA%95%E9%BB%91%E8%86%A0': ['Entitlement.Pro'],
  '%E8%AC%8E%E5%BA%95%E6%99%82%E9%90%98': ['Entitlement.Pro'],
  'OffScreen': ['Entitlement.Pro'],
  'ScannerPro': ['plus'],
  'Duplete/': ['Pro'],
  'Ooga/': ['Ooga'],
  'WhiteCloud': ['allaccess','wc_pro_1y'],
  'HTTPBot': ['pro'],
  'audiomack': ['Premium1'],
  'server_bee': ['Pro'],
  'simple-': ['patron'],
  'streaks': ['patron'],
  'andyworks-calculator': ['patron'],
  'vibes': ['patron'],
  'CountDuck': ['premium', 'Lifetime'],
  'IPTVUltra': ['premium'],
  'Happy%3ADays': ['pro', 'happy_999_lifetime'],
  'PDF_convertor/': ['VIP', 'com.pdf.convertor.forever'],
  'ChatGPTApp': ['Advanced'],
  'APTV': ['pro'],
  'TouchRetouchBasic': ['premium'],
  'My%20Jump%20Lab': ['lifetime'],
  '%E7%9B%AE%E6%A0%87%E5%9C%B0%E5%9B%BE': ['pro'],
  'Paku': ['pro'],
  'Awesome%20Habits': ['premium'],
  'Gear': ['pro', 'com.gear.app.yearly'],
  'MoneyThings': ['Premium'],
  'Anybox': ['pro'],
  'Fileball': ['filebox_pro'],
  'Noto': ['pro'],
  'Grow': ['grow.pro', 'grow_lifetime'],
  'WidgetSmith': ['Premium'],
  'Reflix': ['com.magicgroot.reflix.entitlements','com.magicgroot.reflix.subs.lifetime'],
  'Percento': ['premium'],
  'Planny': ['premium'],
  'CPUMonitor': ['Pro'],
  'Locket': ['Gold'],
  'My%20Tim': ['Pro'],
  'Photom': ['premium', 'pixelmator_photo_pro_subscription_v1_pro_offer'],
  'mizframa': ['premium', 'mf_20_lifetime2'],
  'YzyFit/': ['pro', 'yzyfit_lft_v2'],
  'ImageX': ['imagex.pro.ios', 'imagex.pro.ios.lifetime'],
  'Fin': ['premium', 'com.circles.fin.premium.yearly'],
  'Ledger': ['Pro', 'com.lifetime.pro'],
  'One4Wall': ['lifetime', 'lifetime_key'],
  'PhotoMark/': ['Pro', 'com.photo.mark.forever'],
  'SimpleScan/': ['premium', 'com.atlantia.SimpleScan.Purchases.Lifetime'],
  'OneWidget': ['allaccess'],
  'CardPhoto': ['premium'],
  'ProCamera': ['private_lightbox_entitlement&san_fran_entitlement&pro_camera_up_entitlement&procamera_full_entitlement','com.cocologics.ProCamera.Up.Yearly'],
  'Journal_iOS/': ['PRO'],
  'LemonKeepAccounts/': ['VIP','lm_1_1month'],
  'PDF%20Viewer': ['sub.pro'],
  'PhotoRoom': ['business'],
  'Decision': ['com.nixwang.decision.entitlements.pro'],
  'Tangerine': ['Premium'],
  'PastePal': ['premium'],
  'Fiery': ['premium'],
  'Airmail': ['Airmail Premium'],
  'Stress': ['StressWatch Pro'],
  'PinPaper': ['allaccess'],
  'Echo': ['PLUS'],
  'MyThings': ['pro','xyz.jiaolong.MyThings.pro.infinity'],
  'Overdue': ['Pro'],
  'BlackBox': ['plus','app.filmnoir.appstore.purchases.lifetime'],
  'Spektr': ['premium'],
  'MusicMate': ['premium','mm_lifetime_68_premium'],
  '%E4%BA%8B%E7%BA%BF': ['pro','xyz.jiaolong.eventline.pro.lifetime'],
  'Tasks': ['Pro'],
  'Currency': ['plus'],
  'money_manager': ['premium'],
  'fastdiet': ['premium'],
  'Blurer': ['paid_access'],
  'Everlog': ['premium'],
  'reader': ['vip2','com.valo.reader.vip2.year'],
  'GetFace': ['Pro access'],
  'intervalFlow': ['All Access','wodtimer_lf_free'],
  'Period%20Calendar': ['Premium','com.lbrc.PeriodCalendar.premium.yearly'],
  'Cookie': ['allaccess','app.ft.Bookkeeping.lifetime'],
  'ScientificCalculator': ['premium','com.simpleinnovation.calculator.ai.premium.yearly.base'],
  'MOZE': ['premium'],
  '1LemonKeepAccounts/': ['vip'],
  'To%20Me/': ['Premium'],
  '%E8%A8%80%E5%A4%96%E7%AD%86%E8%A8%98/': ['Premium'],
  'alcohol.tracker': ['pro','drinklog_lifetime'],
  'DayPoem': ['Pro Lifetime'],
  'Budget%20Flow': ['full_access','com.fabian.hasse.haushaltsbuch.upgrade.combined'],
  'G%20E%20I%20S%20T': ['memorado_premium'],
  'multitimer_app': ['premium','timus_lt'],
  'Darkroom': ['co.bergen.Darkroom.entitlement.allToolsAndFilters'],
  'tiimo': ['full_access'],
  'FaceMa/': ['Pro access'],
  'Record2Text/': ['Pro access'],
  'jinduoduo_calculator': ['jinduoduoapp','mobile_vip'],
  'Focused%20Work': ['Pro'],
  'GoToSleep': ['Pro'],
  'kegel': ['kegel_pro'],
  'Ochi': ['Pro'],
  'Pomodoro': ['Plus','com.MINE.PomodoroTimer.plus.yearly'],
  'universal/': ['Premium','remotetv.yearly.07'],
  'ShellBean/': ['pro','com.ningle.shellbean.subscription.year'],
  'AI%20Art%20Generator/': ['Unlimited Access'],
  'Email%20Me': ['premium'],
  'GoodThing/': ['pro','goodhappens_basic_year'],
  'Reels%20Editor': ['Unlimited Access'],
  'com.dison.diary': ['vip'],
  'iRead': ['vip'],
  'jizhi': ['jizhi_vip'],
  'card/': ['vip'],
  'EraseIt/': ['ProVersionLifeTime'],
  'Alpenglow': ['newPro'],
  'MindBreathYoga/': ['lifetimeusa'],
  'MetadataEditor': ['unlimited_access'],
  '%E6%9F%A5%E5%A6%86%E5%A6%86': ['Pro access'],
  '%E5%85%83%E6%B0%94%E8%AE%A1%E6%97%B6': ['plus'],
  'WidgetCat': ['MiaoWidgetPro'],
  'Emphasis/': ['premium'],
  'FormScanner/': ['Pro','formscanner_lifetime'],
  'streamer/': ['Premium'],
  'NeatNook/': ['com.neatnook.pro','com.neatnook.pro.forever'],
  'Blackout/': ['premium','blackout_299_lt'],
  'Budgetify/': ['premium','budgetify_3999_lt'],
  'Dedupe/': ['Pro','com.curiouscreatorsco.Dedupe.pro.lifetime.notrial.39_99'],
  'Wozi': ['wozi_pro_2023']
};

// =========    固定部分  ========= //
// =========  @ddgksf2021 ========= //
var _0xodr='jsjiami.com.v7';var _0x2534be=_0x4c55;(function(_0x170d63,_0x4d6ac1,_0x1dc2b3,_0x2ae960,_0x497d2c,_0x58518e,_0x1964a8){return _0x170d63=_0x170d63>>0x8,_0x58518e='hs',_0x1964a8='hs',function(_0x52de00,_0x14908f,_0x5e8228,_0x8ddd05,_0x409ef2){var _0x4b852e=_0x4c55;_0x8ddd05='tfi',_0x58518e=_0x8ddd05+_0x58518e,_0x409ef2='up',_0x1964a8+=_0x409ef2,_0x58518e=_0x5e8228(_0x58518e),_0x1964a8=_0x5e8228(_0x1964a8),_0x5e8228=0x0;var _0x506325=_0x52de00();while(!![]&&--_0x2ae960+_0x14908f){try{_0x8ddd05=parseInt(_0x4b852e(0xd1,'AGAg'))/0x1*(-parseInt(_0x4b852e(0xb0,'AK49'))/0x2)+parseInt(_0x4b852e(0xab,'NE2]'))/0x3*(-parseInt(_0x4b852e(0xbd,'v%bD'))/0x4)+parseInt(_0x4b852e(0xb1,'pOXx'))/0x5*(-parseInt(_0x4b852e(0xb2,'@si6'))/0x6)+parseInt(_0x4b852e(0xc5,'v%bD'))/0x7+-parseInt(_0x4b852e(0xc3,'!dEE'))/0x8+parseInt(_0x4b852e(0xd3,'gSw@'))/0x9+-parseInt(_0x4b852e(0xd9,'e@)4'))/0xa*(-parseInt(_0x4b852e(0xaa,'E$z!'))/0xb);}catch(_0x3af3ff){_0x8ddd05=_0x5e8228;}finally{_0x409ef2=_0x506325[_0x58518e]();if(_0x170d63<=_0x2ae960)_0x5e8228?_0x497d2c?_0x8ddd05=_0x409ef2:_0x497d2c=_0x409ef2:_0x5e8228=_0x409ef2;else{if(_0x5e8228==_0x497d2c['replace'](/[tqPSEGMFrnubpwRdAXBOY=]/g,'')){if(_0x8ddd05===_0x14908f){_0x506325['un'+_0x58518e](_0x409ef2);break;}_0x506325[_0x1964a8](_0x409ef2);}}}}}(_0x1dc2b3,_0x4d6ac1,function(_0x595b29,_0x3088bb,_0x4368c5,_0x158ac1,_0x276d1b,_0x87d342,_0x3d9d03){return _0x3088bb='\x73\x70\x6c\x69\x74',_0x595b29=arguments[0x0],_0x595b29=_0x595b29[_0x3088bb](''),_0x4368c5='\x72\x65\x76\x65\x72\x73\x65',_0x595b29=_0x595b29[_0x4368c5]('\x76'),_0x158ac1='\x6a\x6f\x69\x6e',(0x1b8b34,_0x595b29[_0x158ac1](''));});}(0xcb00,0xdac10,_0xe776,0xcd),_0xe776)&&(_0xodr=0xcd);!(typeof $task!==_0x2534be(0xae,'YD(b')&&typeof $task[_0x2534be(0xcd,'mZHf')]===_0x2534be(0xc2,'9!hJ')||typeof $httpClient!==_0x2534be(0xb3,'1rlC')||typeof $rocket!==_0x2534be(0xac,'YAVV'))&&$done({});var ua=$request['headers'][_0x2534be(0xc9,'!Ip1')]||$request[_0x2534be(0xaf,'p*sM')]['user-agent'],obj=JSON['parse']($response[_0x2534be(0xb7,'V&@3')]);obj[_0x2534be(0xcb,'#&9&')]=_0x2534be(0xcf,'L0dB');var ddgksf2013={'is_sandbox':![],'ownership_type':'PURCHASED','billing_issues_detected_at':null,'period_type':'normal','expires_date':_0x2534be(0xad,'mZHf'),'grace_period_expires_date':null,'unsubscribe_detected_at':null,'original_purchase_date':'2022-09-08T01:04:18Z','purchase_date':'2022-09-08T01:04:17Z','store':'app_store'},ddgksf2021={'grace_period_expires_date':null,'purchase_date':'2022-09-08T01:04:17Z','product_identifier':'com.ddgksf2013.premium.yearly','expires_date':_0x2534be(0xc0,'sh!%')};const match=Object[_0x2534be(0xbe,'@si6')](mapping)[_0x2534be(0xd5,'h(B5')](_0x1082b4=>ua[_0x2534be(0xc7,'aa9S')](_0x1082b4));function _0x4c55(_0x135cb8,_0x1e7375){var _0xe776a8=_0xe776();return _0x4c55=function(_0x4c556f,_0x5a657e){_0x4c556f=_0x4c556f-0xaa;var _0x3503cf=_0xe776a8[_0x4c556f];if(_0x4c55['KfAEBP']===undefined){var _0x29f768=function(_0x1045c7){var _0x3ec1d7='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x31a320='',_0x5af6da='';for(var _0x48170d=0x0,_0x50b524,_0x23d3cb,_0xab1224=0x0;_0x23d3cb=_0x1045c7['charAt'](_0xab1224++);~_0x23d3cb&&(_0x50b524=_0x48170d%0x4?_0x50b524*0x40+_0x23d3cb:_0x23d3cb,_0x48170d++%0x4)?_0x31a320+=String['fromCharCode'](0xff&_0x50b524>>(-0x2*_0x48170d&0x6)):0x0){_0x23d3cb=_0x3ec1d7['indexOf'](_0x23d3cb);}for(var _0x7930f2=0x0,_0x500ba8=_0x31a320['length'];_0x7930f2<_0x500ba8;_0x7930f2++){_0x5af6da+='%'+('00'+_0x31a320['charCodeAt'](_0x7930f2)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x5af6da);};var _0x9c5767=function(_0x2b229a,_0x31cf51){var _0x981e67=[],_0x212536=0x0,_0x12d2f3,_0x5c446a='';_0x2b229a=_0x29f768(_0x2b229a);var _0x287ecd;for(_0x287ecd=0x0;_0x287ecd<0x100;_0x287ecd++){_0x981e67[_0x287ecd]=_0x287ecd;}for(_0x287ecd=0x0;_0x287ecd<0x100;_0x287ecd++){_0x212536=(_0x212536+_0x981e67[_0x287ecd]+_0x31cf51['charCodeAt'](_0x287ecd%_0x31cf51['length']))%0x100,_0x12d2f3=_0x981e67[_0x287ecd],_0x981e67[_0x287ecd]=_0x981e67[_0x212536],_0x981e67[_0x212536]=_0x12d2f3;}_0x287ecd=0x0,_0x212536=0x0;for(var _0x46aac8=0x0;_0x46aac8<_0x2b229a['length'];_0x46aac8++){_0x287ecd=(_0x287ecd+0x1)%0x100,_0x212536=(_0x212536+_0x981e67[_0x287ecd])%0x100,_0x12d2f3=_0x981e67[_0x287ecd],_0x981e67[_0x287ecd]=_0x981e67[_0x212536],_0x981e67[_0x212536]=_0x12d2f3,_0x5c446a+=String['fromCharCode'](_0x2b229a['charCodeAt'](_0x46aac8)^_0x981e67[(_0x981e67[_0x287ecd]+_0x981e67[_0x212536])%0x100]);}return _0x5c446a;};_0x4c55['wuGEdf']=_0x9c5767,_0x135cb8=arguments,_0x4c55['KfAEBP']=!![];}var _0x3a00ca=_0xe776a8[0x0],_0x4ab065=_0x4c556f+_0x3a00ca,_0xe13bc2=_0x135cb8[_0x4ab065];return!_0xe13bc2?(_0x4c55['mbZCOk']===undefined&&(_0x4c55['mbZCOk']=!![]),_0x3503cf=_0x4c55['wuGEdf'](_0x3503cf,_0x5a657e),_0x135cb8[_0x4ab065]=_0x3503cf):_0x3503cf=_0xe13bc2,_0x3503cf;},_0x4c55(_0x135cb8,_0x1e7375);}function _0xe776(){var _0x60f707=(function(){return[_0xodr,'SjstGqjwiXRuaYmBbPiEP.rqcFdoMpm.PvRO7Aun==','fwRcTYjtbgWUa8oI','W5bUW67dVSkHj8oMWQj6','lSkQESkdW7ldKmokW7bBWR4JfW','vZBdGq','5PcT5l6C5OQv5yI/8y+FJ/c6ViZWQ5YxWRLOzCkVW5lcKmoJW58LWOa+44oX6isu55EZ5z2hsCoVamo6o3aBW5ZdNaG9pmkEjmkqx8oLW7pdV3dcSCoUB3NdVa','jN3cO8oL','A8kurSk1va','WRVdJuJdL3xcLttcT1izWObQ','W7OfWOZcHZa5WOtcSaGz','gh3dGcy0WRZdPSk6WO8','WPasxCoeEmo6w1HdEYnuBCoEvtNcNCoIdxxcQvpcHmoKwNpcLCoRoa','xdVcHN5OWQ7dU8ktWOy0ta','sZ/dUgu','FSo0omoEW57dVSo3W7bPWR8','qCohWRKrfGFcM8kEjszfWRdcPJpcMmoLbsGczW','WPiXqGacEmoD'].concat((function(){return['B8oWb1ldPG9cjq','A0tdVdddTCkrzmoNW7G6kCoZW58','WPpcTCoNW5pcOJtdVSoNnmoS','uJNcGhPOW63cVSklWOafw8k7ya','W5vYW6u','pY3dHZtdT2WjWP0','wdBdIWHdWQK2W4S3WQFcJuhdN1NdS2JcLmoBeSkDbmktdYNcPSkyW5RcTCou','W4HfWOVdLKJcOWO6edC','W49LuCkGvmkNW5hcI304','fmkWWRNcH8ozxwldNSoK','iSkQBCkgW7pdMmokW64','WOZcRCoaDGO','FSk8qs7cQ0lcGqy+','5OgT5zEc5l2o5OMH5yQz5yE95Pwo5O2u77+b55Ep5Aco6Bg65yM95lUu77Yh6k+f5yIf5zw+5y2T5OQn5yQX5lUT5lM55lUD7762','WR/cGCk4W5VcL03dNCksW71MW4tdRra','wGlcNmoyqmo4q8kNcmkCW4q','jtBdHIVdOxOfWOWNsa','FCo8omoDWR7cHmkDW5T6WPeqnSkk'].concat((function(){return['W6VdOCo0WPZdJmoUcCofW5BcR8kn','W7RcGbWS','W6ZcMX0SqXNcJ2D/WQ7cVSkJzx0At8oyW7u','WQxdMub9beZdIM9GWOVcMCkMCG','WOTTWQPnW7FcSY/dTINcOCklr8oo','osZdIGpcMmoRDYKJiSoRWRHC','n2FcPCoVnSk8W5lcImkIqGhcKg4','u1WHBCktWQRdTtW','ACkiWRhdMbVdPxhcTMa','jmo1lCkiagFdRw9g','W5JdUmknle/dVqL+W5JcUGFcUCo6v8kVqcjzW4HV','W7FdQmk4WPy+adZcVmo6','WPGbWRNcMCoOl3K','WR1iWPRcGH4kWQ7cMq','W6VcKaNdKxBcKXtcTLG'];}()));}()));}());_0xe776=function(){return _0x60f707;};return _0xe776();};if(match){const [key,product_id]=mapping[match];product_id?(ddgksf2021[_0x2534be(0xd6,'h(B5')]=product_id,obj[_0x2534be(0xc4,'@Tbq')][_0x2534be(0xda,'V&@3')][product_id]=ddgksf2013):obj['subscriber'][_0x2534be(0xd0,'5sab')][_0x2534be(0xc8,'E1f$')]=ddgksf2013;obj[_0x2534be(0xca,'Df*p')]['entitlements']={};if(key[_0x2534be(0xcc,'gSw@')]('&')){let parts=key[_0x2534be(0xb8,'$^o1')]('&');parts[_0x2534be(0xc1,'jnCT')](_0x5acbc0=>{var _0x2bac63=_0x2534be;obj['subscriber'][_0x2bac63(0xb4,'gSw@')][_0x5acbc0]=ddgksf2021;});}else obj[_0x2534be(0xd2,'aa9S')][_0x2534be(0xb9,'pOXx')][key]=ddgksf2021;}else obj[_0x2534be(0xba,'AK49')]['subscriptions'][_0x2534be(0xbc,'n3sI')]=ddgksf2013,obj[_0x2534be(0xd2,'aa9S')][_0x2534be(0xb9,'pOXx')][_0x2534be(0xc6,'1rlC')]=ddgksf2021;console[_0x2534be(0xb5,'E1f$')](_0x2534be(0xb6,'@Tbq')),$done({'body':JSON[_0x2534be(0xbb,'v%bD')](obj)});var version_ = 'jsjiami.com.v7';

}
})();
