// home page

let obj = JSON.parse($response.body);

delete obj.myBackup;
// delete obj.activities;
delete obj.recentSaved.recommend;


$done({body: JSON.stringify(obj)});
