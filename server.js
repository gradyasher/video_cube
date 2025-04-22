// server.js
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { spawn } from "child_process";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { generateQRCode } from "./src/utils/generateQRCode.js"; // adjust path as needed

const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3001;
const MAX_AGE_MINUTES = 10;

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// auto-purge generated folder every 5 minutes
setInterval(() => {
  const dir = path.resolve("public/generated");
  const now = Date.now();

  fs.readdirSync(dir).forEach((file) => {
    if (file.endsWith(".mp4")) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const ageMinutes = (now - stats.mtime.getTime()) / 60000;
      if (ageMinutes > MAX_AGE_MINUTES) {
        fs.unlinkSync(filePath);
        console.log("🧹 Interval auto-purge:", file);
      }
    }
  });
}, 10 * 60 * 1000); // every 10 minutes


app.post("/api/process-glitch-video", upload.single("file"), (req, res) => {
  console.log("📩 Received POST /api/process-glitch-video");

  try {
    const uploadedFile = req.file;
    const userUUID = req.body.uuid || uuidv4();
    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });

    const inputPath = uploadedFile.path;
    const baseName = `glitch-${userUUID}`;
    const outputPath = path.resolve("public/generated", `${baseName}.mp4`);

    if (!fs.existsSync("public/generated")) fs.mkdirSync("public/generated", { recursive: true });

    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-framerate", "30", // <- this is the key line
      "-i", path.join(frameDir, "frame_%04d.png"),
      "-r", "30",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "17",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      outputPath,
    ]);


    ffmpeg.stderr.on("data", (data) => {
      console.error("⚠️ FFmpeg stderr:", data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ FFmpeg failed with code", code);
        return res.status(500).json({ error: "FFmpeg failed" });
      }

      fs.unlinkSync(inputPath);
      console.log("✅ MP4 saved:", outputPath);

      return res.status(200).json({ url: `/generated/${baseName}.mp4` });
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
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
  console.log("📁 Looking in:", dir);

  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    console.error("❌ Directory read error:", err);
    return res.status(500).json({ error: "Directory read error" });
  }

  const now = Date.now();
  const mp4s = files.filter((f) => f.endsWith(".mp4"));

  mp4s.forEach((f) => {
    const fullPath = path.join(dir, f);
    const stats = fs.statSync(fullPath);
    const ageMinutes = (now - stats.mtime.getTime()) / 60000;
    if (ageMinutes > MAX_AGE_MINUTES) {
      fs.unlinkSync(fullPath);
      console.log("🧹 Auto-purged:", f);
    }
  });

  const freshList = mp4s.filter((f) => fs.existsSync(path.join(dir, f)));
  if (freshList.length === 0) return res.status(404).json({ error: "No video yet." });

  freshList.sort((a, b) => {
    const aTime = fs.statSync(path.join(dir, a)).mtime.getTime();
    const bTime = fs.statSync(path.join(dir, b)).mtime.getTime();
    return bTime - aTime;
  });

  const latest = freshList[0];
  console.log("🎯 Returning video:", latest);
  return res.json({ url: `/generated/${latest}` });
});


// Frame upload route
app.post("/api/upload-frame", upload.single("frame"), (req, res) => {
  const sessionId = req.body.sessionId;
  const filename = req.file?.originalname;

  if (!sessionId || !req.file || !filename) {
    return res.status(400).json({ error: "Missing sessionId or file" });
  }

  const dir = path.resolve("public/frames", sessionId);
  const filePath = path.join(dir, filename);

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const fileBuffer = fs.readFileSync(req.file.path);
    fs.writeFileSync(filePath, fileBuffer);
    fs.unlinkSync(req.file.path); // clean up temp upload

    console.log(`📥 Received frame upload: sessionId=${sessionId}, filename=${filename}`);
    res.status(200).json({ message: "Frame saved" });
  } catch (err) {
    console.error("🛑 Error writing frame:", err);
    res.status(500).json({ error: "Failed to write frame" });
  }
});

// Stitch frames into video
app.post("/api/stitch-frames", async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  const frameDir = path.resolve(`public/frames/${sessionId}`);
  const outputFilename = `glitch-${sessionId}.mp4`;
  const outputPath = path.resolve(`public/generated/${outputFilename}`);
  const qrPath = await generateQRCode(sessionId); // generate QR

  if (!fs.existsSync(frameDir)) {
    console.warn("❌ Frame directory not found:", frameDir);
    return res.status(404).json({ error: "Frame folder not found" });
  }

  if (!qrPath || !fs.existsSync(qrPath)) {
    return res.status(500).json({ error: "Failed to generate QR code" });
  }

  console.log("🎬 Stitching frames from:", frameDir);

  const ffmpeg = spawn("ffmpeg", [
    "-y",
    "-framerate", "10",
    "-i", path.join(frameDir, "frame_%04d.png"),
    "-i", path.resolve("public/assets/glitch-reading-overlay.png"),
    "-i", qrPath,
    "-filter_complex",
    [
      // main: scale to height 1350 and crop to 1080:1350
      "[0:v]scale=-1:1350,crop=1080:1350[main]",
      // overlay: scale to fit frame
      "[1:v]scale=1080:1350[overlay]",
      // qr: scale down
      "[2:v]scale=100:100[qr]",
      // stack: apply overlay, then QR at bottom-right
      "[main][overlay]overlay=0:0[tmp1]; [tmp1][qr]overlay=W-w-30:H-h-30"
    ].join(";"),
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "17",
    "-pix_fmt", "yuv420p",
    "-r", "10",
    "-movflags", "+faststart",
    outputPath,
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.error("⚠️ FFmpeg stderr:", data.toString());
  });

  ffmpeg.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ FFmpeg exited with code ${code}`);
      return res.status(500).json({ error: `FFmpeg failed with code ${code}` });
    }

    console.log("✅ Video stitched:", outputPath);
    res.json({ url: `/generated/${outputFilename}` });

    try {
      fs.rmSync(frameDir, { recursive: true, force: true });
      console.log("🧼 Cleaned up frames:", frameDir);
    } catch (err) {
      console.warn("⚠️ Failed to delete frames folder:", err.message);
    }
  });
});

app.post("/api/log-referral", (req, res) => {
  const { referrerId, action } = req.body;
  const timestamp = new Date().toISOString();

  if (!referrerId) {
    return res.status(400).json({ error: "Missing referrerId" });
  }

  const logLine = `${timestamp} - Referrer: ${referrerId} - Action: ${action || "shared"}\n`;
  const logPath = path.resolve("logs/referrals.log");

  try {
    if (!fs.existsSync("logs")) fs.mkdirSync("logs", { recursive: true });
    fs.appendFileSync(logPath, logLine);
    console.log("📓 Logged referral:", logLine.trim());
    res.status(200).json({ message: "Logged" });
  } catch (err) {
    console.error("🛑 Failed to log referral:", err);
    res.status(500).json({ error: "Failed to write to log" });
  }
});

app.post("/api/claim-referral", (req, res) => {
  const { email, shareId, referred } = req.body;
  const timestamp = new Date().toISOString();

  if (!email || !shareId || !referred) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const logLine = `${timestamp} | email: ${email} | shareId: ${shareId} | referred: ${referred}\n`;
  const logPath = path.resolve("logs/referral-claims.log");

  try {
    if (!fs.existsSync("logs")) fs.mkdirSync("logs", { recursive: true });
    fs.appendFileSync(logPath, logLine);
    console.log("📩 Claimed referral:", logLine.trim());
    res.status(200).json({ message: "Referral claim logged" });
  } catch (err) {
    console.error("🛑 Failed to save referral claim:", err);
    res.status(500).json({ error: "Failed to save referral claim" });
  }
});


app.listen(PORT, () => {
  console.log(`🧠 Backend running on http://localhost:${PORT}`);
});
