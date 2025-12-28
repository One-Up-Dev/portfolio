import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { projects } from "../../../../../db/schema";
import { eq, desc } from "drizzle-orm";

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

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    return NextResponse.json({
      success: true,
      data: allProjects,
      total: allProjects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

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
    if (!body.title) {
      return NextResponse.json(
        { error: "Bad Request", message: "Title is required" },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    const slug =
      body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if slug already exists
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug));

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A project with this slug already exists",
        },
        { status: 400 },
      );
    }

    // Create new project in database
    const [newProject] = await db
      .insert(projects)
      .values({
        slug,
        title: body.title,
        shortDescription: body.shortDescription || null,
        longDescription: body.longDescription || null,
        technologies: body.technologies || [],
        githubUrl: body.githubUrl || null,
        demoUrl: body.demoUrl || null,
        status: body.status || "en_cours",
        projectDate: body.projectDate || new Date().toISOString().split("T")[0],
        mainImageUrl: body.mainImageUrl || null,
        galleryImages: body.galleryImages || [],
        visible: body.visible ?? true,
        viewCount: 0,
        orderIndex: body.orderIndex || 0,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newProject,
        message: "Project created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create project" },
      { status: 500 },
    );
  }
}
