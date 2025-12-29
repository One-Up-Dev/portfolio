import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { projects, pageViews } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";

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

// GET - Get a single project by ID
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
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return NextResponse.json(
        { error: "Not Found", message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// PUT - Update a project
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

    // Check for slug conflict (if slug is being changed)
    if (body.slug && body.slug !== existing.slug) {
      const [slugConflict] = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, body.slug));

      if (slugConflict) {
        return NextResponse.json(
          { error: "Bad Request", message: "Ce slug existe déjà" },
          { status: 400 },
        );
      }
    }

    // Update the project
    const [updated] = await db
      .update(projects)
      .set({
        title: body.title ?? existing.title,
        slug: body.slug ?? existing.slug,
        shortDescription: body.shortDescription ?? existing.shortDescription,
        longDescription: body.longDescription ?? existing.longDescription,
        technologies: body.technologies ?? existing.technologies,
        githubUrl: body.githubUrl ?? existing.githubUrl,
        demoUrl: body.demoUrl ?? existing.demoUrl,
        status: body.status ?? existing.status,
        projectDate: body.projectDate ?? existing.projectDate,
        mainImageUrl: body.mainImageUrl ?? existing.mainImageUrl,
        galleryImages: body.galleryImages ?? existing.galleryImages,
        visible: body.visible ?? existing.visible,
        orderIndex: body.orderIndex ?? existing.orderIndex,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a project
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

    // Delete the project
    await db.delete(projects).where(eq(projects.id, id));

    // Clean up page views for this project
    const projectPath = `/projets/${existing.slug}`;
    await db.delete(pageViews).where(eq(pageViews.pagePath, projectPath));

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete project" },
      { status: 500 },
    );
  }
}

// PATCH - Update specific fields (like visibility)
export async function PATCH(
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

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.visible !== undefined) {
      updateData.visible = body.visible;
    }

    // Update the project
    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error patching project:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update project" },
      { status: 500 },
    );
  }
}
