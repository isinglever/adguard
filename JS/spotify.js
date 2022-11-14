let obj = JSON.parse($response.body);
obj.audio_quality = "VERY HIGH";
obj.supports_hifi.user_eligible = true;
obj.supports_hifi.fully_supported = true;
obj.supports_v2_playlist_uris =  true;
$done({body: JSON.stringify(obj)});