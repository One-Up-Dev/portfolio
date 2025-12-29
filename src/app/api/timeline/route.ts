import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { timelineEntries } from "../../../../db/schema";
import { asc } from "drizzle-orm";

// GET /api/timeline - Get all timeline entries (public)
export async function GET() {
  try {
    const entries = await db
      .select()
      .from(timelineEntries)
      .orderBy(asc(timelineEntries.orderIndex));

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching timeline entries:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch timeline entries",
      },
      { status: 500 },
    );
  }
}
