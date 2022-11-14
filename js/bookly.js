const data = {
    "request_date_ms" : 1664536475444,
    "request_date" : "2022-09-30T11:14:35Z",
    "subscriber" : {
      "non_subscriptions" : {
  
      },
      "first_seen" : "2022-09-30T11:01:50Z",
      "original_application_version" : "1.5",
      "other_purchases" : {
  
      },
      "management_url" : "https://apps.apple.com/account/subscriptions",
      "subscriptions" : {
        "com.sub.bookout.oneMonth" : {
          "is_sandbox" : false,
          "ownership_type" : "PURCHASED",
          "billing_issues_detected_at" : null,
          "period_type" : "subscribe",
          "expires_date" : "2032-10-07T11:13:37Z",
          "grace_period_expires_date" : null,
          "unsubscribe_detected_at" : null,
          "original_purchase_date" : "2022-09-30T11:13:38Z",
          "purchase_date" : "2022-09-30T11:13:37Z",
          "store" : "app_store"
        }
      },
      "entitlements" : {
        "Pro" : {
          "grace_period_expires_date" : null,
          "purchase_date" : "2022-09-30T11:13:37Z",
          "product_identifier" : "com.sub.bookout.oneMonth",
          "expires_date" : "2032-10-07T11:13:37Z"
        }
      },
      "original_purchase_date" : "2017-05-07T13:25:07Z",
      "original_app_user_id" : "$RCAnonymousID:0fbdb15d163b499f85e2afcbea63fdf9",
      "last_seen" : "2022-09-30T11:01:50Z"
    }
  };

  $done({body: JSON.stringify(data)});
