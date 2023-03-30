let obj = JSON.parse($response.body);

obj.skills_scores.THEME_ASPIRATION_SOUNDS.bootstrap = true;

$done({body: JSON.stringify(obj)});
