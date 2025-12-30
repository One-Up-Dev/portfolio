import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { blogPosts } from "../../../../../db/schema";
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
    const allPosts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));

    const serializedPosts = allPosts.map(serializeDates);

    return NextResponse.json({
      success: true,
      data: serializedPosts,
      total: allPosts.length,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch blog posts" },
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

    // Validate title length (min 3, max 200) - matches client-side
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
    if (trimmedTitle.length > 200) {
      return NextResponse.json(
        { error: "Bad Request", message: "Title cannot exceed 200 characters" },
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

    // Check if slug already exists
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug));

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A blog post with this slug already exists",
        },
        { status: 400 },
      );
    }

    // Calculate read time (approx 200 words per minute, 5 chars per word)
    const contentLength = body.content?.length || 0;
    const readTimeMinutes = Math.max(1, Math.ceil(contentLength / 1000));

    // Determine publishedAt date
    // If status is published and publishedAt is provided, use it
    // If status is published and no publishedAt, use current date
    // If status is draft, set to null
    let publishedAt: Date | null = null;
    if (body.status === "published") {
      if (body.publishedAt) {
        // Use provided date (for scheduled posts)
        publishedAt = new Date(body.publishedAt);
      } else {
        // Default to current date
        publishedAt = new Date();
      }
    }

    // Create new blog post in database
    const [newPost] = await db
      .insert(blogPosts)
      .values({
        slug,
        title: body.title,
        excerpt: body.excerpt || null,
        content: body.content || null,
        coverImageUrl: body.coverImageUrl || null,
        tags: body.tags || [],
        status: body.status || "draft",
        publishedAt,
        metaDescription: body.metaDescription || null,
        metaKeywords: body.metaKeywords || null,
        readTimeMinutes,
        viewCount: 0,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: serializeDates(newPost),
        message: "Blog post created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create blog post" },
      { status: 500 },
    );
  }
}
