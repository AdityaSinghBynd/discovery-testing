import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  console.log(process.env.NEXTAUTH_SECRET);
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("token",token);
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/another-protected-route",
    "/extraction/:path*",
    "/document/:path*",
    "/workspace/:path*",
    "/discovery/:path*",
  ],
};
