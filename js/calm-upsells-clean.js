let body = $response.body;

try {
  const data = JSON.parse(body);

  if (data && typeof data === "object") {
    if (Array.isArray(data.upsells)) {
      data.upsells = [];
    }

    if (data.products && typeof data.products === "object") {
      data.products = {};
    }

    body = JSON.stringify(data);
  }
} catch (error) {
  console.log(`calm-upsells-clean: ${error.message}`);
}

$done({ body });
