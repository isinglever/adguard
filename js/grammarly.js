let obj = JSON.parse($response.body);
obj.isPremium = true;
obj. isGooglePlaySubscription = true;
$done({body:JSON.stringify(obj)})
