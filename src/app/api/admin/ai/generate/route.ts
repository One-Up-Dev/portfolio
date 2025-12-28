import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Bad Request", message: "Prompt is required" },
        { status: 400 },
      );
    }

    // In demo mode, return a mock generated content
    const mockContent = `# Generated Content

This is demo-generated content based on your prompt: "${body.prompt}"

## Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Main Content
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Conclusion
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

---
*Note: This is demo content. Connect the Claude API for real AI generation.*`;

    return NextResponse.json({
      success: true,
      data: {
        content: mockContent,
        type: body.type || "article",
        tokensUsed: 250,
        model: "demo-mode",
      },
      message: "Content generated successfully (demo mode)",
    });
  } catch {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid request body" },
      { status: 400 },
    );
  }
}
