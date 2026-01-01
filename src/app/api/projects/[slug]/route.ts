import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { projects } from "../../../../../db/schema";
import { eq, and } from "drizzle-orm";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

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

// GET /api/projects/[slug] - Get a single project by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.visible, true)));

    if (!project) {
      return NextResponse.json(
        { error: "Not Found", message: "Project not found" },
        { status: 404 },
      );
    }

    // Increment view count
    await db
      .update(projects)
      .set({ viewCount: project.viewCount + 1 })
      .where(eq(projects.id, project.id));

    return NextResponse.json({
      success: true,
      data: serializeDates({ ...project, viewCount: project.viewCount + 1 }),
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch project" },
      { status: 500 },
    );
  }
}
