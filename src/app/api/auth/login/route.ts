import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { adminSessions } from "../../../../../db/schema";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  console.log("=== LOGIN ATTEMPT ===");
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;
    console.log("Email:", email);

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
      console.log("Invalid credentials");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    console.log("Credentials valid, creating session...");

    // Generate secure session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Extract IP address and user agent for session tracking
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create session in database
    console.log("Inserting session into DB...");
    await db.insert(adminSessions).values({
      userId: "1", // Demo user ID
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });
    console.log("Session created with token:", token.substring(0, 8) + "...");

    // Create response with user data (not session data)
    const response = NextResponse.json({
      success: true,
      user: {
        id: "1",
        email: DEMO_EMAIL,
        name: "Admin ONEUP",
      },
    });

    // Set HTTP-only cookie with just the token
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    // Only use secure cookies in production (not in local dev)
    const isSecure = process.env.NODE_ENV === "production";

    console.log(
      "Setting cookie, secure:",
      isSecure,
      "NODE_ENV:",
      process.env.NODE_ENV,
    );

    response.cookies.set({
      name: "admin_session",
      value: token, // Only store the token, not the full session
      httpOnly: true, // Prevents client-side JavaScript access
      sameSite: "lax", // CSRF protection
      path: "/",
      maxAge: maxAge,
      secure: isSecure,
    });

    console.log("=== LOGIN SUCCESS ===");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
