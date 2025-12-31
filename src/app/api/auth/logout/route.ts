import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { adminSessions } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get the session token from cookie
    const token = request.cookies.get("admin_session")?.value;

    // Delete the session from database if token exists
    if (token) {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the admin_session cookie by setting it to expire immediately
    response.cookies.set({
      name: "admin_session",
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
      secure:
        process.env.NODE_ENV === "production" ||
        process.env.NEXT_PUBLIC_BASE_URL?.startsWith("https"), // Enable in production or HTTPS
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
