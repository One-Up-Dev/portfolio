import { NextRequest, NextResponse } from "next/server";
import { db } from "../db";
import { adminSessions } from "../db/schema";
import { eq, and, gte } from "drizzle-orm";

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check if this is an admin route that needs protection
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_session")?.value;

    // No session token, redirect to login
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Validate the session token against the database
    try {
      const session = await db.query.adminSessions.findFirst({
        where: and(
          eq(adminSessions.token, token),
          gte(adminSessions.expiresAt, new Date()),
        ),
      });

      // No valid session found or session expired, redirect to login
      if (!session) {
        // Clean up expired session if it exists
        await db.delete(adminSessions).where(eq(adminSessions.token, token));

        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Session is valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // Database error, redirect to login for safety
      console.error("Session validation error:", error);
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Not an admin route, allow request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all admin routes
    "/admin/:path*",
  ],
};
