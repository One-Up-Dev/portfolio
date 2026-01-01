"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  tags: string[];
  createdAt: string;
  viewCount: number;
  publishedAt: string | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "Publié", color: "bg-green-500/20 text-green-500" },
  draft: { label: "Brouillon", color: "bg-yellow-500/20 text-yellow-500" },
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load posts from API on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/blog", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }

      const data = await response.json();
      setPosts(data.data || []);
    } catch (error) {
      console.error("Error loading posts:", error);
      setErrorMessage("Erreur lors du chargement des articles");
    } finally {
      setIsLoading(false);
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
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete blog post");
      }

      // Remove from state
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMessage("Article supprimé avec succès!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting post:", error);
      setErrorMessage("Erreur lors de la suppression de l'article");
      setTimeout(() => setErrorMessage(""), 3000);
    }

    setShowDeleteModal(null);
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();

      // Update state
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: newStatus, publishedAt: data.data?.publishedAt }
            : p,
        ),
      );

      setSuccessMessage(
        newStatus === "published"
          ? "Article publié avec succès!"
          : "Article mis en brouillon",
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling status:", error);
      setErrorMessage("Erreur lors de la mise à jour du statut");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR");
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
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

      {/* Error Message */}
      {errorMessage && (
        <div
          className="bg-destructive/20 border border-destructive/50 text-destructive rounded-lg p-4"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blog</h2>
          <p className="text-muted-foreground">Gérez vos articles de blog</p>
        </div>
        <Link
          href="/admin/blog/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span>+</span>
          <span>Nouvel article</span>
        </Link>
      </div>

      {/* Posts Table */}
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
                  Tags
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">
                  Date
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
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground">
                      <p className="text-lg mb-2">
                        Aucun article pour le moment
                      </p>
                      <Link
                        href="/admin/blog/nouveau"
                        className="text-primary hover:underline"
                      >
                        Créer votre premier article
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {post.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          /{post.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(post.id, post.status)}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${
                          statusLabels[post.status]?.color ||
                          "bg-gray-500/20 text-gray-500"
                        }`}
                        title={`Cliquer pour ${post.status === "published" ? "dépublier" : "publier"}`}
                      >
                        {statusLabels[post.status]?.label || post.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags || []).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex px-2 py-0.5 text-xs bg-accent text-muted-foreground rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {(post.tags || []).length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{post.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {post.viewCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded transition-colors"
                          title="Modifier"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(post.id)}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total articles</p>
          <p className="text-2xl font-bold text-foreground">{posts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Publiés</p>
          <p className="text-2xl font-bold text-green-500">
            {posts.filter((p) => p.status === "published").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Brouillons</p>
          <p className="text-2xl font-bold text-yellow-500">
            {posts.filter((p) => p.status === "draft").length}
          </p>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est
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
