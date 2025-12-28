import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent date formatting utilities for French locale
export function formatDate(dateString: string | Date): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Date inconnue";
  }
}

export function formatDateShort(dateString: string | Date): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Date inconnue";
  }
}

export function formatDateTime(dateString: string | Date): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Date inconnue";
  }
}

// Format time ago in French (e.g., "il y a 2 heures", "il y a 3 jours")
export function formatTimeAgo(dateString: string | Date): string {
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "à l'instant";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1
        ? "il y a 1 minute"
        : `il y a ${diffInMinutes} minutes`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1
        ? "il y a 1 heure"
        : `il y a ${diffInHours} heures`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays === 1 ? "il y a 1 jour" : `il y a ${diffInDays} jours`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return diffInWeeks === 1
        ? "il y a 1 semaine"
        : `il y a ${diffInWeeks} semaines`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return diffInMonths === 1
        ? "il y a 1 mois"
        : `il y a ${diffInMonths} mois`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return diffInYears === 1 ? "il y a 1 an" : `il y a ${diffInYears} ans`;
  } catch {
    return "Date inconnue";
  }
}
