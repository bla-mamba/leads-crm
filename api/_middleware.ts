import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  const allowedIP = "213.252.230.97";

  // Get client IP (Vercel sets x-forwarded-for)
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!ip || !ip.includes(allowedIP)) {
    res.status(403).send("Access Denied");
    return;
  }

  // Serve SPA index.html for any route
  const filePath = path.join(process.cwd(), "dist", "index.html");

  if (!fs.existsSync(filePath)) {
    res.status(500).send("index.html not found");
    return;
  }

  const html = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}