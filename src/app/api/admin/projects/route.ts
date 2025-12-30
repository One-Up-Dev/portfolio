import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { projects } from "../../../../../db/schema";
import { eq, desc } from "drizzle-orm";

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

    const serializedProjects = allProjects.map(serializeDates);

    return NextResponse.json({
      success: true,
      data: serializedProjects,
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

    // Validate required fields - match client-side validation
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Bad Request", message: "Title is required" },
        { status: 400 },
      );
    }

    // Validate title length (min 3, max 100) - matches client-side
    const trimmedTitle = body.title.trim();
    if (trimmedTitle.length < 3) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Title must be at least 3 characters",
        },
        { status: 400 },
      );
    }
    if (trimmedTitle.length > 100) {
      return NextResponse.json(
        { error: "Bad Request", message: "Title cannot exceed 100 characters" },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    const slug =
      body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Validate slug format if provided - matches client-side
    if (body.slug && !/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message:
            "Slug can only contain lowercase letters, numbers, and hyphens",
        },
        { status: 400 },
      );
    }

    // Validate URLs if provided - matches client-side
    const isValidUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    };

    if (body.githubUrl && !isValidUrl(body.githubUrl)) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid GitHub URL" },
        { status: 400 },
      );
    }

    if (body.demoUrl && !isValidUrl(body.demoUrl)) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid demo URL" },
        { status: 400 },
      );
    }

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
        data: serializeDates(newProject),
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
