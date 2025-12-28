"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [exportSuccess, setExportSuccess] = useState(false);

  // Export all content to JSON
  const handleExport = () => {
    try {
      // Get all data from localStorage
      const projects = JSON.parse(
        localStorage.getItem("demo_projects") || "[]",
      );
      const blogPosts = JSON.parse(
        localStorage.getItem("demo_blog_posts") || "[]",
      );
      const skills = JSON.parse(localStorage.getItem("demo_skills") || "[]");

      // Create export object
      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        data: {
          projects,
          blogPosts,
          skills,
        },
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oneup-portfolio-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const tabs = [
    { id: "general", label: "Général", icon: "⚙️" },
    { id: "compte", label: "Compte", icon: "👤" },
    { id: "integrations", label: "Intégrations", icon: "🔌" },
    { id: "sauvegardes", label: "Sauvegardes", icon: "💾" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres</h2>
        <p className="text-muted-foreground">Configurez votre portfolio</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Paramètres généraux
            </h3>
            <div className="grid gap-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Titre du site
                </label>
                <input
                  type="text"
                  defaultValue="ONEUP Portfolio"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue="Portfolio de développeur full-stack en reconversion professionnelle."
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  defaultValue="contact@oneup.dev"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                />
              </div>
              <button className="w-fit px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {activeTab === "compte" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Compte administrateur
            </h3>
            <div className="grid gap-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="admin@oneup.dev"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                />
              </div>
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-4">
                  Changer le mot de passe
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                    />
                  </div>
                </div>
              </div>
              <button className="w-fit px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Mettre à jour
              </button>
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Intégrations API
            </h3>
            <div className="grid gap-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Clé API Claude (Anthropic)
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pour la génération de contenu IA
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Clé API Resend
                </label>
                <input
                  type="password"
                  placeholder="re_..."
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pour l&apos;envoi d&apos;emails
                </p>
              </div>
              <button className="w-fit px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {activeTab === "sauvegardes" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
              Sauvegardes et Export
            </h3>
            {exportSuccess && (
              <div
                className="bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg p-4"
                role="alert"
              >
                Export réussi! Le fichier JSON a été téléchargé.
              </div>
            )}
            <div className="grid gap-6 max-w-xl">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Exporter tout le contenu
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Téléchargez une copie de tous vos projets, articles et
                  compétences au format JSON.
                </p>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
                >
                  📥 Exporter JSON
                </button>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">
                  Importer du contenu
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Restaurez votre contenu depuis un fichier JSON exporté.
                </p>
                <button className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                  📤 Importer JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les
          modifications ne seront pas persistées.
        </p>
      </div>
    </div>
  );
}
