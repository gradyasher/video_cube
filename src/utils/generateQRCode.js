// utils/generateQRCode.js
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

export async function generateQRCode(shareId) {
  const outDir = path.resolve("public/qrcodes");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const qrUrl = `https://dgenrnation.com/glitch-reading/share/${shareId}`;
  const outPath = path.join(outDir, `${shareId}.png`);

  try {
    await QRCode.toFile(outPath, qrUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#ccff33",
        light: "#0000" // transparent background
      }
    });
    return outPath;
  } catch (err) {
    console.error("❌ Failed to generate QR code:", err);
    return null;
  }
}
