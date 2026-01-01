"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/retro-toast";

// Default technology options (fallback if API fails)
const fallbackTechnologyOptions = [
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

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

// Get current month/year as ISO date (1st of current month)
function getCurrentMonthDate(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();
}

interface ProjectFormData {
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
}

export default function NewProjectPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const [technologyOptions, setTechnologyOptions] = useState<string[]>(
    fallbackTechnologyOptions,
  );
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(true);
  const [customTech, setCustomTech] = useState("");

  // Fetch technologies from database on mount
  useEffect(() => {
    async function fetchTechnologies() {
      try {
        const response = await fetch("/api/admin/technologies", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.technologies) {
            setTechnologyOptions(data.data.technologies);
          }
        }
      } catch (error) {
        console.error("Error fetching technologies:", error);
        // Keep fallback options
      } finally {
        setIsLoadingTechnologies(false);
      }
    }
    fetchTechnologies();
  }, []);

  // Form data with default values
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    technologies: [],
    githubUrl: "",
    demoUrl: "",
    status: "en_cours", // Default to "En cours"
    projectDate: getCurrentMonthDate(), // Default to current month
    visible: true, // Default to visible
  });

  // Auto-generate slug when title changes (if autoSlug is enabled)
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.title),
      }));
    }
  }, [formData.title, autoSlug]);

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

    // Handle slug manually edited
    if (name === "slug") {
      setAutoSlug(false);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle technology toggle
  const handleTechToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title is required and has max length
    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Le titre doit contenir au moins 3 caractères";
    } else if (formData.title.length > 100) {
      newErrors.title = "Le titre ne peut pas dépasser 100 caractères";
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          shortDescription: formData.shortDescription,
          longDescription: formData.longDescription,
          technologies: formData.technologies,
          githubUrl: formData.githubUrl || null,
          demoUrl: formData.demoUrl || null,
          status: formData.status,
          projectDate: formData.projectDate,
          visible: formData.visible,
        }),
      });

      if (response.ok) {
        // Show success toast
        addToast("Projet créé avec succès!", "success");

        // Redirect after delay using replace to prevent back button resubmit
        setTimeout(() => {
          router.replace("/admin/projets");
        }, 1500);
      } else {
        const data = await response.json();
        const errorMessage =
          data.message || "Erreur lors de la création du projet";
        // Show error toast for user feedback
        addToast(errorMessage, "error");
        if (data.message === "Ce slug existe déjà") {
          setErrors({ slug: "Ce slug existe déjà" });
        } else {
          setErrors({ form: errorMessage });
        }
      }
    } catch (error) {
      console.error("Error creating project:", error);
      addToast("Erreur lors de la création du projet", "error");
      setErrors({ form: "Erreur lors de la création du projet" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-foreground">Nouveau</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground">Nouveau projet</h2>
          <p className="text-muted-foreground">
            Remplissez les informations pour créer un nouveau projet
          </p>
        </div>
      </div>

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
              maxLength={100}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.title ? "border-destructive" : "border-border"
              }`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.title.length}/100 caractères
            </p>
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
              {autoSlug && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (auto-généré)
                </span>
              )}
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
              {isLoadingTechnologies && (
                <span className="ml-2 text-xs text-muted-foreground animate-pulse">
                  (Chargement...)
                </span>
              )}
            </label>
            {/* Add custom technology input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                placeholder="Ajouter une technologie..."
                className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (
                      customTech.trim() &&
                      !technologyOptions.includes(customTech.trim())
                    ) {
                      setTechnologyOptions((prev) =>
                        [...prev, customTech.trim()].sort((a, b) =>
                          a.toLowerCase().localeCompare(b.toLowerCase()),
                        ),
                      );
                      setFormData((prev) => ({
                        ...prev,
                        technologies: [...prev.technologies, customTech.trim()],
                      }));
                      setCustomTech("");
                    } else if (
                      customTech.trim() &&
                      !formData.technologies.includes(customTech.trim())
                    ) {
                      setFormData((prev) => ({
                        ...prev,
                        technologies: [...prev.technologies, customTech.trim()],
                      }));
                      setCustomTech("");
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (
                    customTech.trim() &&
                    !technologyOptions.includes(customTech.trim())
                  ) {
                    setTechnologyOptions((prev) =>
                      [...prev, customTech.trim()].sort((a, b) =>
                        a.toLowerCase().localeCompare(b.toLowerCase()),
                      ),
                    );
                    setFormData((prev) => ({
                      ...prev,
                      technologies: [...prev.technologies, customTech.trim()],
                    }));
                    setCustomTech("");
                  } else if (
                    customTech.trim() &&
                    !formData.technologies.includes(customTech.trim())
                  ) {
                    setFormData((prev) => ({
                      ...prev,
                      technologies: [...prev.technologies, customTech.trim()],
                    }));
                    setCustomTech("");
                  }
                }}
                className="px-3 py-1.5 text-sm bg-accent text-foreground rounded-lg border border-border hover:border-primary transition-colors"
              >
                + Ajouter
              </button>
            </div>
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Date du projet
              </label>
              <div className="flex gap-2">
                <select
                  id="projectMonth"
                  value={
                    formData.projectDate
                      ? new Date(formData.projectDate).getUTCMonth()
                      : new Date().getMonth()
                  }
                  onChange={(e) => {
                    const month = parseInt(e.target.value);
                    const currentDate = formData.projectDate
                      ? new Date(formData.projectDate)
                      : new Date();
                    const newDate = new Date(
                      Date.UTC(currentDate.getUTCFullYear(), month, 1),
                    );
                    setFormData((prev) => ({
                      ...prev,
                      projectDate: newDate.toISOString(),
                    }));
                  }}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={0}>Janvier</option>
                  <option value={1}>Février</option>
                  <option value={2}>Mars</option>
                  <option value={3}>Avril</option>
                  <option value={4}>Mai</option>
                  <option value={5}>Juin</option>
                  <option value={6}>Juillet</option>
                  <option value={7}>Août</option>
                  <option value={8}>Septembre</option>
                  <option value={9}>Octobre</option>
                  <option value={10}>Novembre</option>
                  <option value={11}>Décembre</option>
                </select>
                <select
                  id="projectYear"
                  value={
                    formData.projectDate
                      ? new Date(formData.projectDate).getUTCFullYear()
                      : new Date().getFullYear()
                  }
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    const currentDate = formData.projectDate
                      ? new Date(formData.projectDate)
                      : new Date();
                    const newDate = new Date(
                      Date.UTC(year, currentDate.getUTCMonth(), 1),
                    );
                    setFormData((prev) => ({
                      ...prev,
                      projectDate: newDate.toISOString(),
                    }));
                  }}
                  className="w-28 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() - 5 + i,
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
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
                <span>Création...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Créer le projet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
