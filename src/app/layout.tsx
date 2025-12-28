import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "ONEUP Portfolio - Développeur Full-Stack",
  description:
    "Portfolio de développeur full-stack en reconversion professionnelle. Spécialiste n8n, claude-code, et automatisation. Thème rétro gaming.",
  keywords: [
    "développeur",
    "full-stack",
    "portfolio",
    "n8n",
    "automatisation",
    "react",
    "next.js",
  ],
  authors: [{ name: "ONEUP" }],
  openGraph: {
    title: "ONEUP Portfolio - Développeur Full-Stack",
    description:
      "Portfolio de développeur full-stack en reconversion professionnelle.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-background antialiased">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
