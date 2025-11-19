// server.js
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { spawn } from "child_process";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { generateQRCode } from "./src/utils/generateQRCode.js";
import subscribeHandler from "./api/subscribe.js";
import signalHandler from "./api/signal.js";
import { triggerMailchimpJourney } from "./api/mailchimp.js";
import generateDiscount from "./api/generate-discount.js";
import { generateNewCartId } from "./src/utils/shopifyUtils.server.js";
import { hasStickerInCart } from "./src/utils/cartUtils.js";
import { FREE_STICKER_VARIANT_ID } from "./src/utils/variantMap.js"
import mailchimp from "@mailchimp/mailchimp_marketing";


const app = express();
const upload = multer({ dest: "uploads/" });
const PORT = 3001;
const MAX_AGE_MINUTES = 10;
const ipClaims = new Map();
const MAX_CLAIMS_PER_HOUR = 3;

dotenv.config();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
app.use("/api/generate-discount", generateDiscount);

function isRateLimited(ip) {
  const now = Date.now();
  const claims = ipClaims.get(ip) || [];
  const recent = claims.filter(ts => now - ts < 60 * 60 * 1000); // last hour
  if (recent.length >= MAX_CLAIMS_PER_HOUR) return true;
  ipClaims.set(ip, [...recent, now]);
  return false;
}

// auto-purge generated folder every 5 minutes
/*
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
setInterval(() => {
  const dir = path.resolve("uploads");
  const now = Date.now();

  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const ageMinutes = (now - stats.mtime.getTime()) / 60000;
    if (ageMinutes > 15) {
      fs.unlinkSync(filePath);
      console.log("🧹 Deleted temp upload:", file);
    }
  });
}, 15 * 60 * 1000);*/

app.post("/api/subscribe", subscribeHandler);
app.post("/api/signal", signalHandler);


app.get("/api/ping", (req, res) => {
  res.send("pong");
});


app.post("/api/check-claimed", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const dc = apiKey.split("-")[1]; // Get data center from key

  const hash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      // Not subscribed
      return res.json({ alreadyClaimed: false });
    }

    const data = await response.json();

    const isSubscribed = data.status === "subscribed" || data.status === "pending";
    return res.json({ alreadyClaimed: isSubscribed });
  } catch (err) {
    console.error("💥 Mailchimp check error:", err);
    return res.status(500).json({ error: "Internal Mailchimp check failed." });
  }
});


// server.js
app.post("/api/add-free-sticker", async (req, res) => {
  const { cartId } = req.body;
  console.log()
  if (!cartId) return res.status(400).json({ error: "Missing cartId" });

  try {
    const query = `
      query {
        cart(id: "${cartId}") {
          lines(first: 20) {
            edges {
              node {
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    const cartRes = await fetch(`https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/api/2023-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    // check if shopify has sticker in their cart
    const { data } = await cartRes.json();
    const lines = data?.cart?.lines?.edges?.map((edge) => edge.node) || [];

    if (hasStickerInCart({ lines }, FREE_STICKER_VARIANT_ID)) {
      return res.status(409).json({ message: "Sticker already in cart" });
    }

    // ➕ Add it
    const mutation = `
      mutation {
        cartLinesAdd(cartId: "${cartId}", lines: [{ merchandiseId: "${FREE_STICKER_VARIANT_ID}", quantity: 1 }]) {
          cart { id }
        }
      }
    `;

    await fetch(`https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/api/2023-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: mutation }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Failed to add free sticker", err);
    return res.status(500).json({ error: "Internal error" });
  }
});


app.post("/api/delete-cart", async (req, res) => {
  const { cartId } = req.body;
  if (!cartId) return res.status(400).json({ error: "Missing cartId" });

  try {
    const query = `
      query {
        cart(id: "${cartId}") {
          lines(first: 50) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `;
    const res1 = await fetch(`https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/api/2023-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });
    const json1 = await res1.json();
    const lineIds = json1.data.cart.lines.edges.map((e) => e.node.id);

    // Step 2: remove those lines from the cart
    const mutation = `
      mutation {
        cartLinesRemove(cartId: "${cartId}", lineIds: ${JSON.stringify(lineIds)}) {
          cart {
            id
          }
        }
      }
    `;
    await fetch(`https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/api/2023-04/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: mutation }),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Shopify cart cleanup failed:", err);
    return res.status(500).json({ error: "Failed to clear cart on Shopify" });
  }
});

/*
app.post("/api/process-glitch-video", upload.single("file"), (req, res) => {
  console.log("📩 Received POST /api/process-glitch-video");

  try {
    const uploadedFile = req.file;
    const sessionId = req.body.sessionId;
    const userUUID = req.body.uuid || uuidv4();

    if (!uploadedFile) return res.status(400).json({ error: "No file uploaded" });
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const inputPath = uploadedFile.path;
    const frameDir = path.resolve(`.temp/frames/${sessionId}`);
    const baseName = `glitch-${userUUID}`;
    const outputPath = path.resolve("public/generated", `${baseName}.mp4`);

    if (!fs.existsSync("public/generated")) {
      fs.mkdirSync("public/generated", { recursive: true });
    }

    if (!fs.existsSync(frameDir)) {
      console.warn("❌ Frame directory not found:", frameDir);
      return res.status(404).json({ error: "Frame folder not found" });
    }

    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-framerate", "30",
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

  const frameDir = path.resolve(`.temp/frames/${sessionId}`);
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
      "[0:v]scale='if(gt(a,1080/1350),-1,1080)':'if(gt(a,1080/1350),1350,-1)'[scaled]",
      "[scaled]crop=1080:1350:(in_w-1080)/2:(in_h-1350)/2[main]",
      "[1:v]scale=1080:1350[overlay]",
      "[2:v]scale=100:100[qr]",
      "[main][overlay]overlay=0:0[tmp1]",
      "[tmp1][qr]overlay=W-w-30:H-h-30"
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

    // Clean up frame directory
    try {
      fs.rmSync(frameDir, { recursive: true, force: true });
      console.log("🧼 Cleaned up frames:", frameDir);
    } catch (err) {
      console.warn("⚠️ Failed to delete frames folder:", err.message);
    }

    // Clean up QR code
    try {
      fs.unlinkSync(qrPath);
      console.log("🧽 Deleted QR code:", qrPath);
    } catch (err) {
      console.warn("⚠️ Failed to delete QR code:", err.message);
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
  console.log("📩 /api/claim-referral hit");

  const { email, shareId, referred } = req.body;
  const timestamp = new Date().toISOString();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  const apiKey = process.env.MAILCHIMP_API_KEY;

  if (isRateLimited(ip)) {
    console.warn("⚠️ Rate limit triggered:", ip);
    return res.status(429).json({ error: "Too many claims from this IP." });
  }


  const journeyUrl = "https://us12.api.mailchimp.com/3.0/customer-journeys/journeys/3986/steps/29643/actions/trigger";

  if (!email || !shareId || !referred) {
    console.error("❌ Missing fields", { email, shareId, referred });
    return res.status(400).json({ error: "Missing required fields" });
  }

  const logPath = path.resolve("logs/referral-claims.log");

  try {
    const logDir = path.resolve("logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, "");

    const existing = fs.readFileSync(logPath, "utf8").split("\n").filter(Boolean);
    const duplicate = existing.find(line =>
      line.includes(`email: ${email}`) ||
      line.includes(`ip: ${ip}`) ||
      (line.includes(`shareId: ${shareId}`) && line.includes(`email: ${email}`))
    );

    if (duplicate) {
      console.log("🛑 Duplicate claim blocked:", email, ip);
      return res.status(409).json({ error: "Already claimed" });
    }

    const logLine = `${timestamp} | email: ${email} | ip: ${ip} | shareId: ${shareId} | referred: ${referred}\n`;
    fs.appendFileSync(logPath, logLine);
    const sanitizedEmail = email.trim().toLowerCase();

    (async () => {
      try {
        const addRes = await fetch(`https://us12.api.mailchimp.com/3.0/lists/${listId}/members`, {
          method: "POST",
          headers: {
            Authorization: `apikey ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: sanitizedEmail,
            status: "subscribed",
            merge_fields: {
              ADDRESS: "" // empty string to satisfy required field
            }
          }),
        });

        if (!addRes.ok) {
          const err = await addRes.json();
          console.error("❌ Failed to add contact to audience:", err);
        } else {
          console.log("✅ Contact added to audience:", sanitizedEmail);
        }

        const journeyRes = await fetch(journeyUrl, {
          method: "POST",
          headers: {
            Authorization: `apikey ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: sanitizedEmail,
            merge_fields: {
              ADDRESS: "" // empty string to satisfy required field
            }
          }),
        });

        if (!journeyRes.ok) {
          const err = await journeyRes.json();
          console.error("❌ Journey trigger failed:", err);
        } else {
          console.log("✅ Mailchimp bonus triggered for Viewer A:", referred);
        }
      } catch (err) {
        console.error("❌ Mailchimp claim-referral crash:", err.message);
      }
    })();

    console.log("✅ Referral claim saved:", logLine.trim());
    return res.status(200).json({ message: "Claim logged" });
  } catch (err) {
    console.error("❌ claim-referral crash:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.post("/api/mailchimp/referral-opened", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Missing email" });

  const listId = process.env.MAILCHIMP_AUDIENCE_ID;
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const journeyUrl = "https://us12.api.mailchimp.com/3.0/customer-journeys/journeys/3987/steps/29645/actions/trigger";

  try {
    const addRes = await fetch(`https://us12.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: "POST",
      headers: {
        Authorization: `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          ADDRESS: "" // empty string to satisfy required field
        }
      }),
    });

    if (!addRes.ok) {
      const err = await addRes.json();
      console.error("❌ Failed to add contact to audience:", err);
    } else {
      console.log("✅ Contact added to audience:", email);
    }

    const triggerRes = await fetch(journeyUrl, {
      method: "POST",
      headers: {
        Authorization: `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        merge_fields: {
          ADDRESS: "" // empty string to satisfy required field
        }
      }),
    });

    if (!triggerRes.ok) {
      const err = await triggerRes.json();
      console.error("❌ Journey trigger failed:", err);
      return res.status(500).json({ error: "Journey trigger failed", detail: err });
    }

    console.log("✅ Referral-opened journey triggered for:", email);
    res.status(200).json({ message: "Referral-opened journey triggered" });

  } catch (err) {
    console.error("❌ Mailchimp referral-opened crash:", err.message);
    res.status(500).json({ error: "Internal error", details: err.message });
  }
});
*/



app.listen(PORT, () => {
  console.log(`🧠 Backend running on http://localhost:${PORT}`);
});
