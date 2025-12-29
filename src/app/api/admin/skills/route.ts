import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { skills } from "../../../../../db/schema";
import { eq, asc } from "drizzle-orm";

// Check if the request has a valid admin session
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("admin_session");

  if (authHeader?.startsWith("Bearer ") && authHeader.length > 10) {
    return true;
  }

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.isAuthenticated && session.expiresAt > Date.now()) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

// GET /api/admin/skills - List all skills grouped by category
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

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
      all: allSkills,
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

// POST /api/admin/skills - Create a new skill
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Bad Request", message: "Name is required" },
        { status: 400 },
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: "Bad Request", message: "Category is required" },
        { status: 400 },
      );
    }

    const validCategories = ["frontend", "backend", "outils", "soft_skills"];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid category" },
        { status: 400 },
      );
    }

    // Get the max orderIndex for this category
    const existingSkills = await db
      .select()
      .from(skills)
      .where(eq(skills.category, body.category))
      .orderBy(asc(skills.orderIndex));

    const maxOrderIndex =
      existingSkills.length > 0
        ? Math.max(...existingSkills.map((s) => s.orderIndex || 0)) + 1
        : 0;

    // Create new skill in database
    const [newSkill] = await db
      .insert(skills)
      .values({
        name: body.name,
        category: body.category,
        iconUrl: body.iconUrl || body.icon || null,
        orderIndex: body.orderIndex ?? maxOrderIndex,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newSkill,
        message: "Skill created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create skill" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/skills - Reorder skills or update proficiency (bulk update)
export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    // Expecting an array of { id, orderIndex, proficiency? } objects
    if (!Array.isArray(body.skills)) {
      return NextResponse.json(
        { error: "Bad Request", message: "Skills array is required" },
        { status: 400 },
      );
    }

    // Update each skill's orderIndex and/or proficiency
    for (const skillUpdate of body.skills) {
      if (skillUpdate.id) {
        const updateData: {
          orderIndex?: number;
          proficiency?: number;
          updatedAt: string;
        } = {
          updatedAt: new Date().toISOString(),
        };

        if (typeof skillUpdate.orderIndex === "number") {
          updateData.orderIndex = skillUpdate.orderIndex;
        }

        if (typeof skillUpdate.proficiency === "number") {
          // Clamp proficiency between 0 and 100
          updateData.proficiency = Math.max(
            0,
            Math.min(100, skillUpdate.proficiency),
          );
        }

        await db
          .update(skills)
          .set(updateData)
          .where(eq(skills.id, skillUpdate.id));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Skills updated successfully",
    });
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update skills" },
      { status: 500 },
    );
  }
}
