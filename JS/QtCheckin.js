
/**
 * @fileoverview Template to compose HTTP reqeuest.
 * 
 */
let date = new Date();
let str = date.toISOString;

 const url = `https://api.frdic.com/api/v3/user/checkin`;
 const method = `POST`;
 const headers = {
 'Accept' : `*/*`,
 'Accept-Encoding' : `gzip, deflate, br`,
 'Connection' : `keep-alive`,
 'Content-Type' : `application/json`,
 'EudicTimezone' : `8`,
 'Host' : `api.frdic.com`,
 'User-Agent' : `/eusoft_ting_en_iphone/9.6.0/95FEC39A-1FCD-45CD-901B-43034B923408_mac_02:00:00:00:00:00/`,
 'Accept-Language' : `en-US;q=1, zh-Hant-HK;q=0.9, zh-Hans-US;q=0.8`,
 'EudicUserAgent' : `/eusoft_ting_en_iphone/9.6.0/95FEC39A-1FCD-45CD-901B-43034B923408_mac_02:00:00:00:00:00/`,
 'Authorization' : `QYN eyJjYW1wYWlnbiI6dHJ1ZSwiZmwiOjE2NjQ5ODY4MzQ1NDYuOTUzLCJsYyI6MjcsInQiOiJBQklNVFk0TkRnMk5EZzRNUT09IiwidG9rZW4iOiIwakFlMlQwVTE1NzZkQVJKUFpsL1V5U3N2YnM9IiwidXJsc2lnbiI6IlhiRXVrbjB1RUJDU2tqOUQyVEs1SlhHcUpkTT0iLCJ1c2VyaWQiOiI1NGNhOTliNi00MTQ5LTExZWQtYmIzMy0wMDUwNTY4NmFlY2UiLCJ2X3RpbmciOnRydWV9Cg==`
 };
 let body = {"checkInDay":str,"timezone":8,"checkin_date":str,"checkin_type":2};
 
 const myRequest = {
     url: url,
     method: method,
     headers: headers,
     body: JSON.stringify(body)
 };
 
 $task.fetch(myRequest).then(response => {
     console.log(response.statusCode + "\n\n" + response.body);
     $done();
 }, reason => {
     console.log(reason.error);
     $done();
 });
 