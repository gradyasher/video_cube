// scripts/migrateFrames.js

const fs = require("fs");
const path = require("path");

const oldFramesPath = path.resolve("public/frames");
const newFramesPath = path.resolve(".temp/frames");

if (!fs.existsSync(newFramesPath)) {
  fs.mkdirSync(newFramesPath, { recursive: true });
  console.log("✅ Created .temp/frames directory");
}

if (!fs.existsSync(oldFramesPath)) {
  console.log("⚠️ No public/frames folder found. Nothing to move.");
  process.exit(0);
}

const sessionDirs = fs.readdirSync(oldFramesPath);

sessionDirs.forEach((sessionId) => {
  const src = path.join(oldFramesPath, sessionId);
  const dest = path.join(newFramesPath, sessionId);

  try {
    fs.renameSync(src, dest);
    console.log(`➡️ Moved ${sessionId} to .temp/frames/`);
  } catch (err) {
    console.error(`❌ Failed to move ${sessionId}:`, err.message);
  }
});

try {
  fs.rmdirSync(oldFramesPath);
  console.log("🧹 Cleaned up empty public/frames/");
} catch {
  console.warn("⚠️ Could not remove public/frames/. It may not be empty.");
}
