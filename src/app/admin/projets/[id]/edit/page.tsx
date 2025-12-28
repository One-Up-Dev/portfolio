"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Demo projects data (same as in projects page for reference)
const demoProjects = [
  {
    id: "1",
    title: "Portfolio ONEUP",
    slug: "portfolio-oneup",
    shortDescription: "Portfolio personnel avec thème rétro gaming",
    longDescription:
      "Un portfolio développeur avec thème rétro gaming années 80-90, effets CRT et sons 8-bit.",
    status: "termine",
    visible: true,
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    githubUrl: "https://github.com/oneup/portfolio",
    demoUrl: "https://oneup.dev",
    projectDate: "2024-12-20",
    views: 342,
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2024-12-20T10:00:00Z",
  },
  {
    id: "2",
    title: "App de gestion",
    slug: "app-gestion",
    shortDescription: "Application de gestion de tâches",
    longDescription:
      "Application complète de gestion de tâches avec authentification et synchronisation temps réel.",
    status: "en_cours",
    visible: true,
    technologies: ["React", "Node.js", "PostgreSQL"],
    githubUrl: "https://github.com/oneup/task-app",
    demoUrl: "",
    projectDate: "2024-12-15",
    views: 256,
    createdAt: "2024-12-15T10:00:00Z",
    updatedAt: "2024-12-15T10:00:00Z",
  },
  {
    id: "3",
    title: "Bot Discord",
    slug: "bot-discord",
    shortDescription: "Bot Discord multi-fonctions",
    longDescription:
      "Un bot Discord avec commandes de modération, musique et jeux intégrés.",
    status: "termine",
    visible: true,
    technologies: ["Python", "Discord.py"],
    githubUrl: "https://github.com/oneup/discord-bot",
    demoUrl: "",
    projectDate: "2024-12-10",
    views: 189,
    createdAt: "2024-12-10T10:00:00Z",
    updatedAt: "2024-12-10T10:00:00Z",
  },
  {
    id: "4",
    title: "API REST",
    slug: "api-rest",
    shortDescription: "API REST pour applications mobiles",
    longDescription:
      "API REST complète avec authentification JWT et documentation OpenAPI.",
    status: "abandonne",
    visible: false,
    technologies: ["Node.js", "Express"],
    githubUrl: "https://github.com/oneup/rest-api",
    demoUrl: "",
    projectDate: "2024-11-28",
    views: 45,
    createdAt: "2024-11-28T10:00:00Z",
    updatedAt: "2024-11-28T10:00:00Z",
  },
];

// Technology options for multi-select
const technologyOptions = [
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

// Status options
const statusOptions = [
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "abandonne", label: "Abandonné" },
];

interface ProjectFormData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
  status: string;
  projectDate: string;
  visible: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [isDemoProject, setIsDemoProject] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ProjectFormData | null>(null);

  // Load project data on mount
  useEffect(() => {
    const loadProject = () => {
      try {
        // First check demo projects
        const demoProject = demoProjects.find((p) => p.id === projectId);
        if (demoProject) {
          setFormData({
            ...demoProject,
            shortDescription: demoProject.shortDescription || "",
            longDescription: demoProject.longDescription || "",
            githubUrl: demoProject.githubUrl || "",
            demoUrl: demoProject.demoUrl || "",
          });
          setIsDemoProject(true);
          setIsLoading(false);
          return;
        }

        // Then check localStorage
        const savedProjects = localStorage.getItem("demo_projects");
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          const project = parsed.find(
            (p: ProjectFormData) => p.id === projectId,
          );
          if (project) {
            setFormData({
              ...project,
              shortDescription: project.shortDescription || "",
              longDescription: project.longDescription || "",
              githubUrl: project.githubUrl || "",
              demoUrl: project.demoUrl || "",
              technologies: project.technologies || [],
            });
            setIsDemoProject(false);
            setIsLoading(false);
            return;
          }
        }

        // Project not found
        setNotFound(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading project:", error);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  // Handle technology toggle
  const handleTechToggle = (tech: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        technologies: prev.technologies.includes(tech)
          ? prev.technologies.filter((t) => t !== tech)
          : [...prev.technologies, tech],
      };
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData) return false;

    const newErrors: Record<string, string> = {};

    // Title is required
    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères";
    }

    // Slug is required
    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets";
    }

    // Validate URLs if provided
    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "URL invalide (doit commencer par https://)";
    }

    if (formData.demoUrl && !isValidUrl(formData.demoUrl)) {
      newErrors.demoUrl = "URL invalide (doit commencer par https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isDemoProject) {
        // Demo projects can't be edited in demo mode - just show success
        setSuccessMessage(
          "Modifications enregistrées! (Mode démo: les changements ne sont pas persistés pour les projets de démonstration)",
        );
        setTimeout(() => {
          router.push("/admin/projets");
        }, 2000);
        return;
      }

      // Get existing projects from localStorage
      const existingProjects = JSON.parse(
        localStorage.getItem("demo_projects") || "[]",
      );

      // Update the project
      const updatedProjects = existingProjects.map((p: ProjectFormData) => {
        if (p.id === projectId) {
          return {
            ...formData,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Save to localStorage
      localStorage.setItem("demo_projects", JSON.stringify(updatedProjects));

      // Show success message
      setSuccessMessage("Projet modifié avec succès!");

      // Redirect after delay
      setTimeout(() => {
        router.push("/admin/projets");
      }, 1500);
    } catch (error) {
      console.error("Error updating project:", error);
      setErrors({ form: "Erreur lors de la modification du projet" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-muted-foreground">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !formData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-2xl font-bold text-foreground">
          Projet non trouvé
        </h2>
        <p className="text-muted-foreground">
          Le projet demandé n&apos;existe pas ou a été supprimé.
        </p>
        <Link
          href="/admin/projets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ← Retour aux projets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin/projets" className="hover:text-primary">
              Projets
            </Link>
            <span>/</span>
            <span className="text-foreground">Modifier</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground">
            Modifier le projet
          </h2>
          <p className="text-muted-foreground">
            Modifiez les informations du projet &quot;{formData.title}&quot;
          </p>
        </div>
      </div>

      {/* Demo Project Notice */}
      {isDemoProject && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-lg p-4">
          <p className="text-sm">
            <strong>Projet de démonstration:</strong> Les modifications
            apportées à ce projet ne seront pas persistées. Créez un nouveau
            projet pour tester les fonctionnalités d&apos;édition.
          </p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg p-4"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      {/* Form Error */}
      {errors.form && (
        <div
          className="bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-4"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Titre <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nom du projet"
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.title ? "border-destructive" : "border-border"
              }`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Slug <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <span className="px-4 py-2 bg-accent text-muted-foreground rounded-l-lg border border-r-0 border-border">
                /projets/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="mon-projet"
                className={`flex-1 px-4 py-2 bg-background border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.slug ? "border-destructive" : "border-border"
                }`}
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? "slug-error" : undefined}
              />
            </div>
            {errors.slug && (
              <p
                id="slug-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.slug}
              </p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Description courte
            </label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Une brève description du projet"
              maxLength={200}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.shortDescription.length}/200 caractères
            </p>
          </div>

          {/* Long Description */}
          <div>
            <label
              htmlFor="longDescription"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Description détaillée
            </label>
            <textarea
              id="longDescription"
              name="longDescription"
              value={formData.longDescription}
              onChange={handleChange}
              placeholder="Description complète du projet, objectifs, fonctionnalités..."
              rows={5}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Technologies
            </label>
            <div className="flex flex-wrap gap-2">
              {technologyOptions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleTechToggle(tech)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    formData.technologies.includes(tech)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            {formData.technologies.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {formData.technologies.length} technologie(s) sélectionnée(s)
              </p>
            )}
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-foreground mb-2"
              >
                URL GitHub
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/user/repo"
                className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.githubUrl ? "border-destructive" : "border-border"
                }`}
                aria-invalid={!!errors.githubUrl}
                aria-describedby={
                  errors.githubUrl ? "githubUrl-error" : undefined
                }
              />
              {errors.githubUrl && (
                <p
                  id="githubUrl-error"
                  className="mt-1 text-sm text-destructive"
                  role="alert"
                >
                  {errors.githubUrl}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="demoUrl"
                className="block text-sm font-medium text-foreground mb-2"
              >
                URL Démo
              </label>
              <input
                type="url"
                id="demoUrl"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleChange}
                placeholder="https://my-project.vercel.app"
                className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.demoUrl ? "border-destructive" : "border-border"
                }`}
                aria-invalid={!!errors.demoUrl}
                aria-describedby={errors.demoUrl ? "demoUrl-error" : undefined}
              />
              {errors.demoUrl && (
                <p
                  id="demoUrl-error"
                  className="mt-1 text-sm text-destructive"
                  role="alert"
                >
                  {errors.demoUrl}
                </p>
              )}
            </div>
          </div>

          {/* Status and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="projectDate"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Date du projet
              </label>
              <input
                type="date"
                id="projectDate"
                name="projectDate"
                value={formData.projectDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Visible Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="visible"
              name="visible"
              checked={formData.visible}
              onChange={handleChange}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="visible" className="text-sm text-foreground">
              Visible publiquement
            </label>
          </div>

          {/* Metadata */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Informations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="text-foreground font-mono">{formData.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vues</p>
                <p className="text-foreground">{formData.views}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Créé le</p>
                <p className="text-foreground">
                  {new Date(formData.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Modifié le</p>
                <p className="text-foreground">
                  {new Date(formData.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/projets"
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les
          modifications seront sauvegardées dans le localStorage du navigateur.
        </p>
      </div>
    </div>
  );
}
