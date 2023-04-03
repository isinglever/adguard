let obj = JSON.parse($response.body);

obj.result = "SUCCESS";
obj.data = {
    "status" : "FREE_TRIAL",
    "paymentScheduled" : true,
    "productId" : "me.mycake.plus.subscription.1year",
   // "freeTrialPeriod" : 15,
   // "date" : "2023-04-16"
    "freeTrialPeriod" : 233,
    "date" : "2033-02-23"
  };

$done({body: JSON.stringify(obj)});
