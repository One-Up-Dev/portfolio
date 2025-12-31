import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { siteSettings } from "../../../../db/schema";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

// GET /api/settings - Get public appearance settings (no auth required)
export async function GET() {
  try {
    const settings = await db.select().from(siteSettings);

    // Convert array of key-value pairs to object
    const settingsObject: Record<string, unknown> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    // Return only public-safe settings (appearance and content)
    return NextResponse.json({
      success: true,
      data: {
        // Appearance settings
        heroGifUrl: settingsObject.heroGifUrl || null,
        logoUrl: settingsObject.logoUrl || "/logo-oneup.png",
        // About page content
        aboutMyJourney: settingsObject.aboutMyJourney || null,
        aboutMyStory: settingsObject.aboutMyStory || null,
        aboutWhyDevelopment: settingsObject.aboutWhyDevelopment || null,
        aboutMySpecialties: settingsObject.aboutMySpecialties || null,
        aboutDateOfBirth: settingsObject.aboutDateOfBirth || null,
        // Home page content
        homeHeroPhrase: settingsObject.homeHeroPhrase || null,
        homeSpecialty1Title: settingsObject.homeSpecialty1Title || null,
        homeSpecialty1Description:
          settingsObject.homeSpecialty1Description || null,
        homeSpecialty2Title: settingsObject.homeSpecialty2Title || null,
        homeSpecialty2Description:
          settingsObject.homeSpecialty2Description || null,
        homeSpecialty3Title: settingsObject.homeSpecialty3Title || null,
        homeSpecialty3Description:
          settingsObject.homeSpecialty3Description || null,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Return defaults on error
    return NextResponse.json({
      success: true,
      data: {
        heroGifUrl: null,
        logoUrl: "/logo-oneup.png",
      },
    });
  }
}
