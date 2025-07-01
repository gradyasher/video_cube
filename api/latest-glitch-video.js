import fs from "fs";
import path from "path";

export async function handler(req, res) {
  try {
    const dir = path.resolve("public/generated");
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith(".mp4"))
      .map(file => ({
        file,
        time: fs.statSync(path.join(dir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // sort newest to oldest

    if (files.length === 0) {
      return res.status(404).json({ error: "No video found" });
    }

    const latest = files[0].file;
    return res.status(200).json({ url: `/generated/${latest}` });
  } catch (err) {
    console.error("❌ Failed to fetch latest glitch video:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
