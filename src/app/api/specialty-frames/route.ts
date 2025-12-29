import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { specialtyFrames } from "../../../../db/schema";
import { asc } from "drizzle-orm";

// GET - Fetch all specialty frames (public endpoint)
export async function GET() {
  try {
    const frames = await db
      .select()
      .from(specialtyFrames)
      .orderBy(asc(specialtyFrames.orderIndex));

    return NextResponse.json({ success: true, data: frames });
  } catch (error) {
    console.error("Error fetching specialty frames:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
