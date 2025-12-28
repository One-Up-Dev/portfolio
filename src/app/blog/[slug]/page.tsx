import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { notFound } from "next/navigation";

// Demo blog posts (will be replaced with real data from database)
const posts = [
  {
    id: "1",
    slug: "reconversion-developpeur-46-ans",
    title: "Se reconvertir développeur à 46 ans : mon parcours",
    excerpt:
      "Retour sur mon parcours de reconversion professionnelle, de la restauration au développement web.",
    content: `
## Le déclic

Après plus de 20 ans dans la restauration, j'ai ressenti le besoin de changer de vie professionnelle. La technologie m'a toujours passionné, et l'arrivée de l'IA a été le déclic final.

## Les premiers pas

J'ai commencé par apprendre les bases : HTML, CSS, JavaScript. Puis j'ai découvert React et Next.js. Chaque jour apportait son lot de découvertes et de défis.

## Les outils qui m'ont aidé

- **Claude Code** : Un assistant IA indispensable pour apprendre et coder
- **n8n** : Pour automatiser et comprendre les workflows
- **YouTube et les docs** : Des ressources infinies pour apprendre

## Mes conseils

1. Ne vous découragez pas face aux erreurs
2. Pratiquez chaque jour, même 30 minutes
3. Rejoignez une communauté de développeurs
4. Construisez des projets personnels

## Conclusion

À 46 ans, je prouve qu'il n'est jamais trop tard pour se réinventer. Si vous hésitez, lancez-vous !
    `,
    tags: ["Reconversion", "Parcours", "Motivation"],
    publishedAt: "2024-12-15",
    readTimeMinutes: 8,
  },
  {
    id: "2",
    slug: "automatisation-n8n-guide-debutant",
    title: "Automatisation avec n8n : guide du débutant",
    excerpt: "Découvrez comment automatiser vos tâches répétitives avec n8n.",
    content: `
## Qu'est-ce que n8n ?

n8n est un outil d'automatisation open-source qui permet de connecter différentes applications et services entre eux.

## Installation

Vous pouvez utiliser n8n en cloud ou l'installer localement :

\`\`\`bash
npm install n8n -g
n8n start
\`\`\`

## Votre premier workflow

1. Créez un trigger (déclencheur)
2. Ajoutez des nodes (actions)
3. Connectez-les entre eux
4. Testez et activez

## Exemples d'automatisation

- Envoyer un email quand un formulaire est soumis
- Sauvegarder automatiquement des fichiers
- Synchroniser des données entre applications

## Conclusion

n8n est un outil puissant pour gagner du temps au quotidien.
    `,
    tags: ["n8n", "Automatisation", "Tutorial"],
    publishedAt: "2024-12-10",
    readTimeMinutes: 12,
  },
  {
    id: "3",
    slug: "claude-code-productivite-developpeur",
    title: "Claude Code : booster sa productivité de développeur",
    excerpt:
      "Comment j'utilise Claude Code au quotidien pour coder plus vite et mieux.",
    content: `
## Introduction à Claude Code

Claude Code est un assistant IA développé par Anthropic qui peut vous aider dans vos tâches de développement.

## Comment je l'utilise

### 1. Génération de code

Je décris ce que je veux, Claude génère le code. Simple et efficace.

### 2. Debugging

Quand j'ai une erreur, je la montre à Claude qui m'explique le problème et propose une solution.

### 3. Refactoring

Claude peut améliorer mon code existant pour le rendre plus propre et performant.

## Bonnes pratiques

- Soyez précis dans vos demandes
- Vérifiez toujours le code généré
- Apprenez des suggestions de Claude

## Conclusion

Claude Code est devenu un outil indispensable dans mon workflow quotidien.
    `,
    tags: ["IA", "Claude", "Productivité"],
    publishedAt: "2024-12-05",
    readTimeMinutes: 10,
  },
];

export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article non trouvé - ONEUP Portfolio",
    };
  }

  return {
    title: `${post.title} - ONEUP Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            {post.title}
          </h1>

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
        </header>

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          <div className="whitespace-pre-line text-muted-foreground">
            {post.content}
          </div>
        </article>

        {/* Share / Navigation */}
        <footer className="mt-12 border-t border-border pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voir tous les articles
          </Link>
        </footer>
      </div>
    </div>
  );
}
