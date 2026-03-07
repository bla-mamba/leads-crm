import fs from "fs";
import path from "path";

export default function handler(req: any, res: any) {
  // Allowed IP
  const allowedIP = "213.252.230.97";

  // Get visitor IP
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!ip || !ip.includes(allowedIP)) {
    // Block unauthorized IPs
    res.status(403).send("Access Denied");
    return;
  }

  // Path to your SPA
  const filePath = path.join(process.cwd(), "dist", "index.html");

  if (!fs.existsSync(filePath)) {
    res.status(500).send("index.html not found");
    return;
  }

  // Serve SPA
  const html = fs.readFileSync(filePath, "utf-8");
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}