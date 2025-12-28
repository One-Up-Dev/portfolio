import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";

export const metadata = {
  title: "Blog - ONEUP Portfolio",
  description:
    "Articles sur le développement web, l'automatisation, l'IA et ma reconversion professionnelle.",
};

// Demo blog posts (will be replaced with real data from database)
const posts = [
  {
    id: "1",
    slug: "reconversion-developpeur-46-ans",
    title: "Se reconvertir développeur à 46 ans : mon parcours",
    excerpt:
      "Retour sur mon parcours de reconversion professionnelle, de la restauration au développement web. Les défis, les apprentissages et les conseils.",
    coverImage: null,
    tags: ["Reconversion", "Parcours", "Motivation"],
    publishedAt: "2024-12-15",
    readTimeMinutes: 8,
  },
  {
    id: "2",
    slug: "automatisation-n8n-guide-debutant",
    title: "Automatisation avec n8n : guide du débutant",
    excerpt:
      "Découvrez comment automatiser vos tâches répétitives avec n8n. Un guide complet pour créer votre premier workflow.",
    coverImage: null,
    tags: ["n8n", "Automatisation", "Tutorial"],
    publishedAt: "2024-12-10",
    readTimeMinutes: 12,
  },
  {
    id: "3",
    slug: "claude-code-productivite-developpeur",
    title: "Claude Code : booster sa productivité de développeur",
    excerpt:
      "Comment j'utilise Claude Code au quotidien pour coder plus vite et mieux. Astuces et bonnes pratiques.",
    coverImage: null,
    tags: ["IA", "Claude", "Productivité"],
    publishedAt: "2024-12-05",
    readTimeMinutes: 10,
  },
];

export default function BlogPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Réflexions sur le développement, l&apos;automatisation et la
            reconversion
          </p>
        </div>

        {/* Blog posts list */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mb-4 text-muted-foreground">{post.excerpt}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTimeMinutes} min de lecture
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              Aucun article pour le moment. Revenez bientôt !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
