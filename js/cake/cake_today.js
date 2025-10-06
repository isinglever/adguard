try {
  let obj = JSON.parse($response?.body || '{}');

  const normalizeRestrictedNow = (value) => {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(normalizeRestrictedNow);
      return;
    }

    // Force any nested restrictedNow flag to false
    if (Object.prototype.hasOwnProperty.call(value, 'restrictedNow')) {
      value.restrictedNow = false;
    }

    Object.values(value).forEach(normalizeRestrictedNow);
  };

  const pruneMembershipBanner = (value) => {
    if (!value || typeof value !== 'object') {
      return;
    }

    if (Array.isArray(value)) {
      for (let i = value.length - 1; i >= 0; i -= 1) {
        const item = value[i];
        if (item && typeof item === 'object' && item.type === 'membershipTimeSaleHomeBanner') {
          value.splice(i, 1);
        } else {
          pruneMembershipBanner(item);
        }
      }
      return;
    }

    Object.values(value).forEach(pruneMembershipBanner);
  };

  normalizeRestrictedNow(obj);
  pruneMembershipBanner(obj);

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`cake services script error: ${e}`);
  $done($response?.body ? { body: $response.body } : {});
}
