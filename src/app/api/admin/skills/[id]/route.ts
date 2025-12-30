import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { skills } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";

// Helper function to serialize dates to ISO strings
function serializeDates<T extends Record<string, unknown>>(obj: T): T {
  const serialized = { ...obj };
  for (const key in serialized) {
    if (serialized[key] instanceof Date) {
      serialized[key] = (
        serialized[key] as Date
      ).toISOString() as T[typeof key];
    }
  }
  return serialized;
}

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

// GET /api/admin/skills/[id] - Get a single skill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));

    if (!skill) {
      return NextResponse.json(
        { error: "Not Found", message: "Skill not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeDates(skill),
    });
  } catch (error) {
    console.error("Error fetching skill:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch skill" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/skills/[id] - Update a skill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if skill exists
    const [existing] = await db.select().from(skills).where(eq(skills.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Skill not found" },
        { status: 404 },
      );
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = ["frontend", "backend", "outils", "soft_skills"];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: "Bad Request", message: "Invalid category" },
          { status: 400 },
        );
      }
    }

    // Update skill
    const [updatedSkill] = await db
      .update(skills)
      .set({
        name: body.name ?? existing.name,
        category: body.category ?? existing.category,
        iconUrl: body.iconUrl ?? body.icon ?? existing.iconUrl,
        orderIndex: body.orderIndex ?? existing.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: serializeDates(updatedSkill),
      message: "Skill updated successfully",
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update skill" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/skills/[id] - Delete a skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;

    // Check if skill exists
    const [existing] = await db.select().from(skills).where(eq(skills.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Skill not found" },
        { status: 404 },
      );
    }

    // Delete skill
    await db.delete(skills).where(eq(skills.id, id));

    return NextResponse.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete skill" },
      { status: 500 },
    );
  }
}
