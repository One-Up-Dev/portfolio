import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and auth API routes without authentication
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
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

    // Validate the session token via API call (Edge-compatible)
    try {
      const baseUrl = request.nextUrl.origin;
      const validateResponse = await fetch(`${baseUrl}/api/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await validateResponse.json();

      // No valid session found or session expired, redirect to login
      if (!result.valid) {
        const response = NextResponse.redirect(
          new URL("/admin/login", request.url),
        );
        // Clear the invalid cookie
        response.cookies.delete("admin_session");
        return response;
      }

      // Session is valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // API error, redirect to login for safety
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
