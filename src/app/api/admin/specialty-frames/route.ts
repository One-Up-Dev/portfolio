import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { specialtyFrames } from "../../../../../db/schema";
import { eq, asc } from "drizzle-orm";

// Check admin authentication (matching timeline route auth)
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

// GET - Fetch all specialty frames
export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 },
      );
    }

    const frames = await db
      .select()
      .from(specialtyFrames)
      .orderBy(asc(specialtyFrames.orderIndex));

    return NextResponse.json({ success: true, data: frames });
  } catch (error) {
    console.error("Error fetching specialty frames:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}

// POST - Create a new specialty frame
export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { title, description, icon } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Titre et description requis" },
        { status: 400 },
      );
    }

    // Get the next order index
    const existingFrames = await db.select().from(specialtyFrames);
    const nextOrderIndex = existingFrames.length;

    const [newFrame] = await db
      .insert(specialtyFrames)
      .values({
        title,
        description,
        icon: icon || "⚡",
        orderIndex: nextOrderIndex,
      })
      .returning();

    return NextResponse.json({ success: true, data: newFrame });
  } catch (error) {
    console.error("Error creating specialty frame:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}

// PUT - Update a specialty frame
export async function PUT(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id, title, description, icon, orderIndex } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID requis" },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    const [updatedFrame] = await db
      .update(specialtyFrames)
      .set(updateData)
      .where(eq(specialtyFrames.id, id))
      .returning();

    if (!updatedFrame) {
      return NextResponse.json(
        { success: false, message: "Frame non trouvée" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: updatedFrame });
  } catch (error) {
    console.error("Error updating specialty frame:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a specialty frame
export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID requis" },
        { status: 400 },
      );
    }

    const [deletedFrame] = await db
      .delete(specialtyFrames)
      .where(eq(specialtyFrames.id, id))
      .returning();

    if (!deletedFrame) {
      return NextResponse.json(
        { success: false, message: "Frame non trouvée" },
        { status: 404 },
      );
    }

    // Reorder remaining frames
    const remainingFrames = await db
      .select()
      .from(specialtyFrames)
      .orderBy(asc(specialtyFrames.orderIndex));

    for (let i = 0; i < remainingFrames.length; i++) {
      await db
        .update(specialtyFrames)
        .set({ orderIndex: i })
        .where(eq(specialtyFrames.id, remainingFrames[i].id));
    }

    return NextResponse.json({ success: true, data: deletedFrame });
  } catch (error) {
    console.error("Error deleting specialty frame:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
