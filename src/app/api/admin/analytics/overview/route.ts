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

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  // Demo analytics data
  const analyticsData = {
    totalVisitors: 1247,
    visitorsThisMonth: 423,
    visitorsChange: 15,
    totalPageViews: 3456,
    pageViewsThisMonth: 1234,
    topPages: [
      { path: "/", views: 567 },
      { path: "/projets", views: 345 },
      { path: "/blog", views: 234 },
      { path: "/a-propos", views: 189 },
      { path: "/contact", views: 123 },
    ],
    topProjects: [
      { title: "Portfolio ONEUP", views: 342 },
      { title: "App de gestion", views: 256 },
      { title: "Bot Discord", views: 189 },
    ],
    topArticles: [
      { title: "Guide n8n pour débutants", views: 567 },
      { title: "Automatisation avec Claude", views: 423 },
      { title: "Vibe Coding expliqué", views: 312 },
    ],
    trafficSources: [
      { source: "Direct", visits: 456, percentage: 45 },
      { source: "Google", visits: 312, percentage: 31 },
      { source: "LinkedIn", visits: 156, percentage: 15 },
      { source: "GitHub", visits: 89, percentage: 9 },
    ],
  };

  return NextResponse.json({
    success: true,
    data: analyticsData,
  });
}
