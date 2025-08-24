let obj = JSON.parse($response.body);

obj.subscription.expiration_ts = "2029-09-06T10:11:28+00:00";

$done({body: JSON.stringify(obj)});
