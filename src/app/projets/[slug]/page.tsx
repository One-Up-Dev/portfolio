import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Calendar } from "lucide-react";
import { notFound } from "next/navigation";

// Demo projects data (will be replaced with real data from database)
const projects = [
  {
    id: "1",
    slug: "portfolio-retro-gaming",
    title: "Portfolio Rétro Gaming",
    shortDescription:
      "Portfolio personnel avec thème rétro gaming années 80-90, effet CRT et sons 8-bit.",
    longDescription: `
      Ce portfolio est mon projet vitrine, conçu pour présenter mon travail de développeur
      full-stack en reconversion. Le thème rétro gaming des années 80-90 reflète ma passion
      pour les jeux vidéo classiques.

      Fonctionnalités principales :
      - Effet CRT authentique avec scanlines
      - Sons 8-bit interactifs
      - Easter eggs cachés (Konami code!)
      - Dashboard admin complet
      - Génération de contenu par IA
      - Analytics de visite
    `,
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    status: "en_cours" as const,
    projectDate: "2024-12-01",
    githubUrl: "https://github.com/oneup/portfolio",
    demoUrl: "https://oneup.dev",
  },
  {
    id: "2",
    slug: "n8n-workflows-collection",
    title: "Collection Workflows n8n",
    shortDescription:
      "Ensemble de workflows n8n pour automatiser des tâches courantes.",
    longDescription: `
      Une collection de workflows n8n prêts à l'emploi pour automatiser diverses tâches :

      - Notifications Slack/Discord automatiques
      - Backup automatique de bases de données
      - Synchronisation entre services (Google Sheets, Notion, etc.)
      - Monitoring de sites web
      - Traitement automatique d'emails

      Chaque workflow est documenté et facilement personnalisable.
    `,
    technologies: ["n8n", "Node.js", "APIs", "Webhooks"],
    status: "termine" as const,
    projectDate: "2024-10-15",
    githubUrl: "https://github.com/oneup/n8n-workflows",
  },
  {
    id: "3",
    slug: "claude-code-assistant",
    title: "Assistant Claude Code",
    shortDescription:
      "Extension VS Code pour intégrer Claude dans le workflow de développement.",
    longDescription: `
      Extension VS Code permettant d'interagir avec Claude directement depuis l'éditeur.

      Fonctionnalités :
      - Génération de code contextuelle
      - Refactoring assisté par IA
      - Explication de code complexe
      - Génération de tests unitaires
      - Documentation automatique

      L'extension utilise l'API Claude d'Anthropic pour des réponses rapides et pertinentes.
    `,
    technologies: ["TypeScript", "VS Code API", "Claude API"],
    status: "en_cours" as const,
    projectDate: "2024-11-01",
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

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: "Projet non trouvé - ONEUP Portfolio",
    };
  }

  return {
    title: `${project.title} - ONEUP Portfolio`,
    description: project.shortDescription,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back link */}
        <Link
          href="/projets"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>

        {/* Project Image */}
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-retro-dark to-retro-purple">
          <div className="flex h-full items-center justify-center text-8xl">
            🎮
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          {/* Status & Date */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusLabels[project.status].className}`}
            >
              {statusLabels[project.status].label}
            </span>
            {project.projectDate && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(project.projectDate).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            {project.title}
          </h1>

          {/* Short description */}
          <p className="text-lg text-muted-foreground">
            {project.shortDescription}
          </p>
        </div>

        {/* Technologies */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="mb-8 flex flex-wrap gap-4">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              Voir le code
            </Link>
          )}
          {project.demoUrl && (
            <Link
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Voir la démo
            </Link>
          )}
        </div>

        {/* Long description */}
        <div className="prose prose-invert max-w-none">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            À propos du projet
          </h2>
          <div className="whitespace-pre-line text-muted-foreground">
            {project.longDescription}
          </div>
        </div>
      </div>
    </div>
  );
}
