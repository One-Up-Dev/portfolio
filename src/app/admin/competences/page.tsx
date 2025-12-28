"use client";

import { useState } from "react";

// Demo skills data
const demoSkills = {
  frontend: [
    { id: "1", name: "React", icon: "⚛️" },
    { id: "2", name: "Next.js", icon: "▲" },
    { id: "3", name: "TypeScript", icon: "📘" },
    { id: "4", name: "Tailwind CSS", icon: "🎨" },
  ],
  backend: [
    { id: "5", name: "Node.js", icon: "🟢" },
    { id: "6", name: "PostgreSQL", icon: "🐘" },
    { id: "7", name: "API REST", icon: "🔌" },
  ],
  outils: [
    { id: "8", name: "n8n", icon: "🔄" },
    { id: "9", name: "Claude Code", icon: "🤖" },
    { id: "10", name: "Git", icon: "📦" },
    { id: "11", name: "Figma", icon: "🎯" },
  ],
  soft_skills: [
    { id: "12", name: "Créativité", icon: "💡" },
    { id: "13", name: "Adaptabilité", icon: "🔄" },
  ],
};

const categoryLabels: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  outils: "Outils",
  soft_skills: "Soft Skills",
};

export default function AdminSkillsPage() {
  const [skills] = useState(demoSkills);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Compétences</h2>
          <p className="text-muted-foreground">
            Gérez vos compétences par catégorie
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span>+</span>
          <span>Ajouter une compétence</span>
        </button>
      </div>

      {/* Skills by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(skills).map(([category, categorySkills]) => (
          <div
            key={category}
            className="bg-card border border-border rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {categoryLabels[category]}
            </h3>
            <div className="space-y-2">
              {categorySkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{skill.icon}</span>
                    <span className="text-foreground">{skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les
          compétences affichées sont des exemples.
        </p>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Ajouter une compétence
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                  placeholder="Ex: React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Catégorie
                </label>
                <select className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground">
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="outils">Outils</option>
                  <option value="soft_skills">Soft Skills</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
