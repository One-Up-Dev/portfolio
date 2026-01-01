import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { siteSettings } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { adminSessions } from "../../../../../db/schema";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Helper to validate session
async function validateSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return null;

  const sessions = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.token, token));

  if (sessions.length === 0) return null;

  const session = sessions[0];
  if (new Date(session.expiresAt) < new Date()) return null;

  return session;
}

// Helper to get setting value
async function getSetting(key: string): Promise<string | null> {
  const results = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key));
  return results.length > 0 ? (results[0].value as string) : null;
}

// Helper to set setting value
async function setSetting(key: string, value: string) {
  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key));

  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, currentPassword, newPassword, newEmail } = body;

    // Get current credentials from database (or defaults)
    const storedPassword =
      (await getSetting("adminPassword")) ||
      process.env.ADMIN_PASSWORD ||
      "Admin123!";

    if (action === "changePassword") {
      // Validate current password
      if (currentPassword !== storedPassword) {
        return NextResponse.json(
          { error: "Mot de passe actuel incorrect" },
          { status: 400 },
        );
      }

      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          {
            error:
              "Le nouveau mot de passe doit contenir au moins 8 caractères",
          },
          { status: 400 },
        );
      }

      // Save new password to database
      await setSetting("adminPassword", newPassword);

      return NextResponse.json({
        success: true,
        message: "Mot de passe mis à jour avec succès",
      });
    }

    if (action === "changeEmail") {
      // Validate current password for security
      if (currentPassword !== storedPassword) {
        return NextResponse.json(
          { error: "Mot de passe incorrect" },
          { status: 400 },
        );
      }

      // Validate new email
      if (!newEmail || !newEmail.includes("@")) {
        return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      }

      // Save new email to database
      await setSetting("adminEmail", newEmail);

      return NextResponse.json({
        success: true,
        message: "Email mis à jour avec succès",
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET to retrieve current email (not password)
export async function GET() {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = (await getSetting("adminEmail")) || "admin@oneup.dev";

    return NextResponse.json({
      success: true,
      data: { email },
    });
  } catch (error) {
    console.error("Error getting account:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
