// /edge-functions/_middleware.ts
export const config = {
  runtime: "edge",
};

export default function handler(req: Request) {
  const allowedIP = "213.252.230.97";

  // Vercel sets the client IP in headers
  const clientIP = req.headers.get("x-forwarded-for") || "";

  if (!clientIP.includes(allowedIP)) {
    return new Response("Access Denied", { status: 403 });
  }

  // Allow the request to continue to static files (index.html, assets)
  return fetch(req);
}