import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db";
import { projects } from "../../../../../db/schema";
import { isAuthenticated } from "@/lib/auth";

// Default technology options (fallback)
const defaultTechnologies = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Express",
  "Python",
  "PostgreSQL",
  "MongoDB",
  "Tailwind CSS",
  "Docker",
  "n8n",
  "Claude Code",
  "Git",
  "Vercel",
];

// GET /api/admin/technologies - Get all unique technologies from projects
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { success: false, message: "Non autorisé" },
      { status: 401 },
    );
  }

  try {
    // Get all projects to extract technologies
    const allProjects = await db
      .select({
        technologies: projects.technologies,
      })
      .from(projects);

    // Extract all technologies from projects
    const projectTechnologies = new Set<string>();
    allProjects.forEach((project) => {
      const techs = project.technologies;
      if (Array.isArray(techs)) {
        techs.forEach((tech) => {
          if (typeof tech === "string" && tech.trim()) {
            projectTechnologies.add(tech.trim());
          }
        });
      }
    });

    // Merge with default technologies (defaults first, then project-specific)
    const allTechnologies = new Set<string>();
    defaultTechnologies.forEach((tech) => allTechnologies.add(tech));
    projectTechnologies.forEach((tech) => allTechnologies.add(tech));

    // Convert to sorted array
    const technologiesArray = Array.from(allTechnologies).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );

    return NextResponse.json({
      success: true,
      data: {
        technologies: technologiesArray,
        defaults: defaultTechnologies,
        fromProjects: Array.from(projectTechnologies),
      },
    });
  } catch (error) {
    console.error("Error fetching technologies:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}

// POST /api/admin/technologies - Add a new custom technology
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { success: false, message: "Non autorisé" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { technology } = body;

    if (!technology || typeof technology !== "string" || !technology.trim()) {
      return NextResponse.json(
        { success: false, message: "Technologie invalide" },
        { status: 400 },
      );
    }

    // The technology will be saved when it's added to a project
    // For now, just validate and return success
    return NextResponse.json({
      success: true,
      data: {
        technology: technology.trim(),
        message: "Technologie ajoutée (sera sauvegardée avec le projet)",
      },
    });
  } catch (error) {
    console.error("Error adding technology:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
