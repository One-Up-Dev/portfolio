import { NextRequest, NextResponse } from "next/server";

// Session interface matching the client-side session structure
interface Session {
  isAuthenticated: boolean;
  expiresAt: number;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page without authentication
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check if this is an admin route that needs protection
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session");

    // No session cookie, redirect to login
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Try to parse and validate the session
    try {
      const session: Session = JSON.parse(sessionCookie.value);

      // Validate session has required fields and is not expired
      if (!session.isAuthenticated || !session.expiresAt) {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Check if session is expired
      if (session.expiresAt <= Date.now()) {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Session is valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // Invalid session cookie format, redirect to login
      console.error("Invalid session cookie format:", error);
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
