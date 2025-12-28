"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Volume2, VolumeX, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/projets", label: "Projets" },
  { href: "/blog", label: "Blog" },
  { href: "/competences", label: "Compétences" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem("oneup-sound-enabled");
    const savedCrt = localStorage.getItem("oneup-crt-enabled");

    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
    if (savedCrt !== null) {
      setCrtEnabled(savedCrt === "true");
    }
  }, []);

  // Save sound preference to localStorage
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("oneup-sound-enabled", String(newValue));
  };

  // Save CRT preference to localStorage and toggle body class
  const toggleCrt = () => {
    const newValue = !crtEnabled;
    setCrtEnabled(newValue);
    localStorage.setItem("oneup-crt-enabled", String(newValue));

    // Toggle CRT effect on body
    if (newValue) {
      document.body.classList.add("crt-effect");
    } else {
      document.body.classList.remove("crt-effect");
    }
  };

  // Apply CRT effect on mount if enabled
  useEffect(() => {
    if (crtEnabled) {
      document.body.classList.add("crt-effect");
    }
    return () => {
      document.body.classList.remove("crt-effect");
    };
  }, [crtEnabled]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-pixel text-lg text-primary transition-colors hover:text-primary/80"
        >
          <span className="text-2xl">🎮</span>
          <span>ONEUP</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label={soundEnabled ? "Désactiver le son" : "Activer le son"}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </button>

          {/* CRT Toggle */}
          <button
            onClick={toggleCrt}
            className={cn(
              "rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground",
              crtEnabled ? "text-primary" : "text-muted-foreground",
            )}
            aria-label={
              crtEnabled ? "Désactiver effet CRT" : "Activer effet CRT"
            }
          >
            <Monitor className="h-5 w-5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
