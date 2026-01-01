"use client";

import { useState, useEffect } from "react";
import {
  Save,
  FileText,
  Home,
  User,
  Plus,
  Trash2,
  Edit3,
  X,
  MapPin,
  Briefcase,
  Calendar,
  Code,
  LayoutGrid,
} from "lucide-react";

interface ContentState {
  // About page content
  aboutMyStory: string;
  aboutWhyDevelopment: string;
  aboutMySpecialties: string;
  aboutDateOfBirth: string;

  // Home page content
  homeHeroPhrase: string;
  homeHeroDescription: string;
}

interface TimelineEntry {
  id: string;
  period: string;
  title: string;
  description: string;
  location: string | null;
  skills: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface SpecialtyFrame {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

const defaultContent: ContentState = {
  aboutMyStory: `Après plus de 20 ans dans la restauration, j'ai décidé de suivre ma passion pour la technologie et le développement. Cette reconversion professionnelle représente un nouveau chapitre passionnant de ma vie.\n\nMon expérience de vie m'a appris la persévérance, la gestion du stress et le travail en équipe - des compétences essentielles que j'apporte aujourd'hui dans mes projets de développement.`,
  aboutWhyDevelopment: `La programmation a toujours été une passion cachée. Autodidacte depuis des années, j'ai finalement décidé d'en faire mon métier. L'arrivée de l'IA et des outils comme Claude Code m'ont convaincu que c'était le bon moment.\n\nJe suis particulièrement attiré par l'automatisation avec n8n, le développement assisté par IA, et la création d'interfaces utilisateur modernes et intuitives.`,
  aboutMySpecialties: `n8n Automation - Création de workflows automatisés\nClaude Code - Développement assisté par IA\nReact & Next.js - Applications web modernes\nTypeScript - Code typé et maintenable\nVibe Coding - Approche créative du développement`,
  aboutDateOfBirth: "1978-06-15",

  homeHeroPhrase: "Développeur Full-Stack en Reconversion",
  homeHeroDescription:
    "Passionné par l'automatisation et le développement assisté par IA, je crée des solutions web modernes et efficaces.",
};

const emptyTimelineEntry: Omit<
  TimelineEntry,
  "id" | "createdAt" | "updatedAt" | "orderIndex"
> = {
  period: "",
  title: "",
  description: "",
  location: "",
  skills: "",
};

const emptySpecialtyFrame: Omit<
  SpecialtyFrame,
  "id" | "createdAt" | "updatedAt" | "orderIndex"
> = {
  title: "",
  description: "",
  icon: "⚡",
};

const iconOptions = [
  "⚡",
  "🚀",
  "💻",
  "🤖",
  "🎮",
  "🔧",
  "📊",
  "🌐",
  "☁️",
  "📱",
  "🔒",
  "🎯",
];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<
    "about" | "home" | "timeline" | "specialties"
  >("about");
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Timeline state
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);
  const [newEntry, setNewEntry] =
    useState<
      Omit<TimelineEntry, "id" | "createdAt" | "updatedAt" | "orderIndex">
    >(emptyTimelineEntry);
  const [showAddForm, setShowAddForm] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Specialty frames state
  const [specialtyFrames, setSpecialtyFrames] = useState<SpecialtyFrame[]>([]);
  const [editingFrame, setEditingFrame] = useState<SpecialtyFrame | null>(null);
  const [newFrame, setNewFrame] =
    useState<
      Omit<SpecialtyFrame, "id" | "createdAt" | "updatedAt" | "orderIndex">
    >(emptySpecialtyFrame);
  const [showAddFrameForm, setShowAddFrameForm] = useState(false);
  const [framesLoading, setFramesLoading] = useState(false);
  const [deleteFrameConfirmId, setDeleteFrameConfirmId] = useState<
    string | null
  >(null);

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
              homeHeroDescription:
                data.data.homeHeroDescription ||
                defaultContent.homeHeroDescription,
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

  // Load timeline entries
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const response = await fetch("/api/admin/timeline", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setTimelineEntries(data.data);
          }
        }
      } catch (err) {
        console.error("Error loading timeline:", err);
      }
    };
    loadTimeline();
  }, []);

  // Load specialty frames
  useEffect(() => {
    const loadSpecialtyFrames = async () => {
      try {
        const response = await fetch("/api/admin/specialty-frames", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setSpecialtyFrames(data.data);
          }
        }
      } catch (err) {
        console.error("Error loading specialty frames:", err);
      }
    };
    loadSpecialtyFrames();
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

  // Timeline CRUD operations
  const handleAddTimelineEntry = async () => {
    if (!newEntry.period || !newEntry.title || !newEntry.description) {
      setError("Période, titre et description sont requis");
      return;
    }

    setTimelineLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        const data = await response.json();
        setTimelineEntries((prev) => [...prev, data.data]);
        setNewEntry(emptyTimelineEntry);
        setShowAddForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de l'ajout");
      }
    } catch (err) {
      console.error("Error adding timeline entry:", err);
      setError("Erreur lors de l'ajout de l'entrée");
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleUpdateTimelineEntry = async () => {
    if (!editingEntry) return;

    if (
      !editingEntry.period ||
      !editingEntry.title ||
      !editingEntry.description
    ) {
      setError("Période, titre et description sont requis");
      return;
    }

    setTimelineLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/timeline", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingEntry),
      });

      if (response.ok) {
        const data = await response.json();
        setTimelineEntries((prev) =>
          prev.map((entry) =>
            entry.id === editingEntry.id ? data.data : entry,
          ),
        );
        setEditingEntry(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Error updating timeline entry:", err);
      setError("Erreur lors de la mise à jour de l'entrée");
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleDeleteTimelineEntry = async (id: string) => {
    setTimelineLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/timeline?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setTimelineEntries((prev) => prev.filter((entry) => entry.id !== id));
        setDeleteConfirmId(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Error deleting timeline entry:", err);
      setError("Erreur lors de la suppression de l'entrée");
    } finally {
      setTimelineLoading(false);
    }
  };

  // Specialty Frames CRUD operations
  const handleAddSpecialtyFrame = async () => {
    if (!newFrame.title || !newFrame.description) {
      setError("Titre et description sont requis");
      return;
    }

    setFramesLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/specialty-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newFrame),
      });

      if (response.ok) {
        const data = await response.json();
        setSpecialtyFrames((prev) => [...prev, data.data]);
        setNewFrame(emptySpecialtyFrame);
        setShowAddFrameForm(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de l'ajout");
      }
    } catch (err) {
      console.error("Error adding specialty frame:", err);
      setError("Erreur lors de l'ajout du cadre");
    } finally {
      setFramesLoading(false);
    }
  };

  const handleUpdateSpecialtyFrame = async () => {
    if (!editingFrame) return;

    if (!editingFrame.title || !editingFrame.description) {
      setError("Titre et description sont requis");
      return;
    }

    setFramesLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/specialty-frames", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingFrame),
      });

      if (response.ok) {
        const data = await response.json();
        setSpecialtyFrames((prev) =>
          prev.map((frame) =>
            frame.id === editingFrame.id ? data.data : frame,
          ),
        );
        setEditingFrame(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Error updating specialty frame:", err);
      setError("Erreur lors de la mise à jour du cadre");
    } finally {
      setFramesLoading(false);
    }
  };

  const handleDeleteSpecialtyFrame = async (id: string) => {
    setFramesLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/specialty-frames?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSpecialtyFrames((prev) => prev.filter((frame) => frame.id !== id));
        setDeleteFrameConfirmId(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Error deleting specialty frame:", err);
      setError("Erreur lors de la suppression du cadre");
    } finally {
      setFramesLoading(false);
    }
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
        {activeTab !== "timeline" && activeTab !== "specialties" && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder tout"}
          </button>
        )}
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
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "timeline"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Mon Parcours (Timeline)
          </button>
          <button
            onClick={() => setActiveTab("specialties")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "specialties"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Spécialités (Accueil)
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
                rows={8}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground resize-y min-h-[150px]"
                placeholder="Racontez votre histoire personnelle..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                <strong>1 Entrée</strong> = saut de ligne simple |{" "}
                <strong>2 Entrées</strong> = nouveau paragraphe (espacement
                visible)
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
                rows={8}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground resize-y min-h-[150px]"
                placeholder="Expliquez pourquoi vous avez choisi le développement..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                <strong>1 Entrée</strong> = saut de ligne simple |{" "}
                <strong>2 Entrées</strong> = nouveau paragraphe (espacement
                visible)
              </p>
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

            {/* Hero Description */}
            <div className="p-4 border border-border rounded-lg bg-background">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description de la page d&apos;accueil
              </label>
              <textarea
                value={content.homeHeroDescription}
                onChange={(e) =>
                  handleContentChange("homeHeroDescription", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                placeholder="Une phrase de description pour la page d'accueil..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cette phrase apparaît sous la phrase d&apos;accroche dans la
                section hero
              </p>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Mon Parcours (Timeline)
              </h3>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Ajouter une entrée
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Gérez les entrées de votre timeline professionnelle. Chaque entrée
              comprend 5 champs : Période, Titre, Description, Localisation et
              Compétences.
            </p>

            {/* Add new entry form */}
            {showAddForm && (
              <div className="p-6 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Nouvelle entrée timeline
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEntry(emptyTimelineEntry);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Period */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Période *
                    </label>
                    <input
                      type="text"
                      value={newEntry.period}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          period: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Ex: 2020-2022 ou Jan 2020 - Mar 2022"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={newEntry.title}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Ex: Senior Developer at TechCorp"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Description *
                    </label>
                    <textarea
                      value={newEntry.description}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                      placeholder="Ex: Led frontend team, built React applications"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={newEntry.location || ""}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Ex: Remote / Paris, France"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <Code className="h-4 w-4 text-primary" />
                      Compétences
                    </label>
                    <input
                      type="text"
                      value={newEntry.skills || ""}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          skills: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Ex: React, Node.js, TypeScript"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEntry(emptyTimelineEntry);
                    }}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddTimelineEntry}
                    disabled={timelineLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {timelineLoading ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </div>
            )}

            {/* Timeline entries list */}
            <div className="space-y-4">
              {timelineEntries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune entrée dans la timeline.</p>
                  <p className="text-sm">
                    Cliquez sur &quot;Ajouter une entrée&quot; pour commencer.
                  </p>
                </div>
              ) : (
                timelineEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="p-4 border border-border rounded-lg bg-background"
                  >
                    {editingEntry?.id === entry.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">
                            Modification en cours
                          </span>
                          <button
                            onClick={() => setEditingEntry(null)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Period */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              Période *
                            </label>
                            <input
                              type="text"
                              value={editingEntry.period}
                              onChange={(e) =>
                                setEditingEntry((prev) =>
                                  prev
                                    ? { ...prev, period: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                            />
                          </div>

                          {/* Title */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                              <Briefcase className="h-4 w-4 text-primary" />
                              Titre *
                            </label>
                            <input
                              type="text"
                              value={editingEntry.title}
                              onChange={(e) =>
                                setEditingEntry((prev) =>
                                  prev
                                    ? { ...prev, title: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                            />
                          </div>

                          {/* Description */}
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                              <FileText className="h-4 w-4 text-primary" />
                              Description *
                            </label>
                            <textarea
                              value={editingEntry.description}
                              onChange={(e) =>
                                setEditingEntry((prev) =>
                                  prev
                                    ? { ...prev, description: e.target.value }
                                    : null,
                                )
                              }
                              rows={3}
                              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                            />
                          </div>

                          {/* Location */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              Localisation
                            </label>
                            <input
                              type="text"
                              value={editingEntry.location || ""}
                              onChange={(e) =>
                                setEditingEntry((prev) =>
                                  prev
                                    ? { ...prev, location: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                            />
                          </div>

                          {/* Skills */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                              <Code className="h-4 w-4 text-primary" />
                              Compétences
                            </label>
                            <input
                              type="text"
                              value={editingEntry.skills || ""}
                              onChange={(e) =>
                                setEditingEntry((prev) =>
                                  prev
                                    ? { ...prev, skills: e.target.value }
                                    : null,
                                )
                              }
                              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setEditingEntry(null)}
                            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleUpdateTimelineEntry}
                            disabled={timelineLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            {timelineLoading ? "Sauvegarde..." : "Sauvegarder"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {entry.title}
                              </h4>
                              <p className="text-sm text-primary">
                                {entry.period}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {deleteConfirmId === entry.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleDeleteTimelineEntry(entry.id)
                                  }
                                  disabled={timelineLoading}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                  Confirmer
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 text-xs border border-border rounded hover:bg-accent transition-colors"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(entry.id)}
                                className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-muted-foreground">
                          {entry.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
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
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "specialties" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                Spécialités (Page Accueil)
              </h3>
              <button
                onClick={() => setShowAddFrameForm(true)}
                disabled={showAddFrameForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Ajouter une spécialité
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Gérez les cadres de spécialités affichés sur la page
              d&apos;accueil. Ces cartes s&apos;affichent dans une grille
              responsive à 3 colonnes.
            </p>

            {/* Add new frame form */}
            {showAddFrameForm && (
              <div className="p-6 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Nouvelle spécialité
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddFrameForm(false);
                      setNewFrame(emptySpecialtyFrame);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-4">
                  {/* Icon selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Icône
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() =>
                            setNewFrame((prev) => ({ ...prev, icon }))
                          }
                          className={`p-2 text-xl rounded-lg transition-colors ${
                            newFrame.icon === icon
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent/30 hover:bg-accent/50"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={newFrame.title}
                      onChange={(e) =>
                        setNewFrame((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                      placeholder="Ex: Automatisation n8n"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newFrame.description}
                      onChange={(e) =>
                        setNewFrame((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                      placeholder="Description de la spécialité..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAddFrameForm(false);
                      setNewFrame(emptySpecialtyFrame);
                    }}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddSpecialtyFrame}
                    disabled={framesLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {framesLoading ? "Ajout..." : "Ajouter"}
                  </button>
                </div>
              </div>
            )}

            {/* Specialty frames list */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {specialtyFrames.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune spécialité configurée.</p>
                  <p className="text-sm">
                    Cliquez sur &quot;Ajouter une spécialité&quot; pour
                    commencer.
                  </p>
                </div>
              ) : (
                specialtyFrames.map((frame, index) => (
                  <div
                    key={frame.id}
                    className="p-4 border border-border rounded-lg bg-background"
                  >
                    {editingFrame?.id === frame.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-primary">
                            Modification
                          </span>
                          <button
                            onClick={() => setEditingFrame(null)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Icon selection */}
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">
                            Icône
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {iconOptions.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() =>
                                  setEditingFrame((prev) =>
                                    prev ? { ...prev, icon } : null,
                                  )
                                }
                                className={`p-1.5 text-lg rounded transition-colors ${
                                  editingFrame.icon === icon
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-accent/30 hover:bg-accent/50"
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">
                            Titre
                          </label>
                          <input
                            type="text"
                            value={editingFrame.title}
                            onChange={(e) =>
                              setEditingFrame((prev) =>
                                prev
                                  ? { ...prev, title: e.target.value }
                                  : null,
                              )
                            }
                            className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-lg text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">
                            Description
                          </label>
                          <textarea
                            value={editingFrame.description}
                            onChange={(e) =>
                              setEditingFrame((prev) =>
                                prev
                                  ? { ...prev, description: e.target.value }
                                  : null,
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-lg text-foreground resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingFrame(null)}
                            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleUpdateSpecialtyFrame}
                            disabled={framesLoading}
                            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                          >
                            {framesLoading ? "..." : "Sauvegarder"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {frame.icon || "⚡"}
                            </span>
                            <div>
                              <span className="text-xs text-muted-foreground">
                                #{index + 1}
                              </span>
                              <h4 className="font-semibold text-foreground">
                                {frame.title}
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingFrame(frame)}
                              className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {deleteFrameConfirmId === frame.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleDeleteSpecialtyFrame(frame.id)
                                  }
                                  disabled={framesLoading}
                                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                  Oui
                                </button>
                                <button
                                  onClick={() => setDeleteFrameConfirmId(null)}
                                  className="px-2 py-1 text-xs border border-border rounded hover:bg-accent"
                                >
                                  Non
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setDeleteFrameConfirmId(frame.id)
                                }
                                className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {frame.description}
                        </p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Info box */}
            <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Les
                spécialités s&apos;affichent sur la page d&apos;accueil dans une
                grille responsive. Sur desktop (3 colonnes), tablette (2
                colonnes), mobile (1 colonne).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Save button at bottom */}
      {activeTab !== "timeline" && activeTab !== "specialties" && (
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
      )}
    </div>
  );
}
