import { NextRequest, NextResponse } from "next/server";

interface LoginRequest {
  email: string;
  password: string;
}

interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  isAuthenticated: boolean;
  expiresAt: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Demo authentication - in production this would check against a real database
    // Demo credentials: admin@oneup.dev / Admin123!
    // For now, we'll hardcode this but in production this should be environment variables
    const DEMO_EMAIL = "admin@oneup.dev";
    const DEMO_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create session
    const session: Session = {
      user: {
        id: "1",
        email: DEMO_EMAIL,
        name: "Admin ONEUP",
      },
      isAuthenticated: true,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Create response with session data
    const response = NextResponse.json({
      success: true,
      session: {
        user: session.user,
        expiresAt: session.expiresAt,
      },
    });

    // Set HTTP-only cookie for server-side authentication
    // In development (non-HTTPS), we use SameSite=Lax without Secure flag
    // In production with HTTPS, you should add the Secure flag
    const cookieValue = JSON.stringify(session);
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

    // Set the cookie with HttpOnly flag (can only be set server-side)
    response.cookies.set({
      name: "admin_session",
      value: cookieValue,
      httpOnly: true, // Prevents client-side JavaScript access
      sameSite: "lax", // CSRF protection
      path: "/",
      maxAge: maxAge,
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https"), // Enable in production or HTTPS
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
