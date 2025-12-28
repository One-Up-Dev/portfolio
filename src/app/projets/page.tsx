"use client";

import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

type SortOption = "newest" | "oldest" | "projectDate";

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL params
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedTech, setSelectedTech] = useState<string | null>(
    searchParams.get("tech") || null,
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest",
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );

  // Update URL when filters change and store in sessionStorage for back navigation
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTech) params.set("tech", selectedTech);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (sortBy !== "newest") params.set("sort", sortBy);

    const paramsString = params.toString();
    const newUrl = paramsString ? `/projets?${paramsString}` : "/projets";
    router.replace(newUrl, { scroll: false });

    // Store filter params in sessionStorage for back navigation from detail pages
    if (paramsString) {
      sessionStorage.setItem("projetsFilterParams", paramsString);
    } else {
      sessionStorage.removeItem("projetsFilterParams");
    }
  }, [selectedTech, debouncedSearch, sortBy, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load all technologies on mount (for filter buttons)
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        const response = await fetch("/api/projects");
        const result = await response.json();
        if (result.success && result.data) {
          const techs = Array.from(
            new Set(result.data.flatMap((p: Project) => p.technologies || [])),
          ).sort() as string[];
          setAllTechnologies(techs);
        }
      } catch (error) {
        console.error("Error loading technologies:", error);
      }
    };
    loadTechnologies();
  }, []);

  // Load projects from API when filters change
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        // Build URL with all params
        const params = new URLSearchParams();

        // Sort params
        if (sortBy === "oldest") {
          params.set("sortBy", "createdAt");
          params.set("sortOrder", "asc");
        } else if (sortBy === "projectDate") {
          params.set("sortBy", "projectDate");
          params.set("sortOrder", "desc");
        } else {
          // newest (default)
          params.set("sortBy", "createdAt");
          params.set("sortOrder", "desc");
        }

        // Technology filter
        if (selectedTech) {
          params.set("technology", selectedTech);
        }

        // Search query
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        const response = await fetch(`/api/projects?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          setProjects(result.data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [sortBy, selectedTech, debouncedSearch]);

  // Projects are already filtered by API, no client-side filtering needed

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

        {/* Search, Sort and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-sm text-muted-foreground"
              >
                Trier par:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="projectDate">Date du projet</option>
              </select>
            </div>
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
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="card-glitch group flex flex-col rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Project Image Placeholder with Glitch Effect */}
                <div className="glitch-image aspect-video w-full bg-gradient-to-br from-retro-dark to-retro-purple p-4">
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
                    {(project.technologies || []).map((tech) => (
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
