import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../../db";
import { projects } from "../../../../../../../db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// PATCH - Toggle project visibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if project exists
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Project not found" },
        { status: 404 },
      );
    }

    // Update visibility
    const [updated] = await db
      .update(projects)
      .set({
        visible: body.visible ?? !existing.visible,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: updated.visible
        ? "Project is now visible"
        : "Project is now hidden",
    });
  } catch (error) {
    console.error("Error updating project visibility:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to update visibility",
      },
      { status: 500 },
    );
  }
}
