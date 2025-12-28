"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/retro-toast";

// Tag options for multi-select (common blog tags)
const tagOptions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "n8n",
  "automatisation",
  "Claude",
  "IA",
  "productivité",
  "développement",
  "tutoriel",
  "portfolio",
  "freelance",
];

// Status options
const statusOptions = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publié" },
];

// Calculate read time based on word count
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

interface BlogFormData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: string;
  publishedAt: string | null;
  metaDescription: string;
  viewCount: number;
  readTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Form data
  const [formData, setFormData] = useState<BlogFormData | null>(null);

  // Initial form data for comparison (to detect unsaved changes)
  const initialFormDataRef = useRef<BlogFormData | null>(null);

  // Track if form has been modified since last save (for auto-save)
  const lastSavedDataRef = useRef<BlogFormData | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if form has unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!formData || !initialFormDataRef.current) return false;
    const initial = initialFormDataRef.current;
    return (
      formData.title !== initial.title ||
      formData.slug !== initial.slug ||
      formData.excerpt !== initial.excerpt ||
      formData.content !== initial.content ||
      JSON.stringify(formData.tags) !== JSON.stringify(initial.tags) ||
      formData.status !== initial.status ||
      formData.metaDescription !== initial.metaDescription
    );
  }, [formData]);

  // Load post data from API on mount
  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/blog/${postId}`, {
          credentials: "include",
        });

        if (response.status === 404) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }

        const data = await response.json();
        const post = data.data;

        const loadedData = {
          id: post.id,
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          tags: post.tags || [],
          status: post.status || "draft",
          publishedAt: post.publishedAt,
          metaDescription: post.metaDescription || "",
          viewCount: post.viewCount || 0,
          readTimeMinutes: post.readTimeMinutes || 1,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        };
        setFormData(loadedData);
        // Store initial data for comparison
        initialFormDataRef.current = {
          ...loadedData,
          tags: [...loadedData.tags],
        };
        // Also set as last saved data for auto-save comparison
        lastSavedDataRef.current = {
          ...loadedData,
          tags: [...loadedData.tags],
        };
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading post:", error);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // Check if form has changes since last auto-save
  const hasChangesSinceLastSave = useCallback(() => {
    if (!formData || !lastSavedDataRef.current) return hasUnsavedChanges();
    const lastSaved = lastSavedDataRef.current;
    return (
      formData.title !== lastSaved.title ||
      formData.slug !== lastSaved.slug ||
      formData.excerpt !== lastSaved.excerpt ||
      formData.content !== lastSaved.content ||
      JSON.stringify(formData.tags) !== JSON.stringify(lastSaved.tags) ||
      formData.status !== lastSaved.status ||
      formData.metaDescription !== lastSaved.metaDescription
    );
  }, [formData, hasUnsavedChanges]);

  // Auto-save function
  const performAutoSave = useCallback(async () => {
    if (!formData || !hasChangesSinceLastSave()) return;

    // Don't auto-save if there are validation errors in required fields
    if (!formData.title.trim() || !formData.slug.trim()) return;

    setAutoSaveStatus("saving");

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: formData.tags,
          status: formData.status,
          metaDescription: formData.metaDescription,
        }),
      });

      if (response.ok) {
        // Update last saved data reference
        lastSavedDataRef.current = {
          ...formData,
          tags: [...formData.tags],
        };
        setAutoSaveStatus("saved");
        setLastAutoSave(new Date());

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 3000);
      } else {
        setAutoSaveStatus("error");
        setTimeout(() => {
          setAutoSaveStatus("idle");
        }, 5000);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus("error");
      setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 5000);
    }
  }, [formData, hasChangesSinceLastSave, postId]);

  // Auto-save effect - runs every 5 seconds
  useEffect(() => {
    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up auto-save timer (every 5 seconds)
    autoSaveTimerRef.current = setInterval(() => {
      performAutoSave();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [performAutoSave]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Handle navigation with unsaved changes warning
  const handleNavigate = (href: string) => {
    if (hasUnsavedChanges()) {
      setPendingNavigation(href);
      setShowUnsavedWarning(true);
    } else {
      router.push(href);
    }
  };

  // Confirm navigation (discard changes)
  const confirmNavigation = () => {
    if (pendingNavigation) {
      setShowUnsavedWarning(false);
      router.push(pendingNavigation);
    }
  };

  // Cancel navigation (stay on page)
  const cancelNavigation = () => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

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
        [name]: value,
      };
    });
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter((t) => t !== tag)
          : [...prev.tags, tag],
      };
    });
  };

  // Handle adding custom tag
  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && formData && !formData.tags.includes(tag)) {
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tags: [...prev.tags, tag],
        };
      });
      setCustomTag("");
    }
  };

  // Handle custom tag on Enter key
  const handleCustomTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomTag();
    }
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

    // Excerpt is recommended but not required
    if (formData.excerpt && formData.excerpt.length > 300) {
      newErrors.excerpt = "L'extrait ne doit pas dépasser 300 caractères";
    }

    // Content is required
    if (!formData.content.trim()) {
      newErrors.content = "Le contenu est requis";
    } else if (formData.content.trim().length < 50) {
      newErrors.content = "Le contenu doit contenir au moins 50 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: formData.tags,
          status: formData.status,
          metaDescription: formData.metaDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Erreur lors de la modification de l'article";
        addToast(errorMessage, "error");
        if (errorData.message?.includes("slug already exists")) {
          setErrors({ slug: "Ce slug existe déjà" });
          setIsSubmitting(false);
          return;
        }
        throw new Error(errorMessage);
      }

      // Show success toast and message
      addToast("Article modifié avec succès!", "success");
      setSuccessMessage("Article modifié avec succès!");

      // Redirect after delay
      setTimeout(() => {
        router.push("/admin/blog");
      }, 1500);
    } catch (error) {
      console.error("Error updating post:", error);
      addToast("Erreur lors de la modification de l'article", "error");
      setErrors({ form: "Erreur lors de la modification de l'article" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate read time for preview
  const previewReadTime = formData ? calculateReadTime(formData.content) : 0;

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR");
    } catch {
      return dateStr;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-muted-foreground">
            Chargement de l&apos;article...
          </p>
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
          Article non trouvé
        </h2>
        <p className="text-muted-foreground">
          L&apos;article demandé n&apos;existe pas ou a été supprimé.
        </p>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          ← Retour aux articles
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
            <button
              type="button"
              onClick={() => handleNavigate("/admin/blog")}
              className="hover:text-primary"
            >
              Blog
            </button>
            <span>/</span>
            <span className="text-foreground">Modifier</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground">
            Modifier l&apos;article
          </h2>
          <p className="text-muted-foreground">
            Modifiez les informations de l&apos;article &quot;{formData.title}
            &quot;
          </p>
        </div>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-2">
          {autoSaveStatus === "saving" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-spin">⏳</span>
              <span>Sauvegarde automatique...</span>
            </div>
          )}
          {autoSaveStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <span>✓</span>
              <span>Sauvegardé automatiquement</span>
              {lastAutoSave && (
                <span className="text-muted-foreground">
                  ({lastAutoSave.toLocaleTimeString("fr-FR")})
                </span>
              )}
            </div>
          )}
          {autoSaveStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <span>⚠</span>
              <span>Erreur de sauvegarde auto</span>
            </div>
          )}
        </div>
      </div>

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
              placeholder="Titre de l'article"
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
                /blog/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="mon-article"
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

          {/* Excerpt */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Extrait
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Résumé court de l'article (affiché dans les listes)"
              rows={2}
              maxLength={300}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y ${
                errors.excerpt ? "border-destructive" : "border-border"
              }`}
              aria-invalid={!!errors.excerpt}
              aria-describedby={errors.excerpt ? "excerpt-error" : undefined}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.excerpt.length}/300 caractères
            </p>
            {errors.excerpt && (
              <p
                id="excerpt-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.excerpt}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Contenu <span className="text-destructive">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Écrivez le contenu de votre article ici..."
              rows={12}
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm ${
                errors.content ? "border-destructive" : "border-border"
              }`}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? "content-error" : undefined}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formData.content.length} caractères</span>
              <span>Temps de lecture estimé: {previewReadTime} min</span>
            </div>
            {errors.content && (
              <p
                id="content-error"
                className="mt-1 text-sm text-destructive"
                role="alert"
              >
                {errors.content}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    formData.tags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {/* Custom tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={handleCustomTagKeyDown}
                placeholder="Ajouter un tag personnalisé"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
                className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">
                  Sélectionné:
                </span>
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 text-primary rounded"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className="hover:text-destructive"
                      aria-label={`Supprimer le tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
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
                Date de publication
              </label>
              <p className="px-4 py-2 bg-accent/50 text-muted-foreground rounded-lg">
                {formData.publishedAt
                  ? formatDate(formData.publishedAt)
                  : "Non publié"}
              </p>
            </div>
          </div>

          {/* Meta Description (SEO) */}
          <div>
            <label
              htmlFor="metaDescription"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Meta Description (SEO)
            </label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              placeholder="Description pour les moteurs de recherche (150-160 caractères recommandés)"
              rows={2}
              maxLength={200}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formData.metaDescription.length}/200 caractères
              {formData.metaDescription.length > 0 &&
                formData.metaDescription.length < 150 && (
                  <span className="text-yellow-500 ml-2">
                    (Recommandé: au moins 150 caractères)
                  </span>
                )}
            </p>
          </div>

          {/* Metadata */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Informations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="text-foreground font-mono text-xs truncate">
                  {formData.id}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Vues</p>
                <p className="text-foreground">{formData.viewCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Créé le</p>
                <p className="text-foreground">
                  {formatDate(formData.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Modifié le</p>
                <p className="text-foreground">
                  {formatDate(formData.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => handleNavigate("/admin/blog")}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Annuler
          </button>
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

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={cancelNavigation}
          />
          <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="text-lg font-bold text-foreground">
                Modifications non enregistrées
              </h3>
            </div>
            <p className="text-muted-foreground text-center mb-6">
              Vous avez des modifications non enregistrées. Voulez-vous vraiment
              quitter cette page ? Vos modifications seront perdues.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={cancelNavigation}
                className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
              >
                Rester sur la page
              </button>
              <button
                onClick={confirmNavigation}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Quitter sans enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
