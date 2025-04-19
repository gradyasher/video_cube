// /api/upload-glitch-reading.js (Node.js, Express-like handler)

import { writeFile, unlink } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // required for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const form = new formidable.IncomingForm();
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Upload failed" });

    const inputPath = files.video.filepath;
    const outputPath = inputPath.replace(/\.webm$/, "-processed.webm");
    const overlayPath = path.join(process.cwd(), "public", "assets", "glitch-reading-overlay.png");

    try {
      await runFFmpeg(inputPath, overlayPath, outputPath);

      const publicUrl = `/uploads/${path.basename(outputPath)}`;
      return res.status(200).json({ url: publicUrl });
    } catch (err) {
      console.error("FFmpeg error:", err);
      return res.status(500).json({ error: "Processing failed" });
    } finally {
      // Optional cleanup
      setTimeout(() => unlink(inputPath), 5000);
    }
  });
}

function runFFmpeg(input, overlay, output) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", input,
      "-i", overlay,
      "-filter_complex", "[0:v][1:v] overlay=0:0",
      "-c:v", "libvpx-vp9",
      "-crf", "30",
      "-b:v", "0",
      output,
    ]);

    ffmpeg.stderr.on("data", (data) => {
      console.log("ffmpeg:", data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}
