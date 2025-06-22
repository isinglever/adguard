var topBanners = document.getElementsByClassName('top-banner-ad-container');
for (var i = topBanners.length - 1; i >= 0; i--) {
  topBanners[i].remove();
}

var ads = document.getElementsByClassName('ad-slot');
for (var i = ads.length - 1; i >= 0; i--) {
  ads[i].remove();
}
