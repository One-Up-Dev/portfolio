import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { projects } from "../../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET /api/projects - List all visible projects
export async function GET() {
  try {
    const visibleProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.visible, true))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json({
      success: true,
      data: visibleProjects,
      total: visibleProjects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
