let obj = JSON.parse($response.body);
delete obj.ads;
delete obj.categoryInfo.categories[3];
delete obj.categoryInfo.categories[4];
// delete obj.recommendTag[0];
// delete obj.recommendTag[1];
// delete obj.recommendTag[6];
// delete obj.recommendTag[8];
obj.config.allow_export = true;
obj.config.search_placeholder = "Vote with My Feet";
obj.isvip = true;
$done({body: JSON.stringify(obj)});
  