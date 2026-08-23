// Lingvist refills a small client-side question buffer. When many reviews are
// overdue it fills that buffer with reviews before considering new words. The
// value is only sent to the server; it does not change the app's real queue.
const REVIEW_QUEUE_FLOOR = 100;

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

      // Ask for new words while reporting the review buffer as already full.
      // Do not modify progress serial numbers, because doing so can duplicate
      // cards or corrupt the learning history.
      if (courseState.queues && typeof courseState.queues === "object") {
        courseState.queues.new = 0;
        courseState.queues.repeats_waiting = Math.max(
          Number(courseState.queues.repeats_waiting) || 0,
          REVIEW_QUEUE_FLOOR,
        );
        courseState.queues.repeats_below_horizon = Math.max(
          Number(courseState.queues.repeats_below_horizon) || 0,
          REVIEW_QUEUE_FLOOR,
        );
      }
    }

    $done({ body: JSON.stringify(obj) });
  }
} catch (e) {
  console.log(`Lingvist course request script error: ${e}`);
  $done($request?.body ? { body: $request.body } : {});
}
