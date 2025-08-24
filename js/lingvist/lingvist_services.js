let obj = JSON.parse($response.body);

obj.services.expiration_ts = "2029-09-06T10:10:41Z";
obj.services.next_billing_ts = "2029-09-06T10:10:41Z"
obj.services.active_until_ts = "2029-09-06T10:11:28.159292Z";
obj.services.is_active = true;

$done({body: JSON.stringify(obj)});