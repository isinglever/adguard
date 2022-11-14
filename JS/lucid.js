var data = {
  "request_date_ms" : 1660885726501,
  "request_date" : "2022-08-19T05:08:46Z",
  "subscriber" : {
    "non_subscriptions" : {

    },
    "first_seen" : "2022-08-19T04:49:41Z",
    "original_application_version" : "20210607",
    "other_purchases" : {

    },
    "management_url" : "https://apps.apple.com/account/subscriptions",
    "subscriptions" : {
      "com.polywise.subscriptions.yearly2" : {
        "is_sandbox" : false,
        "ownership_type" : "PURCHASED",
        "billing_issues_detected_at" : null,
        "period_type" : "trial",
        "expires_date" : "2052-07-26T05:01:32Z",
        "grace_period_expires_date" : null,
        "unsubscribe_detected_at" : null,
        "original_purchase_date" : "2022-07-19T05:01:33Z",
        "purchase_date" : "2022-07-19T05:01:32Z",
        "store" : "app_store"
      }
    },
    "entitlements" : {
      "lucid_unlock_all_content" : {
        "grace_period_expires_date" : null,
        "purchase_date" : "2022-07-19T05:01:32Z",
        "product_identifier" : "com.polywise.subscriptions.yearly2",
        "expires_date" : "2052-07-26T05:01:32Z"
      }
    },
    "original_purchase_date" : "2021-06-18T12:59:26Z",
    "original_app_user_id" : "BrCmCplWieatvHEr7s1eorJvF3r1",
    "last_seen" : "2022-08-19T04:49:41Z"
  }
};
  $done({body: JSON.stringify(data)});
