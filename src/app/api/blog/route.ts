import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../db";
import { blogPosts } from "../../../../db/schema";
import { eq, desc, and, or, sql } from "drizzle-orm";

// GET /api/blog - List all published blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag"); // tag filter
    const search = searchParams.get("search") || searchParams.get("q"); // search query
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Build where conditions
    const conditions = [eq(blogPosts.status, "published")];

    // Add search filter if provided (case-insensitive)
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${blogPosts.title}) LIKE ${searchLower}`,
          sql`LOWER(${blogPosts.excerpt}) LIKE ${searchLower}`,
        )!,
      );
    }

    // Fetch posts
    let publishedPosts = await db
      .select()
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.publishedAt));

    // Filter by tag if provided (JSON array search)
    if (tag) {
      publishedPosts = publishedPosts.filter((post) => {
        const tags = post.tags as string[] | null;
        return tags && tags.includes(tag);
      });
    }

    // Calculate pagination
    const total = publishedPosts.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPosts = publishedPosts.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filters: {
        tag: tag || null,
        search: search || null,
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch blog posts" },
      { status: 500 },
    );
  }
}
