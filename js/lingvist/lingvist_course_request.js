try {
  const method = ($request?.method || "").toUpperCase();

  if (method !== "POST" || !$request?.body) {
    $done({});
  } else {
    const obj = JSON.parse($request.body);
    const courseState = obj.course_state;

    if (courseState && typeof courseState.bookmark === "string") {
      const bookmark = JSON.parse(courseState.bookmark);
      bookmark.subscription_limited = false;
      courseState.bookmark = JSON.stringify(bookmark);

      // An empty local new-word queue asks the server to refill it. Do not
      // modify progress serial numbers, because doing so can duplicate cards.
      if (courseState.queues && typeof courseState.queues === "object") {
        courseState.queues.new = 0;
      }
    }

    $done({ body: JSON.stringify(obj) });
  }
} catch (e) {
  console.log(`Lingvist course request script error: ${e}`);
  $done($request?.body ? { body: $request.body } : {});
}
