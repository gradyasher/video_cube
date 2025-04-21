import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { spawn } from "child_process";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3001;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

app.post("/api/process-glitch-video", upload.single("file"), (req, res) => {
  console.log("\ud83d\udce9 Received POST /api/process-glitch-video");

  try {
    const uploadedFile = req.file;
    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

    const id = Date.now();
    const inputPath = uploadedFile.path;
    const overlayPath = path.resolve("public/assets/glitch-reading-overlay.png");
    const baseName = `glitch-${id}`;
    const outputPath = path.resolve("public/generated", `${baseName}.mp4`);

    if (!fs.existsSync("public/generated")) fs.mkdirSync("public/generated", { recursive: true });

    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-vf", "eq=contrast=1.2:saturation=1.4",
      "-c:v", "libx264",
      "-crf", "17",
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-tune", "film",
      "-g", "30",
      outputPath,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.error("\u26a0\ufe0f FFmpeg stderr:", data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        console.error("\u274c FFmpeg failed with code", code);
        return res.status(500).json({ error: "FFmpeg failed" });
      }

      fs.unlinkSync(inputPath); // cleanup input webm
      console.log("\u2705 MP4 saved:", outputPath);

      const latestPath = path.resolve("public/generated/latest-glitch-video.mp4");
      try {
        if (fs.existsSync(latestPath)) fs.unlinkSync(latestPath);
        fs.copyFileSync(outputPath, latestPath); // copy ensures real file
        console.log("📦 Copied latest-glitch-video.mp4");
      } catch (err) {
        console.error("❌ Failed to copy latest video:", err);
      }

      return res.status(200).json({ url: `/generated/${baseName}.mp4` });
    });
  } catch (err) {
    console.error("\u274c Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
});

app.post("/api/delete-glitch-video", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const filePath = path.resolve("public/generated", path.basename(url));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("🗑️ Deleted:", filePath);
    return res.status(200).json({ message: "Deleted" });
  } else {
    return res.status(404).json({ error: "File not found" });
  }
});

app.get("/api/latest-glitch-video", (req, res) => {
  const dir = path.resolve("public/generated");
  console.log("\ud83d\udcc1 Looking in:", dir);

  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    console.error("\u274c Directory read error:", err);
    return res.status(500).json({ error: "Directory read error" });
  }

  const mp4s = files.filter((f) => f.endsWith(".mp4"));
  if (mp4s.length === 0) return res.status(404).json({ error: "No video yet." });

  mp4s.sort((a, b) => {
    const aTime = fs.statSync(path.join(dir, a)).mtime.getTime();
    const bTime = fs.statSync(path.join(dir, b)).mtime.getTime();
    return bTime - aTime;
  });

  const latest = mp4s[0];
  console.log("\ud83c\udfaf Returning video:", latest);
  return res.json({ url: `/generated/${latest}` });
});

app.listen(PORT, () => {
  console.log(`🧠 Backend running on http://localhost:${PORT}`);
});
