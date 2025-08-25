let obj = JSON.parse($response.body);

obj.services[0].subscription.expiration_ts = "2029-09-06T10:10:41Z";
obj.services[0].subscription.next_billing_ts = "2029-09-06T10:10:41Z";
obj.services[0].next_billing_ts = "2029-09-06T10:10:41Z"
obj.services[0].active_until_ts = "2029-09-06T10:11:28.159292Z";
obj.services[0].is_active = true;

$done({body: JSON.stringify(obj)});