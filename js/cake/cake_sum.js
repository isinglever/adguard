let obj = JSON.parse($response.body);

obj.data.hasProtectItemGift = true;

$done({body: JSON.stringify(obj)});
