import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { blogPosts, pageViews } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

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

// GET a single blog post by ID
export async function GET(
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
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    if (!post) {
      return NextResponse.json(
        { error: "Not Found", message: "Blog post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeDates(post),
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}

// PUT to update a blog post
export async function PUT(
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

    // Check if post exists
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Blog post not found" },
        { status: 404 },
      );
    }

    // Check if slug is being changed and if new slug already exists
    if (body.slug && body.slug !== existing.slug) {
      const [slugExists] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, body.slug));

      if (slugExists) {
        return NextResponse.json(
          {
            error: "Bad Request",
            message: "A blog post with this slug already exists",
          },
          { status: 400 },
        );
      }
    }

    // Use manual readTimeMinutes if provided, otherwise keep existing or calculate from content
    const readTimeMinutes =
      body.readTimeMinutes !== undefined
        ? body.readTimeMinutes
        : existing.readTimeMinutes;

    // Determine publishedAt
    let publishedAt = existing.publishedAt;
    if (body.status === "published" && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (body.status === "draft") {
      publishedAt = null;
    }

    // Update the post
    const [updated] = await db
      .update(blogPosts)
      .set({
        title: body.title || existing.title,
        slug: body.slug || existing.slug,
        excerpt: body.excerpt !== undefined ? body.excerpt : existing.excerpt,
        content: body.content !== undefined ? body.content : existing.content,
        coverImageUrl:
          body.coverImageUrl !== undefined
            ? body.coverImageUrl
            : existing.coverImageUrl,
        tags: body.tags !== undefined ? body.tags : existing.tags,
        status: body.status || existing.status,
        publishedAt,
        metaDescription:
          body.metaDescription !== undefined
            ? body.metaDescription
            : existing.metaDescription,
        metaKeywords:
          body.metaKeywords !== undefined
            ? body.metaKeywords
            : existing.metaKeywords,
        readTimeMinutes,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: serializeDates(updated),
      message: "Blog post updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update blog post" },
      { status: 500 },
    );
  }
}

// DELETE a blog post
export async function DELETE(
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

    // Check if post exists
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Blog post not found" },
        { status: 404 },
      );
    }

    // Delete the post
    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    // Clean up page views for this blog post
    const blogPath = `/blog/${existing.slug}`;
    await db.delete(pageViews).where(eq(pageViews.pagePath, blogPath));

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to delete blog post" },
      { status: 500 },
    );
  }
}

// PATCH for status updates (publish/unpublish)
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

    // Check if post exists
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));

    if (!existing) {
      return NextResponse.json(
        { error: "Not Found", message: "Blog post not found" },
        { status: 404 },
      );
    }

    // Handle status toggle
    if (body.status !== undefined) {
      let publishedAt = existing.publishedAt;
      if (body.status === "published" && !existing.publishedAt) {
        publishedAt = new Date();
      } else if (body.status === "draft") {
        publishedAt = null;
      }

      const [updated] = await db
        .update(blogPosts)
        .set({
          status: body.status,
          publishedAt,
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        data: serializeDates(updated),
        message:
          body.status === "published"
            ? "Article publié avec succès!"
            : "Article mis en brouillon",
      });
    }

    return NextResponse.json(
      { error: "Bad Request", message: "No valid fields to update" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error patching blog post:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update blog post" },
      { status: 500 },
    );
  }
}
