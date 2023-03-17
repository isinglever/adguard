/***************************************
function: elsa lifetime premium
update time: 2023.03.17
**************************************


[rewrite_local]

# elsa speak

^https:\/\/pool\.elsanow\.io\/user\/api\/v2\/purchase$ url script-response-body https://raw.githubusercontent.com/isinglever/Adguard/main/js/elsa.js

^https:\/\/pool\.elsanow\.io\/content\/api\/v1\/programs\/download.+  url request-header (\r\n)x-session-token:.+(\r\n) request-header $1x-session-token: F3S0w0bysBQFdbjtxpFurrFv2ItBBcBkVQxUddQW+9vjt2JXM751ksqq5GAWpkl+kk9nhig9BGh9JhYHQaokmendY6zLZDscHiRkZD2HrdJclKVCLordAARJhYIrf5C+5OSK6ax2TA45CKi8S09FEtYXN4noXO7gt42NT6WPIv6DKhdIwVxQuIAMLU5abmpMTDlyWeI4ulBWcOQbuZWWZg==



[mitm]

hostname = pool.elsanow.io

***************************************/


var obj = JSON.parse($response.body);
if($request.method=="GET")
{
obj["subscriptions"] = [
    {
      "expire_at": "21190505",
      "subscription": "lifetime_membership",
      "days_to_end": 36469,
      "created_at": "20190529151809"
    }
  ];
$done({body: JSON.stringify(obj)});
}
