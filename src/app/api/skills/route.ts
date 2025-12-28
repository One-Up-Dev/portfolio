import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { skills } from "../../../../db/schema";
import { asc } from "drizzle-orm";

// GET /api/skills - List all skills grouped by category
export async function GET() {
  try {
    const allSkills = await db
      .select()
      .from(skills)
      .orderBy(asc(skills.orderIndex));

    // Group skills by category
    const groupedSkills = allSkills.reduce(
      (acc, skill) => {
        const category = skill.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      },
      {} as Record<string, typeof allSkills>,
    );

    return NextResponse.json({
      success: true,
      data: groupedSkills,
      total: allSkills.length,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch skills" },
      { status: 500 },
    );
  }
}
