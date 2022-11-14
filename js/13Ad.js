var data = {
    "errno" : 0,
    "meta" : {
      "config" : {
        "preview" : {
          "pattern" : ".*((amazon\\.com.*\\/([A-Z0-9]{10}))|(twitter\\.com\\/.*\\/status\\/\\d+)|(youtube\\.com.*\\/watch\\?v=[^\"&?/\\s]{11})|(youtube\\.com.*\\/shorts\\/[^\"&?/\\s]{11})|(youtu\\.be\\/[^\"&?/\\s]{11})|(open\\.spotify\\.com\\/(playlist|track|album|episode)\\/[^\"&?/\\s]+)|(bilibili\\.com\\/video\\/[^\"&?/\\s]{12})|(twitch\\.tv\\/videos\\/\\d+)|(podcasts\\.apple\\.com\\/[^/]+\\/podcast\\/)).*"
        },
        "widgets" : [
  
        ],
        "reviews" : {
          "thresholds" : [
            100,
            30,
            90
          ]
        },
        "adv" : {
          "admob" : {
            "postListMatchStyle" : false,
            "postListNativeRate" : 0.00000000000000001,
            "threadListMatchStyle" : false,
            "defaultNativeRate" : 0.00000000000000001,
            "useDefaultNativeUnit" : false,
            "enableNativeMediaView" : false,
            "useDefaultBannerUnit" : false,
            "personalizedNative" : false,
            "enableSticky" : false,
            "lazyLoad" : false,
            "threadListNativeRate" : 0.00000000000000001,
            "personalized" : false
          },
          "placements" : {
            "threadList" : {
              "loop" : [
                40
              ],
              "position" : 20,
              "frequency" : 0
            },
            "postList" : {
              "position" : 10,
              "frequency" : 0
            }
          }
        },
        "bannerButtons" : [
          {
            "url" : "https://auth.1point3acres.com/redirect?url=https://offer.1point3acres.com%3Futm_source%3Dapp%26utm_medium%3Dnav_button",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "title" : "Offer多多",
            "enableAuth" : true,
            "titleShort" : "Offer",
            "desc" : "申请选校神器 | Offer多多 | 一亩三分地",
            "icon" : "luqu"
          },
          {
            "url" : "https://learn.1point3acres.com?utm_source=app&utm_medium=nav_button",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "title" : "好好学习",
            "titleShort" : "Learn",
            "desc" : "精品软件工程、数据科学、职场晋升课程 | 一亩三分地",
            "icon" : "xue"
          },
          {
            "url" : "https://www.salarytics.com?utm_source=app&utm_medium=nav_button",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "title" : "Salarytics",
            "titleShort" : "工资",
            "desc" : "北美互联网行业工资查询和分析工具 | 一亩三分地",
            "icon" : "dollar"
          },
        //   {
        //     "url" : "https://coronavirus.1point3acres.com/zh/mobileapp?utm_source=app&utm_medium=nav_button",
        //     "icon" : "bingdu",
        //     "title" : "疫情",
        //     "titleShort" : "疫情",
        //     "desc" : "北美新型肺炎疫情实时动态",
        //     "color" : "#f7f7f7"
        //   },
          {
            "icon" : "job",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "titleShort" : "求职",
            "url" : "https://auth.1point3acres.com/redirect?url=https://jobs.1point3acres.com%3Futm_source%3Dapp%26utm_medium%3Dnav_button",
            "title" : "Jobs",
            "fallbackIconType" : "FontAwesome",
            "desc" : "Who's hiring? I am on the market! ",
            "fallbackIconName" : "briefcase"
          },
          {
            "icon" : "passport",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "titleShort" : "Visa",
            "url" : "https://auth.1point3acres.com/redirect?url=https://visa.1point3acres.com%3Futm_source%3Dapp%26utm_medium%3Dnav_button",
            "title" : "VisaTracker",
            "fallbackIconType" : "FontAwesome5",
            "desc" : "Visa",
            "fallbackIconName" : "passport"
          },
        //   {
        //     "icon" : "news",
        //     "color" : "#f7f7f7",
        //     "bottomNav" : true,
        //     "titleShort" : "新闻",
        //     "url" : "https://redian.news?utm_source=app&utm_medium=nav_button",
        //     "title" : "新闻",
        //     "fallbackIconType" : "FontAwesome",
        //     "desc" : "新闻",
        //     "fallbackIconName" : "newspaper-o"
        //   },
          {
            "icon" : "blog",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "titleShort" : "攻略",
            "url" : "https://blog.1point3acres.com?utm_source=app&utm_medium=nav_button",
            "title" : "留学生活攻略",
            "fallbackIconType" : "Feather",
            "desc" : "美国留学就业生活攻略",
            "fallbackIconName" : "compass"
          },
          {
            "url" : "https://auth.1point3acres.com/redirect?url=https%3A%2F%2Fmatch.1point3acres.com%3Fapp_version%3D1.17.8%26utm_source%3Dapp%26utm_medium%3Dnav_button",
            "color" : "#f7f7f7",
            "bottomNav" : true,
            "title" : "交友",
            "enableAuth" : true,
            "titleShort" : "交友",
            "desc" : "一亩三分地交友",
            "icon" : "luntanjiaoyou"
          }
        ],
        "splashDuration" : 5000
      },
      "minVersion" : {
        "android" : "1.0",
        "ios" : "1.0"
      },
      "featureFlag" : {
        "enableIAP" : false,
        "enableCheckinRewardedAd" : false,
        "disableDealsTab" : true,
        "disablePushNotification" : false,
        "enableDailyQuestionInterstitialAd" : false,
        "enableCheckinInterstitialAd" : false,
        "enableSearchLimit" : false,
        "enableThreadListFBAd" : false,
        "dev" : false,
        "disableMicroblog" : false,
        "enableAutoFoldPost" : true,
        "enableDailyQuestionRewardedAd" : false,
        "enableThreadViewAdmobAd" : false,
        "enableLegacyLogin" : false,
        "enableAskForIDFA" : true,
        "enableGoBackInterstitialAd" : false,
        "enableThreadListAdmobAd" : false,
        "enableThreadViewFBAd" : false
      },
      "message" : {
        "1.11.1" : ""
      },
      "announcements" : [
  
      ],
      "betaList" : [
        1,
        2,
        151,
        216743,
        241027,
        265731,
        396146,
        402266,
        258258,
        454196
      ],
      "latestVersion" : {
        "android" : "1.17.13",
        "ios" : "1.17.13"
      },
      "latestBinVersion" : {
        "android" : "1.17.8",
        "ios" : "1.17.8"
      }
    },
    "msg" : "OK"
  }
// let obj = JSON.parse($response.body);
// obj.user.app_status.question = false;
// obj.user.adminid = 1;
// obj.user.newpm = 1;
// obj.user.groupid = 1;
// obj.user.adexpiry = 1;
$done({body: JSON.stringify(data)});