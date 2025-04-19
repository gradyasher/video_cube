export default function handler(req, res) {
  console.log("📡 /api/test hit");
  res.status(200).json({ message: "Hello from API" });
}
