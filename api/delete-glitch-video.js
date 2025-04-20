import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const { url } = JSON.parse(req.body);
    const filename = url.split("/generated/")[1];
    const filepath = path.resolve("public/generated", filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: "File not found" });
    }
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
}
