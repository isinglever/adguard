let obj = JSON.parse($response.body);

obj.dapple_validation_result.attributes.apple_validation_result.transactions.expiresDate = "2029-09-06T10:10:41Z";

$done({body: JSON.stringify(obj)});