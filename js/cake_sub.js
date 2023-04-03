let obj = JSON.parse($response.body);

obj.data = {
    "status" : "FREE_TRIAL",
    "paymentScheduled" : true,
    "productId" : "me.mycake.plus.subscription.1year",
    "freeTrialPeriod" : 233,
    "date" : "2033-03-16"
  };

$done({body: JSON.stringify(obj)});
