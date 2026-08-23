const EXPIRATION_TS = "2099-12-31T23:59:59Z";

function unlockBookmark(rawBookmark) {
  if (typeof rawBookmark !== "string") return rawBookmark;

  try {
    const bookmark = JSON.parse(rawBookmark);
    bookmark.subscription_limited = false;
    return JSON.stringify(bookmark);
  } catch (_) {
    return rawBookmark;
  }
}

function unlockCourse(course) {
  if (!course || typeof course !== "object") return;

  course.expiration_ts = EXPIRATION_TS;

  if (Array.isArray(course.upsells)) {
    course.upsells = [];
  }

  if (Array.isArray(course.variation_categories)) {
    for (const category of course.variation_categories) {
      if (!Array.isArray(category?.variations)) continue;

      for (const variation of category.variations) {
        if (variation && typeof variation === "object") {
          variation.paid = false;
        }
      }
    }
  }
}

try {
  const obj = JSON.parse($response?.body || "{}");

  if (obj.meta && typeof obj.meta === "object" && obj.meta.bookmark) {
    obj.meta.bookmark = unlockBookmark(obj.meta.bookmark);
  }

  unlockCourse(obj.course_state);

  if (Array.isArray(obj.courses)) {
    for (const course of obj.courses) {
      unlockCourse(course);
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`Lingvist course response script error: ${e}`);
  $done($response?.body ? { body: $response.body } : {});
}
