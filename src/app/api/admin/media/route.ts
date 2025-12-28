import { NextRequest, NextResponse } from "next/server";

// Demo media data
const demoMedia = [
  {
    id: "1",
    filename: "portfolio-hero.jpg",
    originalFilename: "portfolio-hero.jpg",
    url: "/images/demo/portfolio-hero.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 245000,
    width: 1920,
    height: 1080,
    altText: "Portfolio hero image",
    createdAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    filename: "project-screenshot.png",
    originalFilename: "project-screenshot.png",
    url: "/images/demo/project-screenshot.png",
    mimeType: "image/png",
    sizeBytes: 180000,
    width: 1280,
    height: 720,
    altText: "Project screenshot",
    createdAt: "2024-12-05T14:00:00Z",
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
    data: demoMedia,
    total: demoMedia.length,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  // In demo mode, we just return a mock response
  return NextResponse.json(
    {
      success: true,
      data: {
        id: String(Date.now()),
        filename: "uploaded-file.jpg",
        originalFilename: "uploaded-file.jpg",
        url: "/images/demo/uploaded-file.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 100000,
        width: 800,
        height: 600,
        altText: "",
        createdAt: new Date().toISOString(),
      },
      message: "File uploaded successfully (demo mode)",
    },
    { status: 201 },
  );
}
