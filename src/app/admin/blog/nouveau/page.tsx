"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/retro-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

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

// AI generation type options
const aiGenerationTypes = [
  {
    value: "complete",
    label: "Article complet (titre, extrait, contenu, méta)",
  },
  { value: "article", label: "Contenu seul" },
  { value: "title", label: "Titre accrocheur" },
  { value: "outline", label: "Plan d'article" },
  { value: "section", label: "Section spécifique" },
  { value: "improve", label: "Améliorer le texte" },
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
  coverImageUrl: string;
  tags: string[];
  status: string;
  metaDescription: string;
  publishedAt: string;
  readTimeMinutes: number;
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

  // AI Generation state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerationType, setAiGenerationType] = useState("complete");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [contextUrls, setContextUrls] = useState<string[]>([""]);
  const [aiGeneratedArticle, setAiGeneratedArticle] = useState<{
    title?: string;
    excerpt?: string;
    content?: string;
    metaDescription?: string;
  } | null>(null);

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
    coverImageUrl: "",
    tags: [],
    status: "draft", // Default to draft
    metaDescription: "",
    publishedAt: new Date().toISOString().split("T")[0], // Default to today
    readTimeMinutes: 5,
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

  // Handle AI content generation
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Veuillez entrer un sujet ou une description");
      return;
    }

    setAiGenerating(true);
    setAiError(null);
    setAiGeneratedContent("");
    setAiGeneratedArticle(null);

    try {
      // Filter out empty context URLs
      const validUrls = contextUrls.filter((url) => url.trim() !== "");

      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: aiPrompt,
          type: aiGenerationType,
          contextUrls: validUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la génération");
      }

      const data = await response.json();

      // Handle complete article generation
      if (aiGenerationType === "complete" && data.data?.type === "complete") {
        setAiGeneratedArticle({
          title: data.data.title,
          excerpt: data.data.excerpt,
          content: data.data.content,
          metaDescription: data.data.metaDescription,
        });
        setAiGeneratedContent(data.data.content || "");
      } else {
        setAiGeneratedContent(data.data?.content || data.content || "");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      setAiError(
        error instanceof Error ? error.message : "Erreur lors de la génération",
      );
    } finally {
      setAiGenerating(false);
    }
  };

  // Insert AI generated content into the form
  const handleInsertAiContent = () => {
    // Handle complete article insertion
    if (aiGenerationType === "complete" && aiGeneratedArticle) {
      setFormData((prev) => ({
        ...prev,
        title: aiGeneratedArticle.title || prev.title,
        excerpt: aiGeneratedArticle.excerpt || prev.excerpt,
        content: aiGeneratedArticle.content || prev.content,
        metaDescription:
          aiGeneratedArticle.metaDescription || prev.metaDescription,
      }));
      // Close modal and reset
      setShowAiModal(false);
      setAiPrompt("");
      setAiGeneratedContent("");
      setAiGeneratedArticle(null);
      setContextUrls([""]);
      addToast(
        "Article complet inséré avec succès! (titre, extrait, contenu, méta)",
        "success",
      );
      return;
    }

    if (!aiGeneratedContent) return;

    if (aiGenerationType === "title") {
      // Insert as title
      setFormData((prev) => ({
        ...prev,
        title: aiGeneratedContent.replace(/^#\s*/, "").trim(),
      }));
    } else {
      // Append to content
      setFormData((prev) => ({
        ...prev,
        content: prev.content
          ? prev.content + "\n\n" + aiGeneratedContent
          : aiGeneratedContent,
      }));
    }

    // Close modal and reset
    setShowAiModal(false);
    setAiPrompt("");
    setAiGeneratedContent("");
    setAiGeneratedArticle(null);
    setContextUrls([""]);
    addToast("Contenu IA inséré avec succès!", "success");
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

    // Article title (excerpt) is optional, no length restriction

    // Content is required
    if (!formData.content.trim()) {
      newErrors.content = "Le contenu est requis";
    } else if (formData.content.trim().length < 50) {
      newErrors.content = "Le contenu doit contenir au moins 50 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save and continue editing (create then redirect to edit page)
  const handleSaveAndContinue = async () => {
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
          coverImageUrl: formData.coverImageUrl,
          tags: formData.tags,
          status: formData.status,
          metaDescription: formData.metaDescription,
          publishedAt:
            formData.status === "published" ? formData.publishedAt : null,
          readTimeMinutes: formData.readTimeMinutes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Erreur lors de la création de l'article";
        addToast(errorMessage, "error");
        if (errorData.message?.includes("slug already exists")) {
          setErrors({ slug: "Ce slug existe déjà" });
        }
        return;
      }

      const result = await response.json();
      const newPostId = result.data?.id;

      // Show success toast
      addToast("Article créé! Redirection vers l'éditeur...", "success");

      // Redirect to edit page to continue editing
      if (newPostId) {
        router.replace(`/admin/blog/${newPostId}/edit`);
      }
    } catch (error) {
      console.error("Error creating blog post:", error);
      addToast("Erreur lors de la création de l'article", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission (save and go to list)
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
          coverImageUrl: formData.coverImageUrl,
          tags: formData.tags,
          status: formData.status,
          metaDescription: formData.metaDescription,
          publishedAt:
            formData.status === "published" ? formData.publishedAt : null,
          readTimeMinutes: formData.readTimeMinutes,
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

        {/* AI Generate Button */}
        <button
          type="button"
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <span className="text-lg">🤖</span>
          <span>Générer avec IA</span>
        </button>
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
          {/* Title (for cards) */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Titre de la card <span className="text-destructive">*</span>{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (affiché dans la liste du blog)
              </span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre affiché sur la card dans la liste"
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

          {/* Article Title (displayed inside the article) */}
          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Titre de l&apos;article{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (affiché dans l&apos;article)
              </span>
            </label>
            <input
              type="text"
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Titre affiché dans l'article (laisser vide pour utiliser le titre de la card)"
              className={`w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.excerpt ? "border-destructive" : "border-border"
              }`}
              aria-invalid={!!errors.excerpt}
              aria-describedby={errors.excerpt ? "excerpt-error" : undefined}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Si vide, le &quot;Titre&quot; ci-dessus sera utilisé dans
              l&apos;article
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

          {/* Cover Image */}
          <div>
            <label
              htmlFor="coverImageUrl"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Image de couverture{" "}
              <span className="text-xs text-muted-foreground font-normal">
                (affichée dans la liste du blog)
              </span>
            </label>
            <input
              type="url"
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              placeholder="https://exemple.com/image.jpg"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Collez l&apos;URL d&apos;une image depuis la bibliothèque de
              médias ou une URL externe
            </p>
            {formData.coverImageUrl && (
              <div className="mt-2 p-2 border border-border rounded-lg bg-accent/20">
                <p className="text-xs text-muted-foreground mb-2">Aperçu:</p>
                <div className="h-32 w-48 relative rounded overflow-hidden">
                  <Image
                    src={formData.coverImageUrl}
                    alt="Aperçu de l'image de couverture"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
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
            <RichTextEditor
              id="content"
              name="content"
              value={formData.content}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, content: value }));
                if (errors.content) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.content;
                    return newErrors;
                  });
                }
              }}
              placeholder="Écrivez le contenu de votre article ici..."
              error={errors.content}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formData.content.length} caractères</span>
              <span>Temps de lecture estimé: {previewReadTime} min</span>
            </div>
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

          {/* Status and Reading Time */}
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

            {/* Reading Time */}
            <div>
              <label
                htmlFor="readTimeMinutes"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Temps de lecture (minutes)
              </label>
              <input
                type="number"
                id="readTimeMinutes"
                name="readTimeMinutes"
                value={formData.readTimeMinutes}
                onChange={handleChange}
                min={1}
                max={120}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Durée estimée de lecture de l&apos;article
              </p>
            </div>
          </div>

          {/* Published At Date (for scheduling) */}
          {formData.status === "published" && (
            <div>
              <label
                htmlFor="publishedAt"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Date de publication
              </label>
              <input
                type="date"
                id="publishedAt"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(formData.publishedAt) >
                new Date(new Date().toISOString().split("T")[0])
                  ? "📅 Cet article sera programmé pour publication à cette date"
                  : "L'article sera publié immédiatement"}
              </p>
            </div>
          )}

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
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isSubmitting}
            className="px-6 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Création...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Créer et continuer</span>
              </>
            )}
          </button>
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

      {/* AI Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAiModal(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Générer avec IA
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Utilisez Claude pour générer du contenu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Error message */}
              {aiError && (
                <div
                  className="bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg p-4"
                  role="alert"
                >
                  {aiError}
                </div>
              )}

              {/* Generation Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Type de génération
                </label>
                <select
                  value={aiGenerationType}
                  onChange={(e) => setAiGenerationType(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {aiGenerationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sujet ou description
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={
                    aiGenerationType === "complete"
                      ? "Décrivez le sujet de l'article complet (ex: 'React hooks best practices', 'Guide SEO pour développeurs')..."
                      : aiGenerationType === "title"
                        ? "Décrivez le sujet pour lequel vous voulez un titre accrocheur..."
                        : aiGenerationType === "improve"
                          ? "Collez le texte à améliorer..."
                          : "Décrivez le sujet de l'article que vous voulez générer..."
                  }
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
              </div>

              {/* Context URLs - only for complete article type */}
              {aiGenerationType === "complete" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URLs de contexte (optionnel, max 5)
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Ajoutez des liens vers des articles de référence pour
                    enrichir le contenu généré
                  </p>
                  {contextUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...contextUrls];
                          newUrls[index] = e.target.value;
                          setContextUrls(newUrls);
                        }}
                        placeholder={`https://example.com/article-${index + 1}`}
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      {contextUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = contextUrls.filter(
                              (_, i) => i !== index,
                            );
                            setContextUrls(newUrls);
                          }}
                          className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          aria-label="Supprimer cette URL"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {contextUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setContextUrls([...contextUrls, ""])}
                      className="text-sm text-primary hover:underline mt-1"
                    >
                      + Ajouter une URL de contexte
                    </button>
                  )}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiPrompt.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>
                      {contextUrls.filter((u) => u.trim()).length > 0
                        ? "Récupération des URLs et génération..."
                        : "Génération en cours..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>
                      {aiGenerationType === "complete" &&
                      contextUrls.filter((u) => u.trim()).length > 0
                        ? `Générer depuis ${contextUrls.filter((u) => u.trim()).length} URL(s)`
                        : "Générer"}
                    </span>
                  </>
                )}
              </button>

              {/* Generated Content - Complete Article Preview */}
              {aiGenerationType === "complete" && aiGeneratedArticle && (
                <div className="mt-4 space-y-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-500 mb-3">
                      ✅ Article complet généré avec succès!
                    </h4>

                    {/* Title Preview */}
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        TITRE:
                      </span>
                      <p className="text-foreground font-semibold">
                        {aiGeneratedArticle.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({aiGeneratedArticle.title?.length || 0} caractères)
                      </span>
                    </div>

                    {/* Excerpt Preview */}
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        EXTRAIT:
                      </span>
                      <p className="text-foreground text-sm">
                        {aiGeneratedArticle.excerpt}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({aiGeneratedArticle.excerpt?.length || 0} caractères)
                      </span>
                    </div>

                    {/* Meta Description Preview */}
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        META DESCRIPTION (SEO):
                      </span>
                      <p className="text-foreground text-sm italic">
                        {aiGeneratedArticle.metaDescription}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        ({aiGeneratedArticle.metaDescription?.length || 0}{" "}
                        caractères)
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">
                        CONTENU:
                      </span>
                      <div className="bg-background border border-border rounded-lg p-3 max-h-40 overflow-y-auto mt-1">
                        <pre className="whitespace-pre-wrap text-xs text-foreground font-mono">
                          {aiGeneratedArticle.content?.slice(0, 500)}...
                        </pre>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({aiGeneratedArticle.content?.length || 0} caractères, ~
                        {Math.round(
                          aiGeneratedArticle.content?.split(/\s+/).length || 0,
                        )}{" "}
                        mots)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generated Content - Standard Preview */}
              {aiGenerationType !== "complete" && aiGeneratedContent && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Contenu généré
                    </label>
                    <div className="bg-background border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                        {aiGeneratedContent}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-border bg-accent/20">
              <button
                type="button"
                onClick={() => {
                  setAiPrompt("");
                  setAiGeneratedContent("");
                  setAiError(null);
                }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Régénérer
              </button>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleInsertAiContent}
                disabled={
                  aiGenerationType === "complete"
                    ? !aiGeneratedArticle
                    : !aiGeneratedContent
                }
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>📝</span>
                <span>
                  {aiGenerationType === "complete"
                    ? "Insérer l'article complet"
                    : "Insérer dans l'article"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
