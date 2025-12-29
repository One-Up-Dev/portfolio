"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Volume2, VolumeX, Monitor, Settings } from "lucide-react";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication and load preferences from localStorage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem("oneup-sound-enabled");
    const savedCrt = localStorage.getItem("oneup-crt-enabled");

    if (savedSound !== null) {
      setSoundEnabled(savedSound === "true");
    }
    if (savedCrt !== null) {
      setCrtEnabled(savedCrt === "true");
    }

    // Check if user is authenticated
    const checkAuth = () => {
      const sessionData = localStorage.getItem("oneup-admin-session");
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          // Check if session is valid (not expired)
          if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for storage changes (in case of logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "oneup-admin-session") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo-oneup.png"
            alt="ONEUP Logo"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <span className="font-pixel text-sm text-primary uppercase tracking-wider hidden sm:inline">
            ONEUP
          </span>
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
            className="rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
              "rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground",
              crtEnabled ? "text-primary" : "text-muted-foreground",
            )}
            aria-label={
              crtEnabled ? "Désactiver effet CRT" : "Activer effet CRT"
            }
          >
            <Monitor className="h-5 w-5" />
          </button>

          {/* Admin Button - Only visible when authenticated */}
          {isAuthenticated && (
            <Link
              href="/admin"
              className="hidden rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex md:items-center md:gap-1.5"
              aria-label="Accéder à l'administration"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
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
                className="block py-3 min-h-[44px] flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            {/* Admin link in mobile menu - Only visible when authenticated */}
            {isAuthenticated && (
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <Settings className="h-4 w-4" />
                <span>Administration</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
