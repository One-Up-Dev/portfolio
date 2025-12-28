"use client";

import Link from "next/link";
import { ArrowRight, Code2, Cpu, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

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
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 overflow-hidden">
        {/* Miyazaki-style nature GIF background with parallax */}
        <div
          className="absolute inset-0 -z-20"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/miyazaki-nature.gif')`,
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
          {/* Logo/Icon */}
          <div className="mb-8 text-7xl">🎮</div>

          {/* Main heading */}
          <h1 className="mb-6 font-pixel text-3xl text-primary md:text-4xl lg:text-5xl">
            ONEUP
          </h1>

          {/* Subtitle */}
          <p className="mb-4 text-xl font-medium text-foreground md:text-2xl">
            Développeur Full-Stack en Reconversion
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-6 w-4 rounded-full border-2 border-muted-foreground p-1">
            <div className="h-1.5 w-1 rounded-full bg-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-20">
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
              <h3 className="mb-2 text-lg font-semibold">Automatisation n8n</h3>
              <p className="text-sm text-muted-foreground">
                Création de workflows automatisés pour optimiser les processus
                métier et gagner en productivité.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-lg border border-border bg-background p-6 transition-all hover:border-primary/50">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Claude Code</h3>
              <p className="text-sm text-muted-foreground">
                Développement assisté par IA avec Claude pour un code de qualité
                et une productivité décuplée.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-lg border border-border bg-background p-6 transition-all hover:border-primary/50">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Vibe Coding</h3>
              <p className="text-sm text-muted-foreground">
                Approche créative du développement alliant passion, intuition et
                bonnes pratiques techniques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20">
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
