let obj = JSON.parse($response.body);

obj.data.attributes.apple_validation_result.transactions[1].expiresDate = "2029-09-06T10:10:41Z";

$done({body: JSON.stringify(obj)});