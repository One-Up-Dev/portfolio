import { NextRequest, NextResponse } from "next/server";

// Demo blog posts data
const demoBlogPosts = [
  {
    id: "1",
    slug: "guide-n8n-debutants",
    title: "Guide n8n pour débutants",
    excerpt: "Découvrez comment automatiser vos workflows avec n8n.",
    content: "<p>Contenu complet du guide n8n...</p>",
    coverImageUrl: null,
    tags: ["n8n", "automatisation", "tutoriel"],
    status: "published",
    publishedAt: "2024-12-15T10:00:00Z",
    metaDescription: "Guide complet pour débuter avec n8n",
    metaKeywords: "n8n, automatisation, workflow",
    readTimeMinutes: 8,
    viewCount: 567,
    createdAt: "2024-12-10T09:00:00Z",
    updatedAt: "2024-12-15T10:00:00Z",
  },
  {
    id: "2",
    slug: "automatisation-claude",
    title: "Automatisation avec Claude",
    excerpt: "Comment utiliser Claude pour automatiser votre développement.",
    content: "<p>Contenu sur l'automatisation avec Claude...</p>",
    coverImageUrl: null,
    tags: ["claude", "ia", "productivité"],
    status: "published",
    publishedAt: "2024-12-10T14:00:00Z",
    metaDescription: "Automatisez votre développement avec Claude",
    metaKeywords: "claude, ia, automatisation",
    readTimeMinutes: 6,
    viewCount: 423,
    createdAt: "2024-12-08T11:00:00Z",
    updatedAt: "2024-12-10T14:00:00Z",
  },
  {
    id: "3",
    slug: "vibe-coding-explique",
    title: "Vibe Coding expliqué",
    excerpt: "Qu'est-ce que le vibe coding et pourquoi l'adopter ?",
    content: "<p>Explication du vibe coding...</p>",
    coverImageUrl: null,
    tags: ["vibe-coding", "philosophie", "développement"],
    status: "published",
    publishedAt: "2024-12-05T16:00:00Z",
    metaDescription: "Comprendre le vibe coding",
    metaKeywords: "vibe coding, développement, philosophie",
    readTimeMinutes: 5,
    viewCount: 312,
    createdAt: "2024-12-03T10:00:00Z",
    updatedAt: "2024-12-05T16:00:00Z",
  },
];

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

  return NextResponse.json({
    success: true,
    data: demoBlogPosts,
    total: demoBlogPosts.length,
  });
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

    if (!body.title) {
      return NextResponse.json(
        { error: "Bad Request", message: "Title is required" },
        { status: 400 },
      );
    }

    const newPost = {
      id: String(Date.now()),
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      title: body.title,
      excerpt: body.excerpt || "",
      content: body.content || "",
      coverImageUrl: body.coverImageUrl || null,
      tags: body.tags || [],
      status: body.status || "draft",
      publishedAt:
        body.status === "published" ? new Date().toISOString() : null,
      metaDescription: body.metaDescription || "",
      metaKeywords: body.metaKeywords || "",
      readTimeMinutes: Math.ceil((body.content?.length || 0) / 1000),
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newPost,
        message: "Blog post created successfully (demo mode)",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid request body" },
      { status: 400 },
    );
  }
}
