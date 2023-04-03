let obj = JSON.parse($response.body);

obj.data = {
    "status" : "FREE_TRIAL",
    "paymentScheduled" : true,
    "productId" : "me.mycake.plus.subscription.1year",
    "freeTrialPeriod" : 15,
    "date" : "2023-04-16"
  };

$done({body: JSON.stringify(obj)});
