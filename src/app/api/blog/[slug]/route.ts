import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { blogPosts } from "../../../../../db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/blog/[slug] - Get a single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")));

    if (!post) {
      return NextResponse.json(
        { error: "Not Found", message: "Blog post not found" },
        { status: 404 },
      );
    }

    // Check if the post is scheduled for a future date
    if (post.publishedAt) {
      const publishDate = new Date(post.publishedAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      publishDate.setHours(0, 0, 0, 0);

      if (publishDate > today) {
        // Post is scheduled for a future date, treat as not found
        return NextResponse.json(
          { error: "Not Found", message: "Blog post not found" },
          { status: 404 },
        );
      }
    }

    // Increment view count
    await db
      .update(blogPosts)
      .set({ viewCount: post.viewCount + 1 })
      .where(eq(blogPosts.id, post.id));

    return NextResponse.json({
      success: true,
      data: { ...post, viewCount: post.viewCount + 1 },
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch blog post" },
      { status: 500 },
    );
  }
}
