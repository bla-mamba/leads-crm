// /edge-functions/_middleware.ts
export const config = { runtime: "edge" };

export default function handler(req: Request) {
  const allowedIP = "213.252.230.97";
  const clientIP = req.headers.get("x-forwarded-for") || "";

  if (!clientIP.includes(allowedIP)) {
    return new Response("Access Denied", { status: 403 });
  }

  // Let Vercel continue serving static files (index.html, assets)
  return fetch(req);
}