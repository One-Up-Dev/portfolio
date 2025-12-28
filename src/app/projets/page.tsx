import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";

export const metadata = {
  title: "Projets - ONEUP Portfolio",
  description:
    "Découvrez mes projets de développement web, automatisation et applications créatives.",
};

// Demo projects data (will be replaced with real data from database)
const projects = [
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
  },
];

const statusLabels = {
  en_cours: {
    label: "En cours",
    className: "bg-yellow-500/20 text-yellow-400",
  },
  termine: { label: "Terminé", className: "bg-green-500/20 text-green-400" },
  abandonne: { label: "Abandonné", className: "bg-red-500/20 text-red-400" },
};

export default function ProjectsPage() {
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

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
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
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusLabels[project.status].className}`}
                  >
                    {statusLabels[project.status].label}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
                  <Link href={`/projets/${project.slug}`}>{project.title}</Link>
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

        {/* Empty state (shown when no projects) */}
        {projects.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Aucun projet pour le moment. Revenez bientôt !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
