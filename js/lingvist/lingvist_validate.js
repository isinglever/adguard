let obj = JSON.parse($response.body);
const key = "com.lingvist.unlimited_12_months.v11.full_1md_ft";

obj.data.attributes.apple_validation_result.transactions[0].expiresDate = "2029-09-06T10:10:41Z";
obj.data.attributes.paid_access_levels.premium.is_lifetime = true;
obj.data.attributes.paid_access_levels.premium.is_active = true;
obj.data.attributes.paid_access_levels.premium.expires_at = "2029-09-06T10:10:41.000000+0000";
obj.data.attributes.subscriptions[key].is_lifetime = true;
obj.data.attributes.subscriptions[key].expires_at = "2029-09-06T10:10:41.000000+0000";
obj.data.attributes.subscriptions[key].is_active = true;


$done({body: JSON.stringify(obj)});