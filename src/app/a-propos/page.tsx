"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Calendar, MapPin, Heart, Code } from "lucide-react";

interface AboutContent {
  myStory: string;
  whyDevelopment: string;
  mySpecialties: string;
  dateOfBirth: string;
}

interface TimelineEntry {
  id: string;
  period: string;
  title: string;
  description: string;
  location: string | null;
  skills: string | null;
  orderIndex: number;
}

const defaultContent: AboutContent = {
  myStory: `Après plus de 20 ans dans la restauration, j'ai décidé de suivre ma passion pour la technologie et le développement. Cette reconversion professionnelle représente un nouveau chapitre passionnant de ma vie.\n\nMon expérience de vie m'a appris la persévérance, la gestion du stress et le travail en équipe - des compétences essentielles que j'apporte aujourd'hui dans mes projets de développement.`,
  whyDevelopment: `La programmation a toujours été une passion cachée. Autodidacte depuis des années, j'ai finalement décidé d'en faire mon métier. L'arrivée de l'IA et des outils comme Claude Code m'ont convaincu que c'était le bon moment.\n\nJe suis particulièrement attiré par l'automatisation avec n8n, le développement assisté par IA, et la création d'interfaces utilisateur modernes et intuitives.`,
  mySpecialties: `n8n Automation - Création de workflows automatisés\nClaude Code - Développement assisté par IA\nReact & Next.js - Applications web modernes\nTypeScript - Code typé et maintenable\nVibe Coding - Approche créative du développement`,
  dateOfBirth: "1978-06-15",
};

// Default static timeline entries (used as fallback when no dynamic entries exist)
const defaultTimelineEntries: TimelineEntry[] = [
  {
    id: "default-1",
    period: "2000 - 2020",
    title: "Restauration",
    description:
      "Plus de 20 ans d'expérience dans la restauration. Apprentissage de la gestion du stress, du travail en équipe et de la persévérance.",
    location: "France",
    skills: "Gestion, Leadership, Service client",
    orderIndex: 0,
  },
  {
    id: "default-2",
    period: "2020",
    title: "Découverte du code",
    description:
      "Premiers pas en autodidacte. Exploration de HTML, CSS, JavaScript. La passion se confirme.",
    location: "France",
    skills: "HTML, CSS, JavaScript",
    orderIndex: 1,
  },
  {
    id: "default-3",
    period: "2023",
    title: "Formation intensive",
    description:
      "Apprentissage de React, Next.js, TypeScript. Découverte de n8n et des outils d'automatisation.",
    location: "France",
    skills: "React, Next.js, TypeScript, n8n",
    orderIndex: 2,
  },
  {
    id: "default-4",
    period: "2024",
    title: "IA & Reconversion",
    description:
      "Adoption de Claude Code et du vibe coding. Début de la reconversion professionnelle officielle.",
    location: "France",
    skills: "Claude Code, AI, Automatisation",
    orderIndex: 3,
  },
  {
    id: "default-5",
    period: "2025",
    title: "Développeur Full-Stack",
    description:
      "Spécialisé en automatisation n8n, développement assisté par IA (Claude Code), et création d'interfaces modernes. Prêt pour de nouveaux défis !",
    location: "France",
    skills: "Full-Stack, n8n, Claude Code, React",
    orderIndex: 4,
  },
];

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

// Color palette for timeline entries
const timelineColors = [
  { border: "border-primary", bg: "bg-primary/20", text: "text-primary" },
  {
    border: "border-retro-cyan",
    bg: "bg-retro-cyan/20",
    text: "text-retro-cyan",
  },
  {
    border: "border-retro-magenta",
    bg: "bg-retro-magenta/20",
    text: "text-retro-magenta",
  },
  {
    border: "border-retro-yellow",
    bg: "bg-retro-yellow/20",
    text: "text-retro-yellow",
  },
  { border: "border-green-500", bg: "bg-green-500/20", text: "text-green-500" },
  { border: "border-blue-500", bg: "bg-blue-500/20", text: "text-blue-500" },
  {
    border: "border-purple-500",
    bg: "bg-purple-500/20",
    text: "text-purple-500",
  },
  {
    border: "border-orange-500",
    bg: "bg-orange-500/20",
    text: "text-orange-500",
  },
];

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load content settings
        const contentResponse = await fetch("/api/settings");
        if (contentResponse.ok) {
          const data = await contentResponse.json();
          if (data.data) {
            setContent({
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

        // Load timeline entries
        const timelineResponse = await fetch("/api/timeline");
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          if (timelineData.data && timelineData.data.length > 0) {
            setTimelineEntries(timelineData.data);
          } else {
            // Use default entries if no dynamic entries exist
            setTimelineEntries(defaultTimelineEntries);
          }
        } else {
          setTimelineEntries(defaultTimelineEntries);
        }
      } catch (error) {
        console.error("Error loading content:", error);
        setTimelineEntries(defaultTimelineEntries);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const age = calculateAge(content.dateOfBirth);
  const specialties = parseSpecialties(content.mySpecialties);

  // Split into paragraphs (double newline) and preserve single line breaks
  const formatTextWithLineBreaks = (text: string) => {
    // Split by double newlines for paragraphs
    return text.split(/\n\n+/).filter((p) => p.trim());
  };

  const storyParagraphs = formatTextWithLineBreaks(content.myStory);
  const whyDevParagraphs = formatTextWithLineBreaks(content.whyDevelopment);

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

            {/* Timeline items - Dynamic */}
            <div className="space-y-8">
              {timelineEntries.map((entry, index) => {
                const colorIndex = index % timelineColors.length;
                const color = timelineColors[colorIndex];
                const isLast = index === timelineEntries.length - 1;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={entry.id}
                    className="relative flex items-start gap-4 md:gap-8"
                  >
                    {/* Timeline dot */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${color.border} ${isLast ? "bg-green-500 text-white" : "bg-background"} text-sm font-bold ${isLast ? "" : color.text} md:absolute md:left-1/2 md:-translate-x-1/2`}
                    >
                      {index + 1}
                    </div>

                    {/* Content card */}
                    <div
                      className={`flex-1 rounded-lg border ${isLast ? "border-green-500/50 bg-green-500/10" : "border-border bg-card"} p-4 ${
                        isEven
                          ? "md:w-[calc(50%-2rem)] md:mr-auto md:ml-0"
                          : "md:w-[calc(50%-2rem)] md:ml-auto md:mr-0"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded ${color.bg} px-2 py-0.5 text-xs font-medium ${color.text}`}
                        >
                          {entry.period}
                        </span>
                        {isLast && (
                          <span className="animate-pulse rounded bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                            Aujourd&apos;hui
                          </span>
                        )}
                      </div>
                      <h3 className="mb-1 font-semibold text-foreground">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                      </p>

                      {/* Location and Skills */}
                      {(entry.location || entry.skills) && (
                        <div className="mt-3 flex flex-wrap gap-3 text-xs">
                          {entry.location && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {entry.location}
                            </div>
                          )}
                          {entry.skills && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Code className="h-3 w-3" />
                              {entry.skills}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <p
                key={index}
                className="mb-4 text-muted-foreground whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Pourquoi le développement ?
            </h2>
            {whyDevParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4 text-muted-foreground whitespace-pre-line"
              >
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
