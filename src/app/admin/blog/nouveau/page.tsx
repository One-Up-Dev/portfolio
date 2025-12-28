"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/retro-toast";

// Default tag options for multi-select (common blog tags)
const defaultTagOptions = [
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

// Calculate read time based on word count
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: string;
  metaDescription: string;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [tagOptions, setTagOptions] = useState<string[]>(defaultTagOptions);

  // Load existing tags from API on mount
  useEffect(() => {
    const loadExistingTags = async () => {
      try {
        const response = await fetch("/api/admin/blog", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const posts = data.data || [];
          const allTags = new Set<string>(defaultTagOptions);
          posts.forEach((post: { tags?: string[] }) => {
            if (post.tags && Array.isArray(post.tags)) {
              post.tags.forEach((tag: string) => allTags.add(tag));
            }
          });
          setTagOptions(Array.from(allTags));
        }
      } catch (error) {
        console.error("Error loading existing tags:", error);
      }
    };
    loadExistingTags();
  }, []);

  // Form data with default values
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: [],
    status: "draft", // Default to draft
    metaDescription: "",
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
    const { name, value } = e.target;

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
      [name]: value,
    }));
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Handle adding custom tag
  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
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
          errorData.message || "Erreur lors de la création de l'article";
        // Show error toast for user feedback
        addToast(errorMessage, "error");
        if (errorData.message?.includes("slug already exists")) {
          setErrors({ slug: "Ce slug existe déjà" });
          setIsSubmitting(false);
          return;
        }
        throw new Error(errorMessage);
      }

      // Show success toast
      addToast("Article créé avec succès!", "success");
      setSuccessMessage("Article créé avec succès!");

      // Redirect after delay using replace to prevent back button resubmit
      setTimeout(() => {
        router.replace("/admin/blog");
      }, 1500);
    } catch (error) {
      console.error("Error creating blog post:", error);
      addToast("Erreur lors de la création de l'article", "error");
      setErrors({ form: "Erreur lors de la création de l'article" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate read time for preview
  const previewReadTime = calculateReadTime(formData.content);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/admin/blog" className="hover:text-primary">
              Blog
            </Link>
            <span>/</span>
            <span className="text-foreground">Nouveau</span>
          </nav>
          <h2 className="text-2xl font-bold text-foreground">Nouvel article</h2>
          <p className="text-muted-foreground">
            Rédigez et publiez un nouvel article de blog
          </p>
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
              {autoSlug && (
                <span className="ml-2 text-xs text-muted-foreground">
                  (auto-généré)
                </span>
              )}
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
              placeholder="Écrivez le contenu de votre article ici...

Vous pouvez utiliser du Markdown pour formater le texte:
- **Gras** pour mettre en valeur
- *Italique* pour emphase
- # Titre pour les sections
- - Liste pour les listes
- `code` pour le code inline"
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
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/blog"
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
                <span>
                  {formData.status === "published"
                    ? "Publier l'article"
                    : "Enregistrer le brouillon"}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
