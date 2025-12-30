import { NextResponse } from "next/server";

export async function POST() {
  try {
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
