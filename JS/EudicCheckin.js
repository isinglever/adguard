const url = 'https://api.esdict.cn/api/v3/user/checkin';
const method = 'POST';
const headers = {
'Connection' : 'keep-alive',
'Accept-Encoding' : 'gzip, deflate, br',
'Content-Type' : 'application/json',
'User-Agent' : '/eusoft_eudic_en_ios/10.1.6/95FEC39A-1FCD-45CD-901B-43034B923408_mac_02:00:00:00:00:00/',
'EudicTimezone' : '8',
'Authorization' : 'QYN eyJjYW1wYWlnbiI6dHJ1ZSwiZmwiOjE2MTMzOTkyMDY4OTkuODM1LCJsYyI6OTk5LCJ0IjoiQUJJTVRZM09UUTVOVGc1TkE9PSIsInRva2VuIjoiSEF6Mzl3c0Z5Z2lDSGNYdXRNSVptbS9kUGJzPSIsInVybHNpZ24iOiJYYkV1a24wdUVCQ1NrajlEMlRLNUpYR3FKZE09IiwidXNlcmlkIjoiYjBiMGMyZjAtNjgxMi0xMWU2LTk5YmEtMDAwYzI5NDNlNzAxIiwidl9kaWN0Ijp0cnVlfQo=',
'EudicUserAgent' : '/eusoft_eudic_en_ios/10.1.6/95FEC39A-1FCD-45CD-901B-43034B923408_mac_02:00:00:00:00:00/',
'Host' : 'api.esdict.cn',
'Cookie' : '__yjs_duid=1_ebfc64eb7cf46bc215c35c36fd0120911620866708890',
'Accept-Language' : 'zh-Hant;q=1',
'Accept' : '*/*'
};
const body = ``;

const myRequest = {
    url: url,
    method: method,
    headers: headers,
    body: body
};

$task.fetch(myRequest).then(response => {
    console.log(response.statusCode + "\n\n" + response.body);
    $done();
}, reason => {
    console.log(reason.error);
    $done();
});