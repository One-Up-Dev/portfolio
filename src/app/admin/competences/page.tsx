"use client";

import { useState, useEffect } from "react";

interface Skill {
  id: string;
  name: string;
  icon: string;
}

interface SkillsData {
  frontend: Skill[];
  backend: Skill[];
  outils: Skill[];
  soft_skills: Skill[];
}

// Demo skills data
const demoSkills: SkillsData = {
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

const iconOptions = [
  "⚛️",
  "▲",
  "📘",
  "🎨",
  "🟢",
  "🐘",
  "🔌",
  "🔄",
  "🤖",
  "📦",
  "🎯",
  "💡",
  "⚡",
  "🌐",
  "🔧",
  "📊",
  "🎮",
  "💻",
  "🚀",
  "✨",
];

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillsData>(demoSkills);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] =
    useState<keyof SkillsData>("frontend");
  const [newSkillIcon, setNewSkillIcon] = useState("⚡");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load skills from localStorage on mount
  useEffect(() => {
    const loadSkills = () => {
      try {
        const savedSkills = localStorage.getItem("demo_skills");
        if (savedSkills) {
          const parsed = JSON.parse(savedSkills);
          // Merge demo skills with saved skills
          const merged: SkillsData = {
            frontend: [...demoSkills.frontend, ...(parsed.frontend || [])],
            backend: [...demoSkills.backend, ...(parsed.backend || [])],
            outils: [...demoSkills.outils, ...(parsed.outils || [])],
            soft_skills: [
              ...demoSkills.soft_skills,
              ...(parsed.soft_skills || []),
            ],
          };
          setSkills(merged);
        }
      } catch (error) {
        console.error("Error loading skills:", error);
      }
    };

    loadSkills();
  }, []);

  const handleAddSkill = () => {
    // Validation
    if (!newSkillName.trim()) {
      setErrorMessage("Le nom de la compétence est requis");
      return;
    }

    // Check for duplicates
    const categorySkills = skills[newSkillCategory];
    if (
      categorySkills.some(
        (s) => s.name.toLowerCase() === newSkillName.toLowerCase(),
      )
    ) {
      setErrorMessage("Cette compétence existe déjà dans cette catégorie");
      return;
    }

    // Create new skill
    const newSkill: Skill = {
      id: `user_${Date.now()}`,
      name: newSkillName.trim(),
      icon: newSkillIcon,
    };

    // Update state
    const updatedSkills = {
      ...skills,
      [newSkillCategory]: [...skills[newSkillCategory], newSkill],
    };
    setSkills(updatedSkills);

    // Save only user-created skills to localStorage
    try {
      const savedSkills = localStorage.getItem("demo_skills");
      const currentUserSkills = savedSkills
        ? JSON.parse(savedSkills)
        : { frontend: [], backend: [], outils: [], soft_skills: [] };
      currentUserSkills[newSkillCategory] = [
        ...(currentUserSkills[newSkillCategory] || []),
        newSkill,
      ];
      localStorage.setItem("demo_skills", JSON.stringify(currentUserSkills));
    } catch (error) {
      console.error("Error saving skill:", error);
    }

    // Reset form and close modal
    setNewSkillName("");
    setNewSkillCategory("frontend");
    setNewSkillIcon("⚡");
    setShowAddModal(false);
    setErrorMessage("");

    // Show success message
    setSuccessMessage("Compétence ajoutée avec succès !");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteSkill = (category: keyof SkillsData, skillId: string) => {
    // Only allow deleting user-created skills (those with id starting with "user_")
    if (!skillId.startsWith("user_")) {
      setErrorMessage(
        "Les compétences de démonstration ne peuvent pas être supprimées",
      );
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    // Update state
    const updatedSkills = {
      ...skills,
      [category]: skills[category].filter((s) => s.id !== skillId),
    };
    setSkills(updatedSkills);

    // Update localStorage
    try {
      const savedSkills = localStorage.getItem("demo_skills");
      if (savedSkills) {
        const currentUserSkills = JSON.parse(savedSkills);
        currentUserSkills[category] = (
          currentUserSkills[category] || []
        ).filter((s: Skill) => s.id !== skillId);
        localStorage.setItem("demo_skills", JSON.stringify(currentUserSkills));
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
    }

    setSuccessMessage("Compétence supprimée avec succès !");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message (global) */}
      {errorMessage && !showAddModal && (
        <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}

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
                    {skill.id.startsWith("user_") && (
                      <button
                        onClick={() =>
                          handleDeleteSkill(
                            category as keyof SkillsData,
                            skill.id,
                          )
                        }
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    )}
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
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSkill();
              }}
            >
              <div>
                <label
                  htmlFor="skill-name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Nom
                </label>
                <input
                  id="skill-name"
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                  placeholder="Ex: React"
                />
              </div>
              <div>
                <label
                  htmlFor="skill-category"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Catégorie
                </label>
                <select
                  id="skill-category"
                  value={newSkillCategory}
                  onChange={(e) =>
                    setNewSkillCategory(e.target.value as keyof SkillsData)
                  }
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="outils">Outils</option>
                  <option value="soft_skills">Soft Skills</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Icône
                </label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewSkillIcon(icon)}
                      className={`p-2 text-xl rounded-lg transition-colors ${
                        newSkillIcon === icon
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent/30 hover:bg-accent/50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              {errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setErrorMessage("");
                    setNewSkillName("");
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
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
