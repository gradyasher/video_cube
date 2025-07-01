// scripts/cleanup.js
import fs from "fs";
import path from "path";

const dir = path.resolve("public/generated");
const maxAgeMs = 60 * 60 * 1000; // 1 hour

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith(".webm")) return;

  const filePath = path.join(dir, file);
  const stats = fs.statSync(filePath);
  const age = Date.now() - stats.mtimeMs;

  if (age > maxAgeMs) {
    fs.unlinkSync(filePath);
    console.log("🧹 Deleted old file:", file);
  }
});
