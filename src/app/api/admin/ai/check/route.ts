import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { siteSettings } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// GET /api/admin/ai/check - Check if Claude API key is configured
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "claudeApiKey"))
      .limit(1);

    const apiKey = result.length > 0 ? (result[0].value as string) : null;

    // Diagnostic info (without exposing the full key)
    const diagnostic = {
      keyExists: !!apiKey,
      keyLength: apiKey?.length || 0,
      startsWithSkAnt: apiKey?.startsWith("sk-ant-") || false,
      keyPreview: apiKey
        ? `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`
        : null,
      isValid: !!(apiKey && apiKey.startsWith("sk-ant-") && apiKey.length > 50),
    };

    return NextResponse.json({
      success: true,
      data: diagnostic,
      message: diagnostic.isValid
        ? "✅ Clé API Claude configurée et valide"
        : "❌ Clé API Claude non configurée ou invalide",
    });
  } catch (error) {
    console.error("Error checking API key:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to check API key" },
      { status: 500 },
    );
  }
}
