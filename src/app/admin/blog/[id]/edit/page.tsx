"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

// Demo blog posts data (same as in blog page for reference)
const demoPosts = [
  {
    id: "1",
    title: "Guide n8n pour débutants",
    slug: "guide-n8n-debutants",
    excerpt:
      "Découvrez comment automatiser vos tâches avec n8n, la plateforme open-source d'automatisation.",
    content:
      "n8n est une plateforme d'automatisation open-source qui permet de connecter différentes applications et services. Dans ce guide, nous allons explorer les bases de n8n et comment créer vos premiers workflows d'automatisation...",
    status: "published",
    tags: ["n8n", "automatisation"],
    publishDate: "2024-12-18",
    metaDescription:
      "Guide complet pour débuter avec n8n, la plateforme d'automatisation open-source.",
    views: 567,
    createdAt: "2024-12-18T10:00:00Z",
    updatedAt: "2024-12-18T10:00:00Z",
    publishedAt: "2024-12-18T10:00:00Z",
    readTime: 5,
  },
  {
    id: "2",
    title: "Automatisation avec Claude",
    slug: "automatisation-claude",
    excerpt:
      "Comment utiliser Claude pour automatiser vos tâches de développement et gagner en productivité.",
    content:
      "Claude est un assistant IA développé par Anthropic qui peut vous aider dans de nombreuses tâches de développement. Découvrez comment l'intégrer dans votre workflow quotidien...",
    status: "published",
    tags: ["IA", "Claude", "productivité"],
    publishDate: "2024-12-15",
    metaDescription:
      "Automatisez vos tâches de développement avec Claude, l'assistant IA d'Anthropic.",
    views: 423,
    createdAt: "2024-12-15T10:00:00Z",
    updatedAt: "2024-12-15T10:00:00Z",
    publishedAt: "2024-12-15T10:00:00Z",
    readTime: 7,
  },
  {
    id: "3",
    title: "Vibe Coding expliqué",
    slug: "vibe-coding-explique",
    excerpt:
      "Le vibe coding, une approche créative du développement qui allie passion et bonnes pratiques.",
    content:
      "Le vibe coding est une philosophie de développement qui met l'accent sur le plaisir et la créativité dans le code. Plutôt que de suivre des règles rigides, il s'agit de trouver son propre rythme...",
    status: "draft",
    tags: ["développement", "philosophie"],
    publishDate: "2024-12-12",
    metaDescription:
      "Découvrez le vibe coding, une approche créative du développement.",
    views: 0,
    createdAt: "2024-12-12T10:00:00Z",
    updatedAt: "2024-12-12T10:00:00Z",
    publishedAt: null,
    readTime: 4,
  },
];

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
  publishDate: string;
  metaDescription: string;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [isDemoPost, setIsDemoPost] = useState(false);
  const [customTag, setCustomTag] = useState("");

  // Form data
  const [formData, setFormData] = useState<BlogFormData | null>(null);

  // Load post data on mount
  useEffect(() => {
    const loadPost = () => {
      try {
        // First check demo posts
        const demoPost = demoPosts.find((p) => p.id === postId);
        if (demoPost) {
          setFormData({
            ...demoPost,
            excerpt: demoPost.excerpt || "",
            content: demoPost.content || "",
            metaDescription: demoPost.metaDescription || "",
            tags: demoPost.tags || [],
          });
          setIsDemoPost(true);
          setIsLoading(false);
          return;
        }

        // Then check localStorage
        const savedPosts = localStorage.getItem("demo_blog_posts");
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts);
          const post = parsed.find((p: BlogFormData) => p.id === postId);
          if (post) {
            setFormData({
              ...post,
              excerpt: post.excerpt || "",
              content: post.content || "",
              metaDescription: post.metaDescription || "",
              tags: post.tags || [],
              readTime: post.readTime || calculateReadTime(post.content || ""),
            });
            setIsDemoPost(false);
            setIsLoading(false);
            return;
          }
        }

        // Post not found
        setNotFound(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading post:", error);
        setNotFound(true);
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

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
      if (isDemoPost) {
        // Demo posts can't be edited in demo mode - just show success
        setSuccessMessage(
          "Modifications enregistrées! (Mode démo: les changements ne sont pas persistés pour les articles de démonstration)",
        );
        setTimeout(() => {
          router.push("/admin/blog");
        }, 2000);
        return;
      }

      // Get existing posts from localStorage
      const existingPosts = JSON.parse(
        localStorage.getItem("demo_blog_posts") || "[]",
      );

      // Calculate read time
      const readTime = calculateReadTime(formData.content);

      // Update the post
      const updatedPosts = existingPosts.map((p: BlogFormData) => {
        if (p.id === postId) {
          return {
            ...formData,
            readTime,
            updatedAt: new Date().toISOString(),
            publishedAt:
              formData.status === "published" && !formData.publishedAt
                ? new Date().toISOString()
                : formData.status === "draft"
                  ? null
                  : formData.publishedAt,
          };
        }
        return p;
      });

      // Save to localStorage
      localStorage.setItem("demo_blog_posts", JSON.stringify(updatedPosts));

      // Show success message
      setSuccessMessage("Article modifié avec succès!");

      // Redirect after delay
      setTimeout(() => {
        router.push("/admin/blog");
      }, 1500);
    } catch (error) {
      console.error("Error updating post:", error);
      setErrors({ form: "Erreur lors de la modification de l'article" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate read time for preview
  const previewReadTime = formData ? calculateReadTime(formData.content) : 0;

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
            <Link href="/admin/blog" className="hover:text-primary">
              Blog
            </Link>
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
      </div>

      {/* Demo Post Notice */}
      {isDemoPost && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-lg p-4">
          <p className="text-sm">
            <strong>Article de démonstration:</strong> Les modifications
            apportées à cet article ne seront pas persistées. Créez un nouvel
            article pour tester les fonctionnalités d&apos;édition.
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
                htmlFor="publishDate"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Date de publication
              </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
