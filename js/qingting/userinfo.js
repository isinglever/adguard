// https://api.esdict.cn/api/v2/auth/UserInfo
// ^https:\/\/api\.esdict\.cn\/api\/v2\/auth\/UserInfo$

try {
  const body = $response?.body || '{}';
  const obj = JSON.parse(body);

  obj.istingvip = true;
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`QingTing user info script error: ${e}`);
  $done($response?.body ? { body: $response.body } : {});
}
