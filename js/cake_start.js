let obj = JSON.parse($response.body);

obj.extra = {
    "subscriptionStatus" : "FREE_TRIAL",
    "membershipSource" : "CAKE",
    "membership" : "PLUS"
  };

$done({body: JSON.stringify(obj)});
