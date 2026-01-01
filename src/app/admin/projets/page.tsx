"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  visible: boolean;
  technologies: string[];
  createdAt: string;
  viewCount: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  en_cours: { label: "En cours", color: "bg-yellow-500/20 text-yellow-500" },
  termine: { label: "Terminé", color: "bg-green-500/20 text-green-500" },
  abandonne: { label: "Abandonné", color: "bg-red-500/20 text-red-500" },
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load projects from API on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/projects", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setProjects(data.data || []);
        } else {
          console.error("Failed to load projects");
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleDuplicate = async (project: Project) => {
    try {
      const response = await fetch(
        `/api/admin/projects/${project.id}/duplicate`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        const data = await response.json();
        // Add the duplicated project to the list
        setProjects([...projects, data.data]);
        setSuccessMessage("Projet dupliqué avec succès!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("Erreur lors de la duplication du projet");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error duplicating project:", error);
      setSuccessMessage("Erreur lors de la duplication du projet");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleToggleVisibility = async (project: Project) => {
    try {
      const response = await fetch(
        `/api/admin/projects/${project.id}/visibility`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ visible: !project.visible }),
        },
      );

      if (response.ok) {
        // Update local state
        setProjects(
          projects.map((p) =>
            p.id === project.id ? { ...p, visible: !p.visible } : p,
          ),
        );
        setSuccessMessage(
          project.visible
            ? "Projet masqué avec succès!"
            : "Projet rendu visible avec succès!",
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("Erreur lors de la modification de la visibilité");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      setSuccessMessage("Erreur lors de la modification de la visibilité");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDeleteModal) {
        setShowDeleteModal(null);
      }
    };

    if (showDeleteModal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showDeleteModal]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Update state
        setProjects(projects.filter((p) => p.id !== id));
        setSuccessMessage("Projet supprimé avec succès!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("Erreur lors de la suppression du projet");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setSuccessMessage("Erreur lors de la suppression du projet");
      setTimeout(() => setSuccessMessage(""), 3000);
    }

    setShowDeleteModal(null);
  };

  // Toggle project selection for bulk delete
  const toggleProjectSelection = (id: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedProjects(newSelection);
  };

  // Toggle all projects selection
  const toggleAllSelection = () => {
    if (selectedProjects.size === projects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(projects.map((p) => p.id)));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedProjects).map((id) =>
        fetch(`/api/admin/projects/${id}`, {
          method: "DELETE",
          credentials: "include",
        }),
      );

      await Promise.all(deletePromises);

      // Update state
      setProjects(projects.filter((p) => !selectedProjects.has(p.id)));
      setSelectedProjects(new Set());
      setSuccessMessage(
        `${selectedProjects.size} projet(s) supprimé(s) avec succès!`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error bulk deleting projects:", error);
      setSuccessMessage("Erreur lors de la suppression des projets");
      setTimeout(() => setSuccessMessage(""), 3000);
    }

    setShowBulkDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RetroLoader size="lg" text="CHARGEMENT" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div
          className="bg-green-500/20 border border-green-500/50 text-green-500 rounded-lg p-4"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projets</h2>
          <p className="text-muted-foreground">
            Gérez vos projets et leur visibilité
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedProjects.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <span>🗑️</span>
              <span>Supprimer ({selectedProjects.size})</span>
            </button>
          )}
          <Link
            href="/admin/projets/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span>+</span>
            <span>Nouveau projet</span>
          </Link>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedProjects.size === projects.length &&
                      projects.length > 0
                    }
                    onChange={toggleAllSelection}
                    className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                    aria-label="Sélectionner tous les projets"
                  />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Titre
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Technologies
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Visible
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Vues
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Aucun projet pour le moment. Créez votre premier projet !
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr
                    key={project.id}
                    className={`hover:bg-accent/30 transition-colors ${selectedProjects.has(project.id) ? "bg-accent/20" : ""}`}
                  >
                    <td className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProjects.has(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                        aria-label={`Sélectionner ${project.title}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {project.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          /{project.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          statusLabels[project.status]?.color ||
                          "bg-gray-500/20 text-gray-500"
                        }`}
                      >
                        {statusLabels[project.status]?.label || project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(project.technologies || [])
                          .slice(0, 3)
                          .map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex px-2 py-0.5 text-xs bg-accent text-muted-foreground rounded"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleVisibility(project)}
                        className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors ${
                          project.visible
                            ? "text-green-500 hover:bg-green-500/10"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                        title={
                          project.visible
                            ? "Cliquer pour masquer"
                            : "Cliquer pour rendre visible"
                        }
                      >
                        {project.visible ? "✓ Oui" : "✗ Non"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {project.viewCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/projets/${project.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded transition-colors"
                          title="Modifier"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDuplicate(project)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded transition-colors"
                          title="Dupliquer"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(project.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est
              irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Confirmer la suppression multiple
            </h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer {selectedProjects.size}{" "}
              projet(s) ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Supprimer {selectedProjects.size} projet(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
