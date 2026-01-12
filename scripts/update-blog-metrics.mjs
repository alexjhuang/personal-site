import fs from "node:fs";
import path from "node:path";

const metricsUrl = process.env.BLOG_METRICS_URL;
const metricsPath = path.join(process.cwd(), "public", "blog-metrics.json");

if (!metricsUrl) {
  console.log("BLOG_METRICS_URL not set; skipping metrics update.");
  process.exit(0);
}

const response = await fetch(metricsUrl);
if (!response.ok) {
  throw new Error(`Failed to fetch metrics: ${response.status}`);
}

const payload = await response.json();
const metrics = {
  updatedAt: new Date().toISOString().slice(0, 10),
  views: payload.views || payload,
};

fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2));
console.log("Updated blog metrics.");
