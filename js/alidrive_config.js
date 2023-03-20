let obj = JSON.parse($response.body);

obj.homepage_visibility = 0


$done({body: JSON.stringify(obj)});
