// pages/api/process-glitch-video.js
import formidable from "formidable";
import fs from "fs";
import { exec } from "child_process";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("❌ Form parse error:", err);
        return res.status(500).json({ error: "Form parse error" });
      }

      const uploaded = files.file;
      const inputPath = uploaded?.filepath;
      if (!inputPath) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const outDir = path.join(process.cwd(), "public", "generated");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const outputFilename = `glitch-reading-${Date.now()}.webm`;
      const outputPath = path.join(outDir, outputFilename);
      const overlayPath = path.join(process.cwd(), "public", "assets", "glitch-reading-overlay.png");

      const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -i "${overlayPath}" -filter_complex "overlay=0:0" -c:v libvpx-vp9 "${outputPath}"`;

      console.log("🔧 FFmpeg CMD:", ffmpegCmd);

      exec(ffmpegCmd, (err, stdout, stderr) => {
        if (err) {
          console.error("❌ FFmpeg error:", stderr);
          return res.status(500).json({ error: "FFmpeg failed" });
        }

        const videoUrl = `/generated/${outputFilename}`;
        console.log("✅ Created:", videoUrl);
        return res.status(200).json({ url: videoUrl });
      });
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
