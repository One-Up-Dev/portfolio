"use client";

import { useState, useEffect } from "react";
import { Save, FileText, Home, User } from "lucide-react";

interface ContentState {
  // About page content
  aboutMyJourney: string;
  aboutMyStory: string;
  aboutWhyDevelopment: string;
  aboutMySpecialties: string;
  aboutDateOfBirth: string;

  // Home page content
  homeHeroPhrase: string;
  homeSpecialty1Title: string;
  homeSpecialty1Description: string;
  homeSpecialty2Title: string;
  homeSpecialty2Description: string;
  homeSpecialty3Title: string;
  homeSpecialty3Description: string;
}

const defaultContent: ContentState = {
  aboutMyJourney: `Plus de 20 ans d'expérience dans la restauration. Apprentissage de la gestion du stress, du travail en équipe et de la persévérance. Premiers pas en autodidacte en 2020, exploration de HTML, CSS, JavaScript. Formation intensive en 2023 avec React, Next.js, TypeScript. Découverte de n8n et des outils d'automatisation. Adoption de Claude Code et du vibe coding en 2024. Début de la reconversion professionnelle officielle.`,
  aboutMyStory: `Après plus de 20 ans dans la restauration, j'ai décidé de suivre ma passion pour la technologie et le développement. Cette reconversion professionnelle représente un nouveau chapitre passionnant de ma vie.\n\nMon expérience de vie m'a appris la persévérance, la gestion du stress et le travail en équipe - des compétences essentielles que j'apporte aujourd'hui dans mes projets de développement.`,
  aboutWhyDevelopment: `La programmation a toujours été une passion cachée. Autodidacte depuis des années, j'ai finalement décidé d'en faire mon métier. L'arrivée de l'IA et des outils comme Claude Code m'ont convaincu que c'était le bon moment.\n\nJe suis particulièrement attiré par l'automatisation avec n8n, le développement assisté par IA, et la création d'interfaces utilisateur modernes et intuitives.`,
  aboutMySpecialties: `n8n Automation - Création de workflows automatisés\nClaude Code - Développement assisté par IA\nReact & Next.js - Applications web modernes\nTypeScript - Code typé et maintenable\nVibe Coding - Approche créative du développement`,
  aboutDateOfBirth: "1978-06-15",

  homeHeroPhrase: "Développeur Full-Stack en Reconversion",
  homeSpecialty1Title: "Automatisation n8n",
  homeSpecialty1Description:
    "Création de workflows automatisés pour optimiser les processus métier et gagner en productivité.",
  homeSpecialty2Title: "Claude Code",
  homeSpecialty2Description:
    "Développement assisté par IA avec Claude pour un code de qualité et une productivité décuplée.",
  homeSpecialty3Title: "Vibe Coding",
  homeSpecialty3Description:
    "Approche créative du développement alliant passion, intuition et bonnes pratiques techniques.",
};

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<"about" | "home">("about");
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setContent({
              aboutMyJourney:
                data.data.aboutMyJourney || defaultContent.aboutMyJourney,
              aboutMyStory:
                data.data.aboutMyStory || defaultContent.aboutMyStory,
              aboutWhyDevelopment:
                data.data.aboutWhyDevelopment ||
                defaultContent.aboutWhyDevelopment,
              aboutMySpecialties:
                data.data.aboutMySpecialties ||
                defaultContent.aboutMySpecialties,
              aboutDateOfBirth:
                data.data.aboutDateOfBirth || defaultContent.aboutDateOfBirth,
              homeHeroPhrase:
                data.data.homeHeroPhrase || defaultContent.homeHeroPhrase,
              homeSpecialty1Title:
                data.data.homeSpecialty1Title ||
                defaultContent.homeSpecialty1Title,
              homeSpecialty1Description:
                data.data.homeSpecialty1Description ||
                defaultContent.homeSpecialty1Description,
              homeSpecialty2Title:
                data.data.homeSpecialty2Title ||
                defaultContent.homeSpecialty2Title,
              homeSpecialty2Description:
                data.data.homeSpecialty2Description ||
                defaultContent.homeSpecialty2Description,
              homeSpecialty3Title:
                data.data.homeSpecialty3Title ||
                defaultContent.homeSpecialty3Title,
              homeSpecialty3Description:
                data.data.homeSpecialty3Description ||
                defaultContent.homeSpecialty3Description,
            });
          }
        }
      } catch (err) {
        console.error("Error loading content:", err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
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
  };

  // Save all content
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Save each content field
      const contentFields = Object.entries(content);

      for (const [key, value] of contentFields) {
        await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ key, value }),
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving content:", err);
      setError("Erreur lors de la sauvegarde du contenu");
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (key: keyof ContentState, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement du contenu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestion du contenu
          </h2>
          <p className="text-muted-foreground">
            Modifiez le contenu des pages publiques
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder tout"}
        </button>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div
          className="bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg p-4"
          role="alert"
        >
          Contenu sauvegardé avec succès!
        </div>
      )}

      {error && (
        <div
          className="bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg p-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("about")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "about"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Page À propos
          </button>
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "home"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            Page Accueil
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {activeTab === "about" && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Contenu de la page À propos
            </h3>

            {/* Date of Birth */}
            <div className="p-4 border border-border rounded-lg bg-background">
              <label className="block text-sm font-medium text-foreground mb-2">
                Date de naissance (pour calcul automatique de l&apos;âge)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={content.aboutDateOfBirth}
                  onChange={(e) =>
                    handleContentChange("aboutDateOfBirth", e.target.value)
                  }
                  className="px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                />
                <div className="text-sm text-muted-foreground">
                  Âge calculé:{" "}
                  <span className="font-semibold text-foreground">
                    {calculateAge(content.aboutDateOfBirth)} ans
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                L&apos;âge sera automatiquement mis à jour chaque année
              </p>
            </div>

            {/* My Journey */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mon parcours (My Journey)
              </label>
              <textarea
                value={content.aboutMyJourney}
                onChange={(e) =>
                  handleContentChange("aboutMyJourney", e.target.value)
                }
                rows={6}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                placeholder="Décrivez votre parcours professionnel..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ce texte apparaît dans la section timeline de la page À propos
              </p>
            </div>

            {/* My Story */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mon histoire (My Story)
              </label>
              <textarea
                value={content.aboutMyStory}
                onChange={(e) =>
                  handleContentChange("aboutMyStory", e.target.value)
                }
                rows={6}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                placeholder="Racontez votre histoire personnelle..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Utilisez \n pour créer des nouveaux paragraphes
              </p>
            </div>

            {/* Why Development */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Pourquoi le développement (Why Development)
              </label>
              <textarea
                value={content.aboutWhyDevelopment}
                onChange={(e) =>
                  handleContentChange("aboutWhyDevelopment", e.target.value)
                }
                rows={6}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                placeholder="Expliquez pourquoi vous avez choisi le développement..."
              />
            </div>

            {/* My Specialties */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mes spécialités (My Specialties)
              </label>
              <textarea
                value={content.aboutMySpecialties}
                onChange={(e) =>
                  handleContentChange("aboutMySpecialties", e.target.value)
                }
                rows={6}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                placeholder="Listez vos spécialités (une par ligne avec description)..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: Nom de la spécialité - Description (une par ligne)
              </p>
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Contenu de la page Accueil
            </h3>

            {/* Hero Phrase */}
            <div className="p-4 border border-border rounded-lg bg-background">
              <label className="block text-sm font-medium text-foreground mb-2">
                Phrase d&apos;accroche du Hero (sous le nom)
              </label>
              <input
                type="text"
                value={content.homeHeroPhrase}
                onChange={(e) =>
                  handleContentChange("homeHeroPhrase", e.target.value)
                }
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                placeholder="Développeur Full-Stack en Reconversion"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cette phrase apparaît sous &quot;ONEUP&quot; dans la section
                hero
              </p>
            </div>

            {/* Specialties Frames */}
            <div className="space-y-6">
              <h4 className="text-md font-medium text-foreground">
                Cadres des spécialités (3 cartes)
              </h4>

              {/* Specialty 1 */}
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <span className="font-medium">Spécialité 1</span>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={content.homeSpecialty1Title}
                      onChange={(e) =>
                        handleContentChange(
                          "homeSpecialty1Title",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Automatisation n8n"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={content.homeSpecialty1Description}
                      onChange={(e) =>
                        handleContentChange(
                          "homeSpecialty1Description",
                          e.target.value,
                        )
                      }
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                      placeholder="Description de la spécialité..."
                    />
                  </div>
                </div>
              </div>

              {/* Specialty 2 */}
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <span className="font-medium">Spécialité 2</span>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={content.homeSpecialty2Title}
                      onChange={(e) =>
                        handleContentChange(
                          "homeSpecialty2Title",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Claude Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={content.homeSpecialty2Description}
                      onChange={(e) =>
                        handleContentChange(
                          "homeSpecialty2Description",
                          e.target.value,
                        )
                      }
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                      placeholder="Description de la spécialité..."
                    />
                  </div>
                </div>
              </div>

              {/* Specialty 3 */}
              <div className="p-4 border border-border rounded-lg bg-background">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <span className="font-medium">Spécialité 3</span>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={content.homeSpecialty3Title}
                      onChange={(e) =>
                        handleContentChange(
                          "homeSpecialty3Title",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Vibe Coding"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={content.homeSpecialty3Description}
                      onChange={(e) =>
                        handleContentChange(
                          "homeSpecialty3Description",
                          e.target.value,
                        )
                      }
                      rows={2}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                      placeholder="Description de la spécialité..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Sauvegarde..." : "Sauvegarder tout"}
        </button>
      </div>
    </div>
  );
}
