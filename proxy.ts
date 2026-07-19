import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production" ? [SITE_URL] : ["http://localhost:3000"];

function buildCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") ?? "";
    const isAllowed = ALLOWED_ORIGINS.includes(origin);

    // CORS preflight
    if (request.method === "OPTIONS") {
      if (!isAllowed) {
        return new NextResponse(null, { status: 403 });
      }
      return new NextResponse(null, {
        status: 204,
        headers: buildCorsHeaders(origin),
      });
    }

    // GET / HEAD — public read data; same-origin browser requests often omit Origin
    if (request.method === "GET" || request.method === "HEAD") {
      const res = NextResponse.next();
      if (isAllowed) {
        Object.entries(buildCorsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
      }
      return res;
    }

    // Mutating methods: require matching Origin
    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const res = NextResponse.next();
    Object.entries(buildCorsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
