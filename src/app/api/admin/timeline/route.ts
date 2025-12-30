import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { timelineEntries } from "../../../../../db/schema";
import { eq, asc } from "drizzle-orm";

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

// GET /api/admin/timeline - Get all timeline entries
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const entries = await db
      .select()
      .from(timelineEntries)
      .orderBy(asc(timelineEntries.orderIndex));

    const serializedEntries = entries.map(serializeDates);

    return NextResponse.json({
      success: true,
      data: serializedEntries,
    });
  } catch (error) {
    console.error("Error fetching timeline entries:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to fetch timeline entries",
      },
      { status: 500 },
    );
  }
}

// POST /api/admin/timeline - Create a new timeline entry
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { period, title, description, location, skills } = body;

    if (!period || !title || !description) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Period, title, and description are required",
        },
        { status: 400 },
      );
    }

    // Get the highest orderIndex to add at the end
    const existingEntries = await db
      .select({ orderIndex: timelineEntries.orderIndex })
      .from(timelineEntries)
      .orderBy(asc(timelineEntries.orderIndex));

    const maxOrderIndex =
      existingEntries.length > 0
        ? Math.max(...existingEntries.map((e) => e.orderIndex)) + 1
        : 0;

    const newEntry = await db
      .insert(timelineEntries)
      .values({
        period,
        title,
        description,
        location: location || null,
        skills: skills || null,
        orderIndex: maxOrderIndex,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: serializeDates(newEntry[0]),
      message: "Timeline entry created successfully",
    });
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to create timeline entry",
      },
      { status: 500 },
    );
  }
}

// PUT /api/admin/timeline - Update a timeline entry
export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { id, period, title, description, location, skills, orderIndex } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Entry ID is required" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (period !== undefined) updateData.period = period;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (skills !== undefined) updateData.skills = skills;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const updatedEntry = await db
      .update(timelineEntries)
      .set(updateData)
      .where(eq(timelineEntries.id, id))
      .returning();

    if (updatedEntry.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Timeline entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeDates(updatedEntry[0]),
      message: "Timeline entry updated successfully",
    });
  } catch (error) {
    console.error("Error updating timeline entry:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to update timeline entry",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/timeline - Delete a timeline entry
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Entry ID is required" },
        { status: 400 },
      );
    }

    const deletedEntry = await db
      .delete(timelineEntries)
      .where(eq(timelineEntries.id, id))
      .returning();

    if (deletedEntry.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Timeline entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Timeline entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timeline entry:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Failed to delete timeline entry",
      },
      { status: 500 },
    );
  }
}
