// https://api.esdict.cn/api/v2/index/HomePage
try {
  const body = $response?.body || '{}';
  const obj = JSON.parse(body);

  const target = obj?.data && typeof obj.data === 'object' ? obj.data : obj;

  if (Array.isArray(target?.ads)) {
    delete target.ads;
  }
  if (Array.isArray(target?.ad)) {
    delete target.ad;
  }
  if (target && Object.prototype.hasOwnProperty.call(target, 'isvip')) {
    target.isvip = true;
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`QingTing homepage script error: ${e}`);
  $done($response?.body ? { body: $response.body } : {});
}
