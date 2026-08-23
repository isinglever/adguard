const EXPIRATION_TS = "2099-12-31T23:59:59Z";
const SUBSCRIPTION_UUID = "00000000-0000-4000-8000-000000000001";

function createUnlimitedService() {
  return {
    duration: "P1Y",
    service: "unlimited",
    is_infinite: true,
    active_since_ts: new Date().toISOString(),
    active_until_ts: EXPIRATION_TS,
    payment_provider: "apple-in-app",
    product_name: "unlimited-12-months",
    title: "Lingvist Unlimited. 1-year subscription",
    subscription: {
      is_recurring: true,
      uuid: SUBSCRIPTION_UUID,
      group_name: "unlimited",
      period: "P1Y",
      status: "permanent-full",
      next_billing_ts: EXPIRATION_TS,
      expiration_ts: EXPIRATION_TS,
      free_trial_duration: "P100Y",
      is_on_free_trial: false,
      is_on_one_time_discount: false,
      one_time_discount_percentage: null,
      one_time_discount_duration: null,
      is_on_permanent_discount: false,
      permanent_discount_percentage: null,
      price: {
        amount: "0.000000",
        currency: "USD",
        schedule: [],
      },
    },
    unlimited_bundle: {},
    is_active: true,
  };
}

try {
  const obj = JSON.parse($response?.body || "{}");
  const services = Array.isArray(obj.services) ? obj.services : [];
  const defaults = createUnlimitedService();
  let service = services.find((item) => item?.service === "unlimited");

  if (!service) {
    service = defaults;
    services.unshift(service);
  } else {
    const activeSince = service.active_since_ts || defaults.active_since_ts;
    const subscription = {
      ...defaults.subscription,
      ...(service.subscription || {}),
      is_recurring: true,
      group_name: "unlimited",
      period: "P1Y",
      status: "permanent-full",
      next_billing_ts: EXPIRATION_TS,
      expiration_ts: EXPIRATION_TS,
      free_trial_duration: "P100Y",
      is_on_free_trial: false,
    };

    Object.assign(service, defaults, {
      active_since_ts: activeSince,
      subscription,
      unlimited_bundle: service.unlimited_bundle || {},
    });
  }

  obj.services = services;
  obj.has_historical_services = false;
  obj.latest_historical_service_paid = false;

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`Lingvist services script error: ${e}`);
  $done($response?.body ? { body: $response.body } : {});
}
