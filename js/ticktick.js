/*
TickTick (Tick list) unlock pro

^https:\/\/(ticktick|dida365)\.com\/api\/v2\/user\/status url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/DiDaQingDan.js

hostname = dida365.com, ticktick.com
*/

let obj = JSON.parse($response.body);

obj.proEndDate = "2099-01-01T00:00:00.000+0000";
obj.needSubscribe = false;
obj.pro = true;
obj.proStartDate = "2017-03-25T08:40:43.000+0000";

$done({body: JSON.stringify(obj)});
