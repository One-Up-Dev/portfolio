"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Demo projects data
const demoProjects = [
  {
    id: "1",
    title: "Portfolio ONEUP",
    slug: "portfolio-oneup",
    status: "termine",
    visible: true,
    technologies: ["Next.js", "TypeScript", "Tailwind"],
    createdAt: "2024-12-20",
    views: 342,
  },
  {
    id: "2",
    title: "App de gestion",
    slug: "app-gestion",
    status: "en_cours",
    visible: true,
    technologies: ["React", "Node.js", "PostgreSQL"],
    createdAt: "2024-12-15",
    views: 256,
  },
  {
    id: "3",
    title: "Bot Discord",
    slug: "bot-discord",
    status: "termine",
    visible: true,
    technologies: ["Python", "Discord.py"],
    createdAt: "2024-12-10",
    views: 189,
  },
  {
    id: "4",
    title: "API REST",
    slug: "api-rest",
    status: "abandonne",
    visible: false,
    technologies: ["Node.js", "Express"],
    createdAt: "2024-11-28",
    views: 45,
  },
];

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  visible: boolean;
  technologies: string[];
  createdAt: string;
  views: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  en_cours: { label: "En cours", color: "bg-yellow-500/20 text-yellow-500" },
  termine: { label: "Terminé", color: "bg-green-500/20 text-green-500" },
  abandonne: { label: "Abandonné", color: "bg-red-500/20 text-red-500" },
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Load projects from localStorage on mount
  useEffect(() => {
    const loadProjects = () => {
      try {
        const savedProjects = localStorage.getItem("demo_projects");
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          // Combine demo projects with saved projects
          setProjects([...demoProjects, ...parsed]);
        }
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    };
    loadProjects();
  }, []);

  const handleDelete = (id: string) => {
    // Check if it's a demo project (IDs 1-4 are demo)
    const isDemoProject = ["1", "2", "3", "4"].includes(id);

    if (isDemoProject) {
      // For demo projects, just close the modal (don't actually delete)
      setShowDeleteModal(null);
      return;
    }

    // Delete from localStorage
    try {
      const savedProjects = localStorage.getItem("demo_projects");
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        const filtered = parsed.filter((p: Project) => p.id !== id);
        localStorage.setItem("demo_projects", JSON.stringify(filtered));

        // Update state
        setProjects([...demoProjects, ...filtered]);
        setSuccessMessage("Projet supprimé avec succès!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }

    setShowDeleteModal(null);
  };

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
        <Link
          href="/admin/projets/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span>+</span>
          <span>Nouveau projet</span>
        </Link>
      </div>

      {/* Projects Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/50 border-b border-border">
              <tr>
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
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-accent/30 transition-colors"
                >
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
                        statusLabels[project.status]?.color
                      }`}
                    >
                      {statusLabels[project.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech) => (
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
                    <span
                      className={`inline-flex items-center gap-1 text-sm ${
                        project.visible
                          ? "text-green-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {project.visible ? "✓ Oui" : "✗ Non"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {project.views}
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
                        onClick={() => setShowDeleteModal(project.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les projets
          affichés sont des exemples. Connectez une base de données pour gérer
          vos vrais projets.
        </p>
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
    </div>
  );
}
