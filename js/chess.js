// chess

let obj = JSON.parse($response.body);

obj.data.show_ads = false;
obj.data.premium_status = 1;

$done({body: JSON.stringify(obj)});
