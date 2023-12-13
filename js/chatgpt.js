var body = $response.body;
var obj = JSON.parse(body);

const plus = {
  slug: "gpt-4",
  max_tokens: 32767,
  title: "GPT-4 (All Tools)",
  description: "Browsing, Advanced Data Analysis, and DALL·E are now built into GPT-4",
  tags: [
      "gpt4"
  ],
  capabilities: {},
  product_features: {
  },
  enabled_tools: [
      tools,
      tools2
  ],
};

obj.models.push(plus);

body = JSON.stringify(obj);
$done({body});