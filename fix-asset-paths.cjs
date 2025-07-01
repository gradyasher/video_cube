const fs = require("fs");
const path = require("path");

const rootDir = "./src";
const exts = [".js", ".jsx", ".ts", ".tsx"];

function walk(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

walk(rootDir, (filePath) => {
  const ext = path.extname(filePath);
  if (!exts.includes(ext)) return;

  let contents = fs.readFileSync(filePath, "utf-8");
  let updated = contents.replace(
    /"import\.meta\.env\.BASE_URL\s*\+\s*\"([^\"]+)\""/g,
    (_, assetPath) => {
      return `\`${"${import.meta.env.BASE_URL}"}${assetPath}\``;
    }
  );

  if (updated !== contents) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log("✅ Updated:", filePath);
  }
});
