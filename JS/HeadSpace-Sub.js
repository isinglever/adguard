const data = {
    "subscriptions" : [
      {
        "id" : "14125426",
        "renewsAt" : "2032-10-11T13:49:22.000Z",
        "purchaserId" : null,
        "legacySubscriptionId" : "HSSUBS_B2CSUBSCRIBER",
        "tags" : [
          "CURRENT_SUB"
        ],
        "membership" : "PRIMARY",
        "platform" : "APPLE",
        "endsAt" : "2032-10-11T13:49:22.000Z",
        "renewalTerm" : "MONTHLY",
        "subscriptionState" : "FREE_TRIAL",
        "plan" : {
          "subscriptionType" : "B2C",
          "affiliation" : null,
          "initialTermMonths" : 1,
          "name" : "iOS Monthly (7-day free trial)"
        },
        "voucher" : {
          "code" : "IOSIAP_FT_7D_MONTHLY"
        },
        "startsAt" : "2022-10-04T13:49:22.000Z",
        "status" : "ACTIVE"
      }
    ]
  };
$done({body: JSON.stringify(data)});