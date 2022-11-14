const url2 = "https://api.1point3acres.com/api/daily_questions";
 const method2 = "POST";
 const headers2 = {
                    "Host": "api.1point3acres.com", 
                    "Content-Type": "application/json",
                    "User-Agent": "%E4%B8%80%E4%BA%A9%E4%B8%89%E5%88%86%E5%9C%B0/0 CFNetwork/1335.0.3 Darwin/21.6.0",
                    "Connection": "keep-alive",
                    "device-id": "6e74cef0-1261-11ed-8260-53cb1deef7cb",
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Authorization": "eyJhbGciOiJIUzUxMiIsImlhdCI6MTY1OTQ0NDUzNCwiZXhwIjoxNjY3MzA2OTM0fQ.eyJ1aWQiOjkwOTEyMSwicHciOiI3NDI3ODdkOTM5MWQwMGQwNDU2ZGI3YTM4ZDRiMWNiMCJ9.7y6jSxl1l0mGVP3BuhJicJp8LTsbhMspyMTxsxt2FVTKFGOUxDWG9aR2z70_qbaP901GM07DHeuf4xFAA7HsKw",
                    "Content-Length": "21",
                    "Accept-Encoding": "gzip, deflate, br",
                };
 const data2 = {
                "qid": "49",
                "answer": "3"
            };
 
 const myRequest2 = {
     url: url2,
     method: method2, // Optional, default GET.
     headers: headers2, // Optional.
     body: JSON.stringify(data2) // Optional.
 };

 $task.fetch(myRequest2).then(response => {
    // response.statusCode, response.headers, response.body
    console.log(response.body);
    $notify("1Point3Acres", "Daily Question Success!", "Your credit: " + response.body['user'['credits']]); // Success!
    $done();
 }, reason => {
    // reason.error
    $notify("1Point3Acres", "Daily Question Fail!", reason.error); // Error!
    $done();
 });