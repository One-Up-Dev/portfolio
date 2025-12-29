"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2, Cpu, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface HomeContent {
  heroGifUrl: string;
  logoUrl: string;
  heroPhrase: string;
  specialty1Title: string;
  specialty1Description: string;
  specialty2Title: string;
  specialty2Description: string;
  specialty3Title: string;
  specialty3Description: string;
}

const defaultContent: HomeContent = {
  heroGifUrl: "",
  logoUrl: "/logo-oneup.png",
  heroPhrase: "Développeur Full-Stack en Reconversion",
  specialty1Title: "Automatisation n8n",
  specialty1Description:
    "Création de workflows automatisés pour optimiser les processus métier et gagner en productivité.",
  specialty2Title: "Claude Code",
  specialty2Description:
    "Développement assisté par IA avec Claude pour un code de qualité et une productivité décuplée.",
  specialty3Title: "Vibe Coding",
  specialty3Description:
    "Approche créative du développement alliant passion, intuition et bonnes pratiques techniques.",
};

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [content, setContent] = useState<HomeContent>(defaultContent);

  // Load appearance and content settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setContent({
              heroGifUrl: data.data.heroGifUrl || defaultContent.heroGifUrl,
              logoUrl: data.data.logoUrl || defaultContent.logoUrl,
              heroPhrase: data.data.homeHeroPhrase || defaultContent.heroPhrase,
              specialty1Title:
                data.data.homeSpecialty1Title || defaultContent.specialty1Title,
              specialty1Description:
                data.data.homeSpecialty1Description ||
                defaultContent.specialty1Description,
              specialty2Title:
                data.data.homeSpecialty2Title || defaultContent.specialty2Title,
              specialty2Description:
                data.data.homeSpecialty2Description ||
                defaultContent.specialty2Description,
              specialty3Title:
                data.data.homeSpecialty3Title || defaultContent.specialty3Title,
              specialty3Description:
                data.data.homeSpecialty3Description ||
                defaultContent.specialty3Description,
            });
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 overflow-hidden"
      >
        {/* Miyazaki-style nature GIF background with parallax */}
        <div
          className="absolute inset-0 -z-20"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${content.heroGifUrl}')`,
              filter: "brightness(0.6) saturate(0.8)",
            }}
          />
          {/* Fallback gradient for when GIF is not available */}
          <div className="absolute inset-0 bg-gradient-to-b from-retro-dark/90 via-background/80 to-background" />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/60 to-background" />

        {/* Animated pixels background */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute left-1/4 top-1/4 h-2 w-2 animate-pulse bg-primary" />
          <div className="absolute right-1/3 top-1/3 h-2 w-2 animate-pulse bg-retro-cyan delay-100" />
          <div className="absolute bottom-1/4 left-1/3 h-2 w-2 animate-pulse bg-retro-gold delay-200" />
          <div className="absolute bottom-1/3 right-1/4 h-2 w-2 animate-pulse bg-retro-green delay-300" />
        </div>

        <div className="container mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src={content.logoUrl}
              alt="ONEUP Logo"
              width={120}
              height={120}
              className="h-32 w-32 drop-shadow-lg"
              priority
              unoptimized
            />
          </div>

          {/* Main heading */}
          <h1 className="mb-6 font-pixel text-4xl text-primary md:text-5xl lg:text-6xl">
            ONEUP
          </h1>

          {/* Subtitle */}
          <p className="mb-4 text-xl font-medium text-foreground md:text-2xl">
            {content.heroPhrase}
          </p>

          {/* Tagline */}
          <p className="mb-8 text-lg text-muted-foreground">
            n8n • claude-code • automatisation • vibe coding
          </p>

          {/* CTA Buttons - Pixel Art Style */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/projets"
              className="btn-pixel group inline-flex items-center gap-2"
            >
              Voir mes projets
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="btn-pixel-outline inline-flex items-center gap-2"
            >
              Me contacter
            </Link>
          </div>
        </div>

        {/* Scroll indicator - clickable anchor link */}
        <a
          href="#specialites"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer"
          aria-label="Défiler vers les spécialités"
        >
          <div className="h-6 w-4 rounded-full border-2 border-muted-foreground p-1 transition-colors hover:border-primary">
            <div className="h-1.5 w-1 rounded-full bg-muted-foreground" />
          </div>
        </a>
      </section>

      {/* Features Section */}
      <section
        id="specialites"
        className="border-t border-border bg-card py-20"
      >
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center font-pixel text-xl text-primary">
            Spécialités
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-lg border border-border bg-background p-6 transition-all hover:border-primary/50">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {content.specialty1Title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content.specialty1Description}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-lg border border-border bg-background p-6 transition-all hover:border-primary/50">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {content.specialty2Title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content.specialty2Description}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-lg border border-border bg-background p-6 transition-all hover:border-primary/50">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {content.specialty3Title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {content.specialty3Description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="border-t border-border py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Prêt à collaborer ?</h2>
          <p className="mb-8 text-muted-foreground">
            Discutons de votre projet et voyons comment je peux vous aider à le
            réaliser.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Démarrer un projet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
