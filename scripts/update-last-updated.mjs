import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "last-updated.json");
let date = "";

try {
  date = execSync("git log -1 --format=%cs").toString().trim();
} catch {
  date = new Date().toISOString().slice(0, 10);
}

const payload = {
  updatedAt: date,
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
console.log(`Updated last-updated.json to ${date}`);
