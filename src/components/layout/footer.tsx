import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  {
    href: "https://github.com/oneup",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://linkedin.com/in/oneup",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "mailto:contact@oneup.dev",
    label: "Email",
    icon: Mail,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} ONEUP. Tous droits réservés.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label={link.label}
              >
                <link.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>

          {/* Made with */}
          <p className="text-sm text-muted-foreground">
            Fait avec{" "}
            <Link
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Next.js
            </Link>{" "}
            ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
