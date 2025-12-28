import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { mediaLibrary } from "../../../../../db/schema";
import { desc, eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// File extension to MIME type mapping
const EXTENSION_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

// Forbidden file extensions (security)
const FORBIDDEN_EXTENSIONS = [
  ".exe",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".php",
  ".py",
  ".sh",
  ".bat",
  ".cmd",
  ".ps1",
  ".dll",
  ".so",
  ".bin",
  ".html",
  ".htm",
  ".mjs",
  ".cjs",
];

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

function validateFileType(
  filename: string,
  mimeType: string,
): { valid: boolean; error?: string } {
  const ext = path.extname(filename).toLowerCase();

  // Check for forbidden extensions first
  if (FORBIDDEN_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type not allowed: ${ext}. Only image files are permitted.`,
    };
  }

  // Check if MIME type is in allowed list
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type: ${mimeType}. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.`,
    };
  }

  // Validate extension matches expected MIME type
  const expectedMime = EXTENSION_TO_MIME[ext];
  if (expectedMime && expectedMime !== mimeType) {
    return {
      valid: false,
      error: `File extension ${ext} does not match content type ${mimeType}.`,
    };
  }

  return { valid: true };
}

function validateFileSize(sizeBytes: number): {
  valid: boolean;
  error?: string;
} {
  if (sizeBytes > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    const actualSizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${actualSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB.`,
    };
  }
  return { valid: true };
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    // Fetch all media from database, ordered by creation date
    const media = await db
      .select()
      .from(mediaLibrary)
      .orderBy(desc(mediaLibrary.createdAt));

    return NextResponse.json({
      success: true,
      data: media,
      total: media.length,
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const typeValidation = validateFileType(file.name, file.type);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error },
        { status: 400 },
      );
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 400 },
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-");
    const uniqueFilename = `${baseName}-${timestamp}${ext}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save file to disk
    const filePath = path.join(uploadsDir, uniqueFilename);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Get image dimensions if it's an image (basic implementation)
    let width: number | null = null;
    let height: number | null = null;

    // Store in database
    const publicUrl = `/uploads/${uniqueFilename}`;
    const result = await db
      .insert(mediaLibrary)
      .values({
        filename: uniqueFilename,
        originalFilename: file.name,
        url: publicUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        width,
        height,
        altText: "",
        usedIn: [],
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: result[0],
        message: "File uploaded successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}

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
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    // Delete from database
    const deleted = await db
      .delete(mediaLibrary)
      .where(eq(mediaLibrary.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Note: For production, you'd also delete the file from disk or blob storage

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 },
    );
  }
}
