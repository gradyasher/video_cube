// api/process-glitch-video.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  console.log("📩 [Router] Received POST /api/process-glitch-video");

  const inputPath = req.file.path;
  const overlayPath = path.resolve("public/assets/glitch-reading-overlay.png");
  const outputFilename = `glitch-${Date.now()}.mp4`;
  const outputPath = path.resolve("public/generated", outputFilename);

  if (!fs.existsSync("public/generated")) fs.mkdirSync("public/generated");

  const cmd = `ffmpeg -y -i ${inputPath} -i ${overlayPath} -filter_complex "overlay=0:0" -c:v libx264 -pix_fmt yuv420p ${outputPath}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("🛑 FFmpeg error:", stderr);
      return res.status(500).json({ error: "FFmpeg failed" });
    }

    console.log("✅ MP4 saved:", outputPath);
    res.json({ url: `/generated/${outputFilename}` });
  });
});

export default router;
