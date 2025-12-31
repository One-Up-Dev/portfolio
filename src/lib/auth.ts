import { NextRequest } from "next/server";
import { db } from "../../db";
import { adminSessions } from "../../db/schema";
import { eq, and, gte } from "drizzle-orm";

/**
 * Validates the admin session from the request cookie.
 * Returns true if the session is valid, false otherwise.
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("admin_session");

  if (!sessionCookie?.value) {
    return false;
  }

  const token = sessionCookie.value;

  try {
    const session = await db.query.adminSessions.findFirst({
      where: and(
        eq(adminSessions.token, token),
        gte(adminSessions.expiresAt, new Date()),
      ),
    });

    return !!session;
  } catch (error) {
    console.error("Auth validation error:", error);
    return false;
  }
}
