let body = $response.body;

const disabledFlags = new Set([
  "churned-user-upsell",
  "family-plan-ios",
  "ftue-goals-after-upsell",
  "mobile-trialist-sub-extension-ios-v3",
  "search-upsell",
  "second-free-trial-upsell",
  "subscription-cancellation-reminder-ios",
  "subscription-free-trial-ios",
  "upsell-on-app-open-2-ios",
  "upsell-on-app-open-ios",
]);

try {
  const data = JSON.parse(body);

  if (data && typeof data === "object") {
    for (const flag of disabledFlags) {
      if (data[flag] && typeof data[flag] === "object") {
        data[flag].key = "control";
        data[flag].value = "control";

        if (data[flag].metadata && typeof data[flag].metadata === "object") {
          data[flag].metadata.default = true;
        }
      }
    }

    if (data["upsell-purchase-completed-hot-fix"] && typeof data["upsell-purchase-completed-hot-fix"] === "object") {
      data["upsell-purchase-completed-hot-fix"].key = "off";
      data["upsell-purchase-completed-hot-fix"].value = "off";
    }

    body = JSON.stringify(data);
  }
} catch (error) {
  console.log(`calm-amplitude-flags-clean: ${error.message}`);
}

$done({ body });
