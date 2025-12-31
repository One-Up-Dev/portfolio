import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../../db";
import { projects } from "../../../../../../../db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// POST - Duplicate a project
export async function POST(
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

    // Get the original project
    const [original] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!original) {
      return NextResponse.json(
        { error: "Not Found", message: "Project not found" },
        { status: 404 },
      );
    }

    // Generate new slug with timestamp
    const newSlug = `${original.slug}-copie-${Date.now()}`;

    // Create the duplicate
    const [duplicate] = await db
      .insert(projects)
      .values({
        slug: newSlug,
        title: `${original.title} (Copie)`,
        shortDescription: original.shortDescription,
        longDescription: original.longDescription,
        technologies: original.technologies,
        githubUrl: original.githubUrl,
        demoUrl: original.demoUrl,
        status: original.status,
        projectDate: original.projectDate,
        mainImageUrl: original.mainImageUrl,
        galleryImages: original.galleryImages,
        visible: false, // Start as hidden
        viewCount: 0,
        orderIndex: original.orderIndex,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: duplicate,
      message: "Project duplicated successfully",
    });
  } catch (error) {
    console.error("Error duplicating project:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to duplicate project",
      },
      { status: 500 },
    );
  }
}
