import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { pageViews } from "../../../../../db/schema";
import crypto from "crypto";

// POST /api/analytics/track - Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pagePath, referrer } = body;

    if (!pagePath) {
      return NextResponse.json(
        { error: "Bad Request", message: "pagePath is required" },
        { status: 400 },
      );
    }

    // Get client info for anonymous tracking
    const userAgent = request.headers.get("user-agent") || undefined;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0] || realIp || "unknown";

    // Hash the IP for privacy
    const ipHash = crypto
      .createHash("sha256")
      .update(clientIp + (userAgent || ""))
      .digest("hex")
      .substring(0, 16);

    // Generate or use session ID
    const sessionCookie = request.cookies.get("analytics_session");
    let sessionId = sessionCookie?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // Insert page view
    await db.insert(pageViews).values({
      pagePath,
      referrer: referrer || null,
      userAgent,
      ipHash,
      sessionId,
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: "Page view tracked",
    });

    // Set session cookie if not exists (expires in 30 minutes)
    if (!sessionCookie) {
      response.cookies.set("analytics_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 30, // 30 minutes
      });
    }

    return response;
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to track page view" },
      { status: 500 },
    );
  }
}
