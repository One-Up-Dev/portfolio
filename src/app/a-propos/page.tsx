"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Calendar, MapPin, Heart } from "lucide-react";

interface AboutContent {
  myJourney: string;
  myStory: string;
  whyDevelopment: string;
  mySpecialties: string;
  dateOfBirth: string;
}

const defaultContent: AboutContent = {
  myJourney: `Plus de 20 ans d'expérience dans la restauration. Apprentissage de la gestion du stress, du travail en équipe et de la persévérance. Premiers pas en autodidacte en 2020, exploration de HTML, CSS, JavaScript. Formation intensive en 2023 avec React, Next.js, TypeScript. Découverte de n8n et des outils d'automatisation. Adoption de Claude Code et du vibe coding en 2024. Début de la reconversion professionnelle officielle.`,
  myStory: `Après plus de 20 ans dans la restauration, j'ai décidé de suivre ma passion pour la technologie et le développement. Cette reconversion professionnelle représente un nouveau chapitre passionnant de ma vie.\n\nMon expérience de vie m'a appris la persévérance, la gestion du stress et le travail en équipe - des compétences essentielles que j'apporte aujourd'hui dans mes projets de développement.`,
  whyDevelopment: `La programmation a toujours été une passion cachée. Autodidacte depuis des années, j'ai finalement décidé d'en faire mon métier. L'arrivée de l'IA et des outils comme Claude Code m'ont convaincu que c'était le bon moment.\n\nJe suis particulièrement attiré par l'automatisation avec n8n, le développement assisté par IA, et la création d'interfaces utilisateur modernes et intuitives.`,
  mySpecialties: `n8n Automation - Création de workflows automatisés\nClaude Code - Développement assisté par IA\nReact & Next.js - Applications web modernes\nTypeScript - Code typé et maintenable\nVibe Coding - Approche créative du développement`,
  dateOfBirth: "1978-06-15",
};

// Calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 46;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

// Parse specialties string into array
function parseSpecialties(
  specialtiesStr: string,
): { name: string; description: string }[] {
  return specialtiesStr
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const parts = line.split(" - ");
      return {
        name: parts[0]?.trim() || "",
        description: parts[1]?.trim() || "",
      };
    });
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setContent({
              myJourney: data.data.aboutMyJourney || defaultContent.myJourney,
              myStory: data.data.aboutMyStory || defaultContent.myStory,
              whyDevelopment:
                data.data.aboutWhyDevelopment || defaultContent.whyDevelopment,
              mySpecialties:
                data.data.aboutMySpecialties || defaultContent.mySpecialties,
              dateOfBirth:
                data.data.aboutDateOfBirth || defaultContent.dateOfBirth,
            });
          }
        }
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const age = calculateAge(content.dateOfBirth);
  const specialties = parseSpecialties(content.mySpecialties);

  // Split story into paragraphs
  const storyParagraphs = content.myStory.split("\n").filter((p) => p.trim());
  const whyDevParagraphs = content.whyDevelopment
    .split("\n")
    .filter((p) => p.trim());

  if (loading) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

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
              <p className="font-medium">{age} ans</p>
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
            {storyParagraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Pourquoi le développement ?
            </h2>
            {whyDevParagraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Mes spécialités
            </h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              {specialties.map((specialty, index) => (
                <li key={index}>
                  <strong className="text-foreground">{specialty.name}</strong>
                  {specialty.description && ` - ${specialty.description}`}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Ma devise
            </h2>
            <blockquote className="border-l-4 border-primary bg-card p-4 italic text-muted-foreground">
              &quot;Il n&apos;est jamais trop tard pour apprendre et se
              réinventer. À {age} ans, j&apos;en suis la preuve vivante.&quot;
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
