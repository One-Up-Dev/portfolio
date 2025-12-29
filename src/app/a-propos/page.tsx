import Link from "next/link";
import Image from "next/image";
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
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                <Image
                  src="/logo-oneup.png"
                  alt="ONEUP Avatar"
                  width={150}
                  height={150}
                  className="h-32 w-32 rounded-full"
                />
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

        {/* Timeline Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-xl font-semibold text-foreground">
            Mon parcours
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-retro-cyan to-retro-magenta md:left-1/2 md:-translate-x-1/2" />

            {/* Timeline items */}
            <div className="space-y-8">
              {/* 2000-2020: Restauration */}
              <div className="relative flex items-start gap-4 md:gap-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-bold text-primary md:absolute md:left-1/2 md:-translate-x-1/2">
                  1
                </div>
                <div className="flex-1 rounded-lg border border-border bg-card p-4 md:w-[calc(50%-2rem)] md:mr-auto md:ml-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                      2000 - 2020
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    Restauration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Plus de 20 ans d&apos;expérience dans la restauration.
                    Apprentissage de la gestion du stress, du travail en équipe
                    et de la persévérance.
                  </p>
                </div>
              </div>

              {/* 2020: Découverte du code */}
              <div className="relative flex items-start gap-4 md:gap-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-retro-cyan bg-background text-sm font-bold text-retro-cyan md:absolute md:left-1/2 md:-translate-x-1/2">
                  2
                </div>
                <div className="flex-1 rounded-lg border border-border bg-card p-4 md:w-[calc(50%-2rem)] md:ml-auto md:mr-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-retro-cyan/20 px-2 py-0.5 text-xs font-medium text-retro-cyan">
                      2020
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    Découverte du code
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Premiers pas en autodidacte. Exploration de HTML, CSS,
                    JavaScript. La passion se confirme.
                  </p>
                </div>
              </div>

              {/* 2023: Formation intensive */}
              <div className="relative flex items-start gap-4 md:gap-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-retro-magenta bg-background text-sm font-bold text-retro-magenta md:absolute md:left-1/2 md:-translate-x-1/2">
                  3
                </div>
                <div className="flex-1 rounded-lg border border-border bg-card p-4 md:w-[calc(50%-2rem)] md:mr-auto md:ml-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-retro-magenta/20 px-2 py-0.5 text-xs font-medium text-retro-magenta">
                      2023
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    Formation intensive
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Apprentissage de React, Next.js, TypeScript. Découverte de
                    n8n et des outils d&apos;automatisation.
                  </p>
                </div>
              </div>

              {/* 2024: IA & Reconversion */}
              <div className="relative flex items-start gap-4 md:gap-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-retro-yellow bg-background text-sm font-bold text-retro-yellow md:absolute md:left-1/2 md:-translate-x-1/2">
                  4
                </div>
                <div className="flex-1 rounded-lg border border-border bg-card p-4 md:w-[calc(50%-2rem)] md:ml-auto md:mr-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-retro-yellow/20 px-2 py-0.5 text-xs font-medium text-retro-yellow">
                      2024
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    IA & Reconversion
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adoption de Claude Code et du vibe coding. Début de la
                    reconversion professionnelle officielle.
                  </p>
                </div>
              </div>

              {/* 2025: Aujourd'hui */}
              <div className="relative flex items-start gap-4 md:gap-8">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500 text-sm font-bold text-white md:absolute md:left-1/2 md:-translate-x-1/2">
                  5
                </div>
                <div className="flex-1 rounded-lg border border-green-500/50 bg-green-500/10 p-4 md:w-[calc(50%-2rem)] md:mr-auto md:ml-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-500">
                      2025
                    </span>
                    <span className="animate-pulse rounded bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                      Aujourd&apos;hui
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    Développeur Full-Stack
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Spécialisé en automatisation n8n, développement assisté par
                    IA (Claude Code), et création d&apos;interfaces modernes.
                    Prêt pour de nouveaux défis !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
