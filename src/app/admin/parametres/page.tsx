"use client";

import { useState, useRef } from "react";

// Password validation function
function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Au moins 8 caractères");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins une majuscule");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Au moins une minuscule");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Au moins un chiffre");
  }

  return { valid: errors.length === 0, errors };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    valid: boolean;
    errors: string[];
  }>({ valid: true, errors: [] });

  // Handle password change
  const handlePasswordChange = () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validate current password (check localStorage for changed password)
    const storedPassword = localStorage.getItem("demo_password") || "Admin123!";
    if (currentPassword !== storedPassword) {
      setPasswordError("Mot de passe actuel incorrect");
      return;
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setPasswordError(
        "Le mot de passe ne respecte pas les exigences: " +
          validation.errors.join(", "),
      );
      return;
    }

    // Check confirmation matches
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    // In demo mode, just simulate success and update localStorage
    try {
      const session = JSON.parse(localStorage.getItem("admin_session") || "{}");
      session.passwordHash = btoa(newPassword); // Simple encoding for demo
      localStorage.setItem("admin_session", JSON.stringify(session));
      localStorage.setItem("demo_password", newPassword); // Store new password for login

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError("Erreur lors du changement de mot de passe");
      console.error(error);
    }
  };

  // Validate new password as user types
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (value.length > 0) {
      setPasswordValidation(validatePassword(value));
    } else {
      setPasswordValidation({ valid: true, errors: [] });
    }
  };

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

  // Import content from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate structure
        if (!importData.data) {
          throw new Error("Format de fichier invalide: données manquantes");
        }

        // Import projects
        if (
          importData.data.projects &&
          Array.isArray(importData.data.projects)
        ) {
          const existingProjects = JSON.parse(
            localStorage.getItem("demo_projects") || "[]",
          );
          const importedIds = new Set(
            existingProjects.map((p: { id: string }) => p.id),
          );

          // Add new projects that don't exist
          const newProjects = importData.data.projects.filter(
            (p: { id: string }) => !importedIds.has(p.id),
          );
          const mergedProjects = [...existingProjects, ...newProjects];
          localStorage.setItem("demo_projects", JSON.stringify(mergedProjects));
        }

        // Import blog posts
        if (
          importData.data.blogPosts &&
          Array.isArray(importData.data.blogPosts)
        ) {
          const existingPosts = JSON.parse(
            localStorage.getItem("demo_blog_posts") || "[]",
          );
          const importedIds = new Set(
            existingPosts.map((p: { id: string }) => p.id),
          );

          // Add new posts that don't exist
          const newPosts = importData.data.blogPosts.filter(
            (p: { id: string }) => !importedIds.has(p.id),
          );
          const mergedPosts = [...existingPosts, ...newPosts];
          localStorage.setItem("demo_blog_posts", JSON.stringify(mergedPosts));
        }

        // Import skills
        if (importData.data.skills && Array.isArray(importData.data.skills)) {
          const existingSkills = JSON.parse(
            localStorage.getItem("demo_skills") || "[]",
          );
          const importedIds = new Set(
            existingSkills.map((s: { id: string }) => s.id),
          );

          // Add new skills that don't exist
          const newSkills = importData.data.skills.filter(
            (s: { id: string }) => !importedIds.has(s.id),
          );
          const mergedSkills = [...existingSkills, ...newSkills];
          localStorage.setItem("demo_skills", JSON.stringify(mergedSkills));
        }

        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 5000);
      } catch (error) {
        console.error("Import error:", error);
        setImportError(
          error instanceof Error ? error.message : "Erreur lors de l'import",
        );
      }
    };

    reader.onerror = () => {
      setImportError("Erreur lors de la lecture du fichier");
    };

    reader.readAsText(file);

    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = "";
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

            {/* Success message */}
            {passwordSuccess && (
              <div
                className="bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg p-4"
                role="alert"
              >
                Mot de passe modifié avec succès!
              </div>
            )}

            {/* Error message */}
            {passwordError && (
              <div
                className="bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg p-4"
                role="alert"
              >
                {passwordError}
              </div>
            )}

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
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground ${
                        newPassword.length > 0 && !passwordValidation.valid
                          ? "border-red-500"
                          : "border-input"
                      }`}
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">
                        Exigences du mot de passe:
                      </p>
                      <ul className="text-xs space-y-1">
                        <li
                          className={
                            newPassword.length >= 8
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {newPassword.length >= 8 ? "✓" : "○"} Au moins 8
                          caractères
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(newPassword)
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {/[A-Z]/.test(newPassword) ? "✓" : "○"} Au moins une
                          majuscule
                        </li>
                        <li
                          className={
                            /[a-z]/.test(newPassword)
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {/[a-z]/.test(newPassword) ? "✓" : "○"} Au moins une
                          minuscule
                        </li>
                        <li
                          className={
                            /[0-9]/.test(newPassword)
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {/[0-9]/.test(newPassword) ? "✓" : "○"} Au moins un
                          chiffre
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground ${
                        confirmPassword.length > 0 &&
                        confirmPassword !== newPassword
                          ? "border-red-500"
                          : "border-input"
                      }`}
                    />
                    {confirmPassword.length > 0 &&
                      confirmPassword !== newPassword && (
                        <p className="text-xs text-red-500 mt-1">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePasswordChange}
                className="w-fit px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
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
            {importSuccess && (
              <div
                className="bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg p-4"
                role="alert"
              >
                Import réussi! Le contenu a été restauré. Actualisez la page
                pour voir les changements.
              </div>
            )}
            {importError && (
              <div
                className="bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg p-4"
                role="alert"
              >
                Erreur d&apos;import: {importError}
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
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="inline-block px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  📤 Importer JSON
                </label>
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
