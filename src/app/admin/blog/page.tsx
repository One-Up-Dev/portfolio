"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RetroLoader } from "@/components/ui/retro-spinner";
import { Calendar, Clock } from "lucide-react";

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

interface ScheduleModal {
  postId: string;
  postTitle: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "Publié", color: "bg-green-500/20 text-green-500" },
  draft: { label: "Brouillon", color: "bg-yellow-500/20 text-yellow-500" },
  scheduled: { label: "Programmé", color: "bg-blue-500/20 text-blue-500" },
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<ScheduleModal | null>(
    null,
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
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

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showDeleteModal) setShowDeleteModal(null);
        if (scheduleModal) setScheduleModal(null);
      }
    };

    if (showDeleteModal || scheduleModal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showDeleteModal, scheduleModal]);

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

  const handleStatusClick = (post: BlogPost) => {
    if (post.status === "published") {
      // If published, directly unpublish
      handleStatusToggle(post.id, "draft");
    } else {
      // If draft, show schedule modal
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().slice(0, 5);
      setScheduleDate(dateStr);
      setScheduleTime(timeStr);
      setScheduleModal({ postId: post.id, postTitle: post.title });
    }
  };

  const handleStatusToggle = async (
    id: string,
    newStatus: string,
    publishedAt?: string,
  ) => {
    try {
      const body: { status: string; publishedAt?: string } = {
        status: newStatus,
      };
      if (publishedAt) {
        body.publishedAt = publishedAt;
      }

      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
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

      setSuccessMessage(data.message || "Statut mis à jour!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling status:", error);
      setErrorMessage("Erreur lors de la mise à jour du statut");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handlePublishNow = () => {
    if (scheduleModal) {
      handleStatusToggle(scheduleModal.postId, "published");
      setScheduleModal(null);
    }
  };

  const handleSchedulePublish = () => {
    if (scheduleModal && scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      handleStatusToggle(
        scheduleModal.postId,
        "published",
        scheduledDateTime.toISOString(),
      );
      setScheduleModal(null);
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

  // Check if a post is scheduled (published date in the future)
  const getDisplayStatus = (post: BlogPost) => {
    if (post.status === "published" && post.publishedAt) {
      const publishDate = new Date(post.publishedAt);
      if (publishDate > new Date()) {
        return "scheduled";
      }
    }
    return post.status;
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
                posts.map((post) => {
                  const displayStatus = getDisplayStatus(post);
                  return (
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
                          onClick={() => handleStatusClick(post)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${
                            statusLabels[displayStatus]?.color ||
                            "bg-gray-500/20 text-gray-500"
                          }`}
                          title={
                            displayStatus === "published"
                              ? "Cliquer pour dépublier"
                              : "Cliquer pour publier"
                          }
                        >
                          {displayStatus === "scheduled" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {statusLabels[displayStatus]?.label || post.status}
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
                        <div className="flex flex-col">
                          <span>
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                          {displayStatus === "scheduled" &&
                            post.publishedAt && (
                              <span className="text-xs text-blue-400">
                                {new Date(post.publishedAt).toLocaleTimeString(
                                  "fr-FR",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            )}
                        </div>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total articles</p>
          <p className="text-2xl font-bold text-foreground">{posts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Publiés</p>
          <p className="text-2xl font-bold text-green-500">
            {posts.filter((p) => getDisplayStatus(p) === "published").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Programmés</p>
          <p className="text-2xl font-bold text-blue-500">
            {posts.filter((p) => getDisplayStatus(p) === "scheduled").length}
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

      {/* Schedule/Publish Modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Publier l&apos;article
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              &quot;{scheduleModal.postTitle}&quot;
            </p>

            {/* Schedule options */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>Programmer la publication</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSchedulePublish}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Programmer
              </button>
              <button
                onClick={handlePublishNow}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Publier maintenant
              </button>
              <button
                onClick={() => setScheduleModal(null)}
                className="w-full px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
