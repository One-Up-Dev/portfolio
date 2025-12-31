import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { adminSessions } from "../../../../../db/schema";
import { eq, and, gte } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("=== VALIDATE SESSION ===");
  try {
    const body = await request.json();
    const { token } = body;
    console.log(
      "Token received:",
      token ? `${token.substring(0, 8)}...` : "NONE",
    );

    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const session = await db.query.adminSessions.findFirst({
      where: and(
        eq(adminSessions.token, token),
        gte(adminSessions.expiresAt, new Date()),
      ),
    });

    console.log("Session found:", session ? "YES" : "NO");

    if (!session) {
      console.log("Invalid or expired session, cleaning up...");
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    console.log("=== SESSION VALID ===");
    return NextResponse.json({ valid: true, userId: session.userId });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
