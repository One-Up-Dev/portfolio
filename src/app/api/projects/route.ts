import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db";
import { projects } from "../../../../db/schema";
import { eq, desc, asc } from "drizzle-orm";

// GET /api/projects - List all visible projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt or projectDate
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc or desc

    // Determine sort column
    const sortColumn =
      sortBy === "projectDate" ? projects.projectDate : projects.createdAt;

    // Determine sort direction
    const orderFn = sortOrder === "asc" ? asc : desc;

    const visibleProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.visible, true))
      .orderBy(orderFn(sortColumn));

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
