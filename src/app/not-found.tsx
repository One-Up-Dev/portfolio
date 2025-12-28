"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-20">
      <div className="text-center">
        {/* 404 Icon */}
        <div className="mb-8 text-8xl">👾</div>

        {/* Error Code */}
        <h1 className="mb-4 font-pixel text-4xl text-primary md:text-6xl">
          404
        </h1>

        {/* Message */}
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Page non trouvée
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Oups ! La page que vous recherchez semble avoir été téléportée dans
          une autre dimension.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}
