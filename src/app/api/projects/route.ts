import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db";
import { projects } from "../../../../db/schema";
import { eq, desc, asc, and, like, or, sql } from "drizzle-orm";

// GET /api/projects - List all visible projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // createdAt or projectDate
    const sortOrder = searchParams.get("sortOrder") || "desc"; // asc or desc
    const technology =
      searchParams.get("technology") || searchParams.get("tech"); // technology filter
    const search = searchParams.get("search") || searchParams.get("q"); // search query

    // Determine sort column
    const sortColumn =
      sortBy === "projectDate" ? projects.projectDate : projects.createdAt;

    // Determine sort direction
    const orderFn = sortOrder === "asc" ? asc : desc;

    // Build where conditions
    const conditions = [eq(projects.visible, true)];

    // Add search filter if provided (case-insensitive)
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${projects.title}) LIKE ${searchLower}`,
          sql`LOWER(${projects.shortDescription}) LIKE ${searchLower}`,
        )!,
      );
    }

    // Fetch projects
    let visibleProjects = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(orderFn(sortColumn));

    // Filter by technology if provided (JSON array search)
    if (technology) {
      visibleProjects = visibleProjects.filter((project) => {
        const techs = project.technologies as string[] | null;
        return techs && techs.includes(technology);
      });
    }

    return NextResponse.json({
      success: true,
      data: visibleProjects,
      total: visibleProjects.length,
      filters: {
        technology: technology || null,
        search: search || null,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
