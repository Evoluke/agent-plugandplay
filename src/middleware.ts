// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/api/auth/login", "/api/auth/signup", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sb-access-token")?.value;

  // Se for rota pública e já tiver token, manda pro dashboard
  if (PUBLIC_PATHS.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Se for rota que NÃO é pública e NÃO tiver token, manda pro login
  if (!PUBLIC_PATHS.includes(pathname) && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Senão, deixa passar
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};