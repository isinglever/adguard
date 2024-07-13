const data = {
    "classmate" : {
      "status" : 1,
      "url" : "https://dict.eudic.net/studyplan/classmate?userid={userid}&timezone={timezone}&app=Eudic",
      "classmates" : [
        {
          "today_checkin" : true,
          "nick_name" : "Achilles",
          "gender" : "1",
          "avatar_url" : "http://api.frdic.com/api/v3/user/avatar/b0b0c2f0-6812-11e6-99ba-000c2943e701",
          "failed" : false,
          "user_id" : "b0b0c2f0-6812-11e6-99ba-000c2943e701"
        },
        {
          "today_checkin" : true,
          "nick_name" : "Dionysos",
          "gender" : "0",
          "avatar_url" : "https://raw.githubusercontent.com/isinglever/adguard/main/Icon/rb.jpg",
          "failed" : false,
          "user_id" : "54ca99b6-4149-11ed-bb33-00505686aece"
        }
      ]
    }
  };
  $done({body: JSON.stringify(data)});