import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { pageViews, projects, blogPosts } from "../../../../../../db/schema";
import { desc } from "drizzle-orm";

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
    // Get this month's start date
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total page views
    const allPageViews = await db.select().from(pageViews);
    const totalPageViews = allPageViews.length;

    // Get unique visitors (by session_id or ip_hash)
    const uniqueVisitors = new Set(
      allPageViews.map((pv) => pv.sessionId || pv.ipHash || pv.id),
    );
    const totalVisitors = uniqueVisitors.size;

    // Get this month's page views
    const thisMonthViews = allPageViews.filter((pv) => {
      const viewDate = new Date(pv.viewedAt);
      return viewDate >= thisMonthStart;
    });
    const pageViewsThisMonth = thisMonthViews.length;

    // Get unique visitors this month
    const thisMonthVisitors = new Set(
      thisMonthViews.map((pv) => pv.sessionId || pv.ipHash || pv.id),
    );
    const visitorsThisMonth = thisMonthVisitors.size;

    // Get last month's views for comparison
    const lastMonthViews = allPageViews.filter((pv) => {
      const viewDate = new Date(pv.viewedAt);
      return viewDate >= lastMonthStart && viewDate <= lastMonthEnd;
    });
    const lastMonthVisitors = new Set(
      lastMonthViews.map((pv) => pv.sessionId || pv.ipHash || pv.id),
    ).size;

    // Calculate visitor change percentage
    const visitorsChange =
      lastMonthVisitors > 0
        ? Math.round(
            ((visitorsThisMonth - lastMonthVisitors) / lastMonthVisitors) * 100,
          )
        : 0;

    // Group page views by path
    const pageViewsByPath: Record<string, number> = {};
    allPageViews.forEach((pv) => {
      const path = pv.pagePath || "/";
      pageViewsByPath[path] = (pageViewsByPath[path] || 0) + 1;
    });

    // Get top pages
    const topPages = Object.entries(pageViewsByPath)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Get top projects by view count from projects table
    const allProjects = await db
      .select({
        title: projects.title,
        viewCount: projects.viewCount,
      })
      .from(projects)
      .orderBy(desc(projects.viewCount))
      .limit(5);

    const topProjects = allProjects.map((p) => ({
      title: p.title,
      views: p.viewCount,
    }));

    // Get top articles by view count from blogPosts table
    const allBlogPosts = await db
      .select({
        title: blogPosts.title,
        viewCount: blogPosts.viewCount,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.viewCount))
      .limit(5);

    const topArticles = allBlogPosts.map((p) => ({
      title: p.title,
      views: p.viewCount,
    }));

    // Group by referrer for traffic sources
    const referrerCounts: Record<string, number> = {};
    allPageViews.forEach((pv) => {
      let source = "Direct";
      if (pv.referrer) {
        try {
          const url = new URL(pv.referrer);
          if (url.hostname.includes("google")) source = "Google";
          else if (url.hostname.includes("linkedin")) source = "LinkedIn";
          else if (url.hostname.includes("github")) source = "GitHub";
          else if (
            url.hostname.includes("twitter") ||
            url.hostname.includes("x.com")
          )
            source = "Twitter";
          else source = url.hostname;
        } catch {
          source = pv.referrer.substring(0, 30);
        }
      }
      referrerCounts[source] = (referrerCounts[source] || 0) + 1;
    });

    const totalReferrerVisits = Object.values(referrerCounts).reduce(
      (a, b) => a + b,
      0,
    );
    const trafficSources = Object.entries(referrerCounts)
      .map(([source, visits]) => ({
        source,
        visits,
        percentage:
          totalReferrerVisits > 0
            ? Math.round((visits / totalReferrerVisits) * 100)
            : 0,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    const analyticsData = {
      totalVisitors,
      visitorsThisMonth,
      visitorsChange,
      totalPageViews,
      pageViewsThisMonth,
      topPages,
      topProjects,
      topArticles,
      trafficSources,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
