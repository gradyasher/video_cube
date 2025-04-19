import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { exec } from "child_process";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3001;

app.use(cors());
app.use(express.static("public"));

app.post("/api/process-glitch-video", upload.single("file"), (req, res) => {
  const inputPath = req.file.path;
  const overlayPath = path.resolve("public/assets/glitch-reading-overlay.png");
  const outputFilename = `glitch-${Date.now()}.webm`;
  const outputPath = path.resolve("public/generated", outputFilename);

  if (!fs.existsSync("public/generated")) fs.mkdirSync("public/generated");

  const cmd = `ffmpeg -y -i ${inputPath} -i ${overlayPath} -filter_complex "overlay=0:0" -c:v libvpx-vp9 ${outputPath}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("FFmpeg error:", stderr);
      return res.status(500).json({ error: "FFmpeg failed" });
    }
    res.json({ url: `/generated/${outputFilename}` });
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Backend running on http://localhost:${PORT}`);
});
