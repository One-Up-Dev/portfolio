import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { siteSettings } from "../../../../db/schema";

// GET /api/settings - Get public appearance settings (no auth required)
export async function GET() {
  try {
    const settings = await db.select().from(siteSettings);

    // Convert array of key-value pairs to object
    const settingsObject: Record<string, unknown> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Return only public-safe settings
    return NextResponse.json({
      success: true,
      data: {
        heroGifUrl: settingsObject.heroGifUrl || "/images/miyazaki-nature.gif",
        logoUrl: settingsObject.logoUrl || "/logo-oneup.png",
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults on error
    return NextResponse.json({
      success: true,
      data: {
        heroGifUrl: "/images/miyazaki-nature.gif",
        logoUrl: "/logo-oneup.png",
      },
    });
  }
}
