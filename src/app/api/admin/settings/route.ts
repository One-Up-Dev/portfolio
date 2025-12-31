import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { siteSettings } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// GET /api/admin/settings - Get all settings
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const settings = await db.select().from(siteSettings);

    // Convert array of key-value pairs to object
    const settingsObject: Record<string, unknown> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return NextResponse.json({
      success: true,
      data: settingsObject,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/settings - Update a setting
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Bad Request", message: "Setting key is required" },
        { status: 400 },
      );
    }

    // Check if setting exists
    const existing = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      // Update existing setting
      await db
        .update(siteSettings)
        .set({
          value: value,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, key));
    } else {
      // Insert new setting
      await db.insert(siteSettings).values({
        key,
        value,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Setting updated successfully",
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update setting" },
      { status: 500 },
    );
  }
}
