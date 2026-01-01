"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/retro-toast";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface Skill {
  id: string;
  name: string;
  category: string;
  iconUrl: string | null;
  proficiency: number;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

interface SkillsData {
  frontend: Skill[];
  backend: Skill[];
  outils: Skill[];
  soft_skills: Skill[];
}

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
  const { addToast } = useToast();
  const [skills, setSkills] = useState<SkillsData>({
    frontend: [],
    backend: [],
    outils: [],
    soft_skills: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] =
    useState<keyof SkillsData>("frontend");
  const [newSkillIcon, setNewSkillIcon] = useState("⚡");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // Drag and drop state
  const [draggedSkill, setDraggedSkill] = useState<Skill | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  // Edit proficiency state
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingProficiency, setEditingProficiency] = useState<number>(75);

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/skills");
        if (!response.ok) {
          throw new Error("Failed to fetch skills");
        }
        const result = await response.json();
        if (result.success) {
          // Ensure all categories exist even if empty
          const data: SkillsData = {
            frontend: result.data.frontend || [],
            backend: result.data.backend || [],
            outils: result.data.outils || [],
            soft_skills: result.data.soft_skills || [],
          };
          setSkills(data);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        addToast("Erreur lors du chargement des compétences", "error");
        setErrorMessage("Erreur lors du chargement des compétences");
        setTimeout(() => setErrorMessage(""), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [addToast]);

  const handleAddSkill = async () => {
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

    setSaving(true);
    try {
      const response = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkillName.trim(),
          category: newSkillCategory,
          iconUrl: newSkillIcon,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create skill");
      }

      const result = await response.json();
      if (result.success) {
        // Add to local state
        setSkills((prev) => ({
          ...prev,
          [newSkillCategory]: [...prev[newSkillCategory], result.data],
        }));

        // Reset form and close modal
        setNewSkillName("");
        setNewSkillCategory("frontend");
        setNewSkillIcon("⚡");
        setShowAddModal(false);
        setErrorMessage("");

        // Show success message
        addToast("Compétence ajoutée avec succès !", "success");
        setSuccessMessage("Compétence ajoutée avec succès !");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error creating skill:", error);
      addToast("Erreur lors de la création de la compétence", "error");
      setErrorMessage("Erreur lors de la création de la compétence");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (
    category: keyof SkillsData,
    skillId: string,
  ) => {
    try {
      const response = await fetch(`/api/admin/skills/${skillId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete skill");
      }

      // Update local state
      setSkills((prev) => ({
        ...prev,
        [category]: prev[category].filter((s) => s.id !== skillId),
      }));

      addToast("Compétence supprimée avec succès !", "success");
      setSuccessMessage("Compétence supprimée avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting skill:", error);
      addToast("Erreur lors de la suppression de la compétence", "error");
      setErrorMessage("Erreur lors de la suppression de la compétence");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Handle proficiency update
  const handleUpdateProficiency = async (
    category: keyof SkillsData,
    skillId: string,
    proficiency: number,
  ) => {
    try {
      const response = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: [{ id: skillId, proficiency }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update proficiency");
      }

      // Update local state
      setSkills((prev) => ({
        ...prev,
        [category]: prev[category].map((s) =>
          s.id === skillId ? { ...s, proficiency } : s,
        ),
      }));

      setEditingSkillId(null);
      addToast("Niveau mis à jour avec succès !", "success");
      setSuccessMessage("Niveau mis à jour avec succès !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating proficiency:", error);
      addToast("Erreur lors de la mise à jour du niveau", "error");
      setErrorMessage("Erreur lors de la mise à jour du niveau");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const startEditingProficiency = (skill: Skill) => {
    setEditingSkillId(skill.id);
    setEditingProficiency(skill.proficiency);
  };

  const cancelEditingProficiency = () => {
    setEditingSkillId(null);
  };

  // Drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    skill: Skill,
    category: string,
  ) => {
    setDraggedSkill(skill);
    setDraggedCategory(category);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;

    // Set drag image
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", skill.id);

    // Add dragging class after a small delay to avoid it affecting the drag image
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.classList.add("opacity-50");
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove("opacity-50");
    }
    setDraggedSkill(null);
    setDraggedCategory(null);
    setDragOverIndex(null);
    setDragOverCategory(null);
    dragNodeRef.current = null;
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
    category: string,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedCategory === category) {
      setDragOverIndex(index);
      setDragOverCategory(category);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDragOverCategory(null);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number,
    category: string,
  ) => {
    e.preventDefault();

    if (!draggedSkill || draggedCategory !== category) {
      handleDragEnd();
      return;
    }

    const categorySkills = [...skills[category as keyof SkillsData]];
    const draggedIndex = categorySkills.findIndex(
      (s) => s.id === draggedSkill.id,
    );

    if (draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    // Remove from old position and insert at new position
    const [removed] = categorySkills.splice(draggedIndex, 1);
    categorySkills.splice(dropIndex, 0, removed);

    // Update orderIndex for all skills in this category
    const updatedSkills = categorySkills.map((skill, index) => ({
      ...skill,
      orderIndex: index,
    }));

    // Update local state immediately
    setSkills((prev) => ({
      ...prev,
      [category]: updatedSkills,
    }));

    handleDragEnd();

    // Save to database
    try {
      const response = await fetch("/api/admin/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: updatedSkills.map((s) => ({
            id: s.id,
            orderIndex: s.orderIndex,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder skills");
      }

      addToast("Ordre des compétences mis à jour !", "success");
      setSuccessMessage("Ordre des compétences mis à jour !");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error reordering skills:", error);
      addToast("Erreur lors de la réorganisation", "error");
      setErrorMessage("Erreur lors de la réorganisation");
      setTimeout(() => setErrorMessage(""), 3000);
      // Refetch to reset state
      try {
        const response = await fetch("/api/admin/skills");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const data: SkillsData = {
              frontend: result.data.frontend || [],
              backend: result.data.backend || [],
              outils: result.data.outils || [],
              soft_skills: result.data.soft_skills || [],
            };
            setSkills(data);
          }
        }
      } catch (refetchError) {
        console.error("Error refetching skills:", refetchError);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RetroLoader size="lg" text="CHARGEMENT" />
      </div>
    );
  }

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
            Gérez vos compétences par catégorie. Glissez-déposez pour
            réorganiser.
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
        {(Object.keys(categoryLabels) as Array<keyof SkillsData>).map(
          (category) => (
            <div
              key={category}
              className="bg-card border border-border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {categoryLabels[category]}
              </h3>
              <div className="space-y-2 min-h-[100px]">
                {skills[category].length === 0 ? (
                  <div className="text-muted-foreground text-sm italic py-4 text-center">
                    Aucune compétence dans cette catégorie
                  </div>
                ) : (
                  skills[category].map((skill, index) => (
                    <div
                      key={skill.id}
                      draggable={editingSkillId !== skill.id}
                      onDragStart={(e) => handleDragStart(e, skill, category)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index, category)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index, category)}
                      className={`flex flex-col p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors group ${
                        editingSkillId !== skill.id
                          ? "cursor-grab active:cursor-grabbing"
                          : ""
                      } ${
                        dragOverIndex === index && dragOverCategory === category
                          ? "border-2 border-primary border-dashed"
                          : "border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground cursor-grab">
                            ⋮⋮
                          </span>
                          <span className="text-xl">
                            {skill.iconUrl || "⚡"}
                          </span>
                          <span className="text-foreground">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingSkillId === skill.id ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingProficiency}
                                onChange={(e) =>
                                  setEditingProficiency(
                                    Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        parseInt(e.target.value) || 0,
                                      ),
                                    ),
                                  )
                                }
                                className="w-16 px-2 py-1 text-sm bg-background border border-input rounded text-foreground text-center"
                                aria-label="Pourcentage de maîtrise"
                              />
                              <span className="text-sm text-muted-foreground">
                                %
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateProficiency(
                                    category,
                                    skill.id,
                                    editingProficiency,
                                  )
                                }
                                className="p-1 text-green-500 hover:text-green-400 transition-colors"
                                title="Sauvegarder"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEditingProficiency}
                                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title="Annuler"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingProficiency(skill)}
                                className="px-2 py-1 text-sm bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                                title="Modifier le niveau"
                              >
                                {skill.proficiency}%
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSkill(category, skill.id)
                                }
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Progress bar preview */}
                      <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-retro-cyan transition-all duration-300"
                          style={{
                            width: `${editingSkillId === skill.id ? editingProficiency : skill.proficiency}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* Drag and Drop Hint */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Astuce:</strong> Glissez-déposez
          les compétences pour les réorganiser dans leur catégorie.
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
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
