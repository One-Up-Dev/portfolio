import Link from "next/link";
import { Download, Calendar, MapPin, Heart } from "lucide-react";

export const metadata = {
  title: "À propos - ONEUP Portfolio",
  description:
    "Découvrez mon parcours de reconversion professionnelle, de la restauration au développement full-stack.",
};

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            À propos
          </h1>
          <p className="text-lg text-muted-foreground">
            Mon parcours de reconversion professionnelle
          </p>
        </div>

        {/* Avatar/Photo section */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-primary to-retro-cyan p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-6xl">
                👨‍💻
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Âge</p>
              <p className="font-medium">46 ans</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Localisation</p>
              <p className="font-medium">France</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <Heart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Passion</p>
              <p className="font-medium">Rétro Gaming</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Mon histoire
            </h2>
            <p className="mb-4 text-muted-foreground">
              Après plus de 20 ans dans la restauration, j&apos;ai décidé de
              suivre ma passion pour la technologie et le développement. Cette
              reconversion professionnelle représente un nouveau chapitre
              passionnant de ma vie.
            </p>
            <p className="text-muted-foreground">
              Mon expérience de vie m&apos;a appris la persévérance, la gestion
              du stress et le travail en équipe - des compétences essentielles
              que j&apos;apporte aujourd&apos;hui dans mes projets de
              développement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Pourquoi le développement ?
            </h2>
            <p className="mb-4 text-muted-foreground">
              La programmation a toujours été une passion cachée. Autodidacte
              depuis des années, j&apos;ai finalement décidé d&apos;en faire mon
              métier. L&apos;arrivée de l&apos;IA et des outils comme Claude
              Code m&apos;ont convaincu que c&apos;était le bon moment.
            </p>
            <p className="text-muted-foreground">
              Je suis particulièrement attiré par l&apos;automatisation avec
              n8n, le développement assisté par IA, et la création
              d&apos;interfaces utilisateur modernes et intuitives.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Mes spécialités
            </h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">n8n Automation</strong> -
                Création de workflows automatisés
              </li>
              <li>
                <strong className="text-foreground">Claude Code</strong> -
                Développement assisté par IA
              </li>
              <li>
                <strong className="text-foreground">React & Next.js</strong> -
                Applications web modernes
              </li>
              <li>
                <strong className="text-foreground">TypeScript</strong> - Code
                typé et maintenable
              </li>
              <li>
                <strong className="text-foreground">Vibe Coding</strong> -
                Approche créative du développement
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Ma devise
            </h2>
            <blockquote className="border-l-4 border-primary bg-card p-4 italic text-muted-foreground">
              &quot;Il n&apos;est jamais trop tard pour apprendre et se
              réinventer. À 46 ans, j&apos;en suis la preuve vivante.&quot;
            </blockquote>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Me contacter
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
            disabled
            title="CV bientôt disponible"
          >
            <Download className="h-4 w-4" />
            Télécharger mon CV
          </button>
        </div>
      </div>
    </div>
  );
}
