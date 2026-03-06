import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_IP = "213.252.230.97"; // your allowed IP

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.ip ||
    "";

  if (ip !== ALLOWED_IP) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};