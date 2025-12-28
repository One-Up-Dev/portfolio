"use client";

import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { useState, useEffect } from "react";

// Demo projects data (combined with localStorage data)
const demoProjects = [
  {
    id: "1",
    slug: "portfolio-retro-gaming",
    title: "Portfolio Rétro Gaming",
    shortDescription:
      "Portfolio personnel avec thème rétro gaming années 80-90, effet CRT et sons 8-bit.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    status: "en_cours" as const,
    githubUrl: "https://github.com/oneup/portfolio",
    demoUrl: "https://oneup.dev",
    visible: true,
  },
  {
    id: "2",
    slug: "n8n-workflows-collection",
    title: "Collection Workflows n8n",
    shortDescription:
      "Ensemble de workflows n8n pour automatiser des tâches courantes : notifications, backups, sync.",
    technologies: ["n8n", "Node.js", "APIs", "Webhooks"],
    status: "termine" as const,
    githubUrl: "https://github.com/oneup/n8n-workflows",
    visible: true,
  },
  {
    id: "3",
    slug: "claude-code-assistant",
    title: "Assistant Claude Code",
    shortDescription:
      "Extension VS Code pour intégrer Claude dans le workflow de développement quotidien.",
    technologies: ["TypeScript", "VS Code API", "Claude API"],
    status: "en_cours" as const,
    githubUrl: "https://github.com/oneup/claude-assistant",
    visible: true,
  },
];

interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  technologies: string[];
  status: "en_cours" | "termine" | "abandonne";
  githubUrl?: string;
  demoUrl?: string;
  visible: boolean;
}

const statusLabels = {
  en_cours: {
    label: "En cours",
    className: "bg-yellow-500/20 text-yellow-400",
  },
  termine: { label: "Terminé", className: "bg-green-500/20 text-green-400" },
  abandonne: { label: "Abandonné", className: "bg-red-500/20 text-red-400" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const loadProjects = () => {
      try {
        const savedProjects = localStorage.getItem("demo_projects");
        let allProjects: Project[] = [...demoProjects];

        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          // Transform localStorage projects to match public format
          const transformedProjects = parsed.map(
            (p: Record<string, unknown>) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              shortDescription: p.shortDescription || p.description || "",
              technologies: p.technologies || [],
              status: p.status || "en_cours",
              githubUrl: p.githubUrl,
              demoUrl: p.demoUrl,
              visible: p.visible !== false, // Default to true
            }),
          );
          allProjects = [...demoProjects, ...transformedProjects];
        }

        // Filter to only visible projects
        const visibleProjects = allProjects.filter((p) => p.visible !== false);
        setProjects(visibleProjects);
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects(demoProjects.filter((p) => p.visible !== false));
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Get all unique technologies for filtering
  const allTechnologies = Array.from(
    new Set(projects.flatMap((p) => p.technologies)),
  ).sort();

  // Filter projects based on search and technology filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.shortDescription
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesTech =
      !selectedTech || project.technologies.includes(selectedTech);

    return matchesSearch && matchesTech;
  });

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            Projets
          </h1>
          <p className="text-lg text-muted-foreground">
            Découvrez mes réalisations et projets en cours
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Technology Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTech(null)}
              className={`rounded-md px-3 py-1 text-sm transition-colors ${
                !selectedTech
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Tous
            </button>
            {allTechnologies.slice(0, 6).map((tech) => (
              <button
                key={tech}
                onClick={() =>
                  setSelectedTech(selectedTech === tech ? null : tech)
                }
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  selectedTech === tech
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="group flex flex-col rounded-lg border border-border bg-card transition-all hover:border-primary/50"
              >
                {/* Project Image Placeholder */}
                <div className="aspect-video w-full bg-gradient-to-br from-retro-dark to-retro-purple p-4">
                  <div className="flex h-full items-center justify-center text-4xl">
                    🎮
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusLabels[project.status]?.className || statusLabels.en_cours.className}`}
                    >
                      {statusLabels[project.status]?.label || "En cours"}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
                    <Link href={`/projets/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h2>

                  {/* Description */}
                  <p className="mb-4 flex-1 text-sm text-muted-foreground">
                    {project.shortDescription}
                  </p>

                  {/* Technologies */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-3">
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Github className="h-4 w-4" />
                        Code
                      </Link>
                    )}
                    {project.demoUrl && (
                      <Link
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Démo
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-20 text-center">
            {searchQuery || selectedTech ? (
              <div>
                <p className="text-lg text-muted-foreground mb-4">
                  Aucun projet ne correspond à votre recherche.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTech(null);
                  }}
                  className="text-primary hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">
                Aucun projet pour le moment. Revenez bientôt !
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
