/**
 * @isinglever 1point3cares daily checkin
 * and handle the response.
 *
 */

 const url1 = "https://api.1point3acres.com/api/users/checkin";
 const method1 = "POST";
 const headers1 = {
                    "Host": "api.1point3acres.com", 
                    "Content-Type": "application/json",
                    "User-Agent": "%E4%B8%80%E4%BA%A9%E4%B8%89%E5%88%86%E5%9C%B0/5 CFNetwork/1390 Darwin/22.0.0",
                    "Connection": "keep-alive",
                    "device-id": "efff37b0-3644-11ed-95f1-b584e1c64a41",
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Authorization": "eyJhbGciOiJIUzUxMiIsImlhdCI6MTY2MzQ4NzM5MiwiZXhwIjoxNjcxMzQ5NzkyfQ.eyJ1aWQiOjkwOTEyMSwicHciOiI3NDI3ODdkOTM5MWQwMGQwNDU2ZGI3YTM4ZDRiMWNiMCJ9.TrHn2HIm_x6VJlM3xEOHIt7Ox4YPsRrbnyR7f6nR6kd8cJd8KJWS1Wrh3Co6o-tmE5-dyMamT9kZCGJ1JlNy0w",
                    "Content-Length": "72",
                    "Accept-Encoding": "gzip, deflate, br",
                };
 const data1 = {
                "qdxq":"kx",
                "todaysay":"今天把论坛帖子介绍给小伙伴了～"
            };
 
 const myRequest1 = {
     url: url1,
     method: method1, // Optional, default GET.
     headers: headers1, // Optional.
     body: JSON.stringify(data1) // Optional.
 };
 
 $task.fetch(myRequest1).then(response => {
     // response.statusCode, response.headers, response.body
     console.log(response.body);
     var obj = JSON.parse(response.body);
     if (obj.errno == -1) {
        // console.log(obj.msg);
        $done();
     }
     $notify("1Point3Acres", "Daily Checkin Success!", "Your credits: " + obj.user.credits); // Success!

     $done();
 }, reason => {
     // reason.error
     $notify("1Point3Acres", "Daily Checkin Fail!", reason.error); // Error!
     $done();
 });
