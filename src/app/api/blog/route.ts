import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { blogPosts } from "../../../../db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/blog - List all published blog posts
export async function GET() {
  try {
    const publishedPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    return NextResponse.json({
      success: true,
      data: publishedPosts,
      total: publishedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}
