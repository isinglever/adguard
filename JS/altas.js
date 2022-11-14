var data = {
  "request_date_ms" : 1661698856382,
  "request_date" : "2022-08-28T15:00:56Z",
  "subscriber" : {
    "non_subscriptions" : {

    },
    "first_seen" : "2022-08-28T14:15:39Z",
    "original_application_version" : "2",
    "other_purchases" : {

    },
    "management_url" : "https://apps.apple.com/account/subscriptions",
    "subscriptions" : {
      "com.gocas.byroon.yearlyPlan" : {
        "is_sandbox" : false,
        "ownership_type" : "PURCHASED",
        "billing_issues_detected_at" : null,
        "period_type" : "trial",
        "expires_date" : "2052-08-31T15:00:50Z",
        "grace_period_expires_date" : null,
        "unsubscribe_detected_at" : null,
        "original_purchase_date" : "2022-08-28T15:00:51Z",
        "purchase_date" : "2022-08-28T15:00:50Z",
        "store" : "app_store"
      }
    },
    "entitlements" : {
      "Premium" : {
        "grace_period_expires_date" : null,
        "purchase_date" : "2022-08-28T15:00:50Z",
        "product_identifier" : "com.gocas.byroon.yearlyPlan",
        "expires_date" : "2052-08-31T15:00:50Z"
      }
    },
    "original_purchase_date" : "2022-08-28T14:08:58Z",
    "original_app_user_id" : "FuLoFaMOZlcWySJ7FzuxlkCBGSE3",
    "last_seen" : "2022-08-28T14:15:39Z"
  }
};
$done({body: JSON.stringify(data)});
