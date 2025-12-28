import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Demo projects data
const demoProjects = [
  {
    id: "1",
    slug: "portfolio-oneup",
    title: "Portfolio ONEUP",
    shortDescription: "Portfolio personnel avec thème rétro gaming",
    longDescription:
      "Un portfolio moderne avec une esthétique rétro gaming, développé avec Next.js 14 et Tailwind CSS.",
    technologies: ["Next.js", "TypeScript", "Tailwind"],
    githubUrl: "https://github.com/oneup/portfolio",
    demoUrl: "https://oneup.dev",
    status: "termine",
    projectDate: "2024-12-01",
    mainImageUrl: null,
    galleryImages: [],
    visible: true,
    viewCount: 342,
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-28T14:00:00Z",
  },
  {
    id: "2",
    slug: "app-gestion",
    title: "App de gestion",
    shortDescription: "Application de gestion de projets",
    longDescription:
      "Une application complète de gestion de projets avec React et Node.js.",
    technologies: ["React", "Node.js", "PostgreSQL"],
    githubUrl: "https://github.com/oneup/gestion-app",
    demoUrl: null,
    status: "en_cours",
    projectDate: "2024-11-15",
    mainImageUrl: null,
    galleryImages: [],
    visible: true,
    viewCount: 256,
    createdAt: "2024-11-15T09:00:00Z",
    updatedAt: "2024-12-20T16:30:00Z",
  },
  {
    id: "3",
    slug: "bot-discord",
    title: "Bot Discord",
    shortDescription: "Bot Discord multifonctions",
    longDescription:
      "Un bot Discord avec commandes personnalisées pour la modération et le divertissement.",
    technologies: ["Python", "Discord.py"],
    githubUrl: "https://github.com/oneup/discord-bot",
    demoUrl: null,
    status: "termine",
    projectDate: "2024-10-01",
    mainImageUrl: null,
    galleryImages: [],
    visible: true,
    viewCount: 189,
    createdAt: "2024-10-01T08:00:00Z",
    updatedAt: "2024-10-15T12:00:00Z",
  },
];

// Check if the request has a valid admin session (demo mode uses cookies)
function isAuthenticated(request: NextRequest): boolean {
  // In demo mode, we check for a session cookie or auth header
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("admin_session");

  // For demo purposes, accept any Bearer token or session cookie
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
    data: demoProjects,
    total: demoProjects.length,
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

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Bad Request", message: "Title is required" },
        { status: 400 },
      );
    }

    // Create new project (demo mode - not persisted)
    const newProject = {
      id: String(Date.now()),
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      title: body.title,
      shortDescription: body.shortDescription || "",
      longDescription: body.longDescription || "",
      technologies: body.technologies || [],
      githubUrl: body.githubUrl || null,
      demoUrl: body.demoUrl || null,
      status: body.status || "en_cours",
      projectDate: body.projectDate || new Date().toISOString().split("T")[0],
      mainImageUrl: body.mainImageUrl || null,
      galleryImages: body.galleryImages || [],
      visible: body.visible ?? true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: newProject,
        message: "Project created successfully (demo mode)",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid request body" },
      { status: 400 },
    );
  }
}
