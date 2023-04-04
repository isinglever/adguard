let obj = JSON.parse($response.body);

delete obj.extra.timeSaleProduct;

$done({body: JSON.stringify(obj)});
