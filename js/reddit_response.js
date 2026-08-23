// Reddit 响应处理：移除首页广告，并关闭底部 Games 标签实验。
const GAMES_TAB_EXPERIMENT = "ios_devvit_games_bottom_nav";

(function () {
  try {
    if (typeof $response === "undefined" || !$response.body) return $done({});

    let payload;
    try {
      payload = JSON.parse($response.body);
    } catch (_) {
      return $done({});
    }

    const removedAds = removeHomeFeedAds(payload);
    const removedGamesExperiments = disableGamesTab(payload);

    if (removedAds === 0 && removedGamesExperiments === 0) return $done({});

    if (removedAds > 0) {
      console.log("[reddit_response] removed " + removedAds + " HomeFeedSdui ad(s)");
    }
    if (removedGamesExperiments > 0) {
      console.log(
        "[reddit_response] removed "
        + removedGamesExperiments
        + " Games bottom tab experiment assignment(s)"
      );
    }

    $done({ body: JSON.stringify(payload) });
  } catch (error) {
    console.log("[reddit_response] " + (error && error.stack || error));
    $done({});
  }
})();

function removeHomeFeedAds(payload) {
  const edges = payload
    && payload.data
    && payload.data.homeV3
    && payload.data.homeV3.elements
    && payload.data.homeV3.elements.edges;

  if (!Array.isArray(edges)) return 0;

  const filteredEdges = edges.filter(function (edge) {
    const node = edge && edge.node;
    return !(node && node.adPayload);
  });
  const removedCount = edges.length - filteredEdges.length;
  if (removedCount === 0) return 0;

  payload.data.homeV3.elements.edges = filteredEdges;
  return removedCount;
}

function disableGamesTab(payload) {
  const variants = payload
    && payload.data
    && payload.data.experimentVariants;

  if (!Array.isArray(variants)) return 0;

  const filteredVariants = variants.filter(function (variant) {
    if (!variant) return true;
    return variant.experimentName !== GAMES_TAB_EXPERIMENT
      && variant.name !== GAMES_TAB_EXPERIMENT;
  });
  const removedCount = variants.length - filteredVariants.length;
  if (removedCount === 0) return 0;

  payload.data.experimentVariants = filteredVariants;
  return removedCount;
}
