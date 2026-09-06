#!/usr/bin/env node
// Bundle existing app handlers into one self-contained Surge script.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.join(__dirname, "..");
const handlers = {
  runBoldVoice: "js/boldvoice.js",
  runSpark: "js/spark.js",
  runElevate: "js/revenuecat.js",
  runLegacy: "js/revenue.js"
};
const sources = Object.fromEntries(Object.entries(handlers).map(([name, file]) => [name, fs.readFileSync(path.join(root, file), "utf8")]));
const mappingLiteral = sources.runLegacy.match(/const mapping = (\{[\s\S]*?\n\});/);
if (!mappingLiteral) throw new Error("Cannot find the legacy RevenueCat mapping");
const mapping = vm.runInNewContext("(" + mappingLiteral[1] + ")", {}, { timeout: 1000 });
const prefixes = Object.keys(mapping).filter(key => key !== "BoldVoice/" && key !== "Spark");
let output = fs.readFileSync(path.join(root, "source/revenuecat/router.template.js"), "utf8");
for (const marker of ["/*__LEGACY_PREFIXES__*/ []", "/*__HANDLERS__*/"]) {
  if (output.split(marker).length !== 2) throw new Error("Missing/duplicate template marker: " + marker);
}
output = output.replace("/*__LEGACY_PREFIXES__*/ []", () => JSON.stringify(prefixes));
output = output.replace("/*__HANDLERS__*/", () => Object.entries(sources).map(([name, source]) => {
  const file = handlers[name];
  const hash = crypto.createHash("sha256").update(source).digest("hex");
  return "// Source: " + file + " sha256=" + hash + "\nfunction " + name + "($request, $response, $done) {\n" + source + "\n}";
}).join("\n\n"));
// Legacy comment lines include trailing spaces; keep generated comments clean.
output = output.replace(/^(\/\/[^\n]*?)[ \t]+$/gm, "$1");
new vm.Script(output);
const target = path.join(root, "js/revenuecat_router.js");
if (process.argv.includes("--check")) {
  if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== output) {
    throw new Error("Router bundle is stale; run node tools/build-revenuecat-router.js");
  }
  console.log("RevenueCat router bundle is current.");
} else {
  fs.writeFileSync(target, output);
  console.log("Built js/revenuecat_router.js with four local handlers.");
}
