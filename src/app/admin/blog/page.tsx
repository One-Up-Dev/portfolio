"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Demo blog posts data
const demoPosts = [
  {
    id: "1",
    title: "Guide n8n pour débutants",
    slug: "guide-n8n-debutants",
    status: "published",
    tags: ["n8n", "automatisation"],
    createdAt: "2024-12-18",
    views: 567,
  },
  {
    id: "2",
    title: "Automatisation avec Claude",
    slug: "automatisation-claude",
    status: "published",
    tags: ["IA", "Claude", "productivité"],
    createdAt: "2024-12-15",
    views: 423,
  },
  {
    id: "3",
    title: "Vibe Coding expliqué",
    slug: "vibe-coding-explique",
    status: "draft",
    tags: ["développement", "philosophie"],
    createdAt: "2024-12-12",
    views: 0,
  },
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  tags: string[];
  createdAt: string;
  views: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "Publié", color: "bg-green-500/20 text-green-500" },
  draft: { label: "Brouillon", color: "bg-yellow-500/20 text-yellow-500" },
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(demoPosts);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Load posts from localStorage on mount
  useEffect(() => {
    const loadPosts = () => {
      try {
        // Load view counts from localStorage
        const viewCountsStr = localStorage.getItem("blog_view_counts");
        const viewCounts: Record<string, number> = viewCountsStr
          ? JSON.parse(viewCountsStr)
          : {};

        // Apply real view counts to demo posts
        const demoWithViews = demoPosts.map((p) => ({
          ...p,
          views: viewCounts[p.id] !== undefined ? viewCounts[p.id] : p.views,
        }));

        const savedPosts = localStorage.getItem("demo_blog_posts");
        if (savedPosts) {
          const parsed = JSON.parse(savedPosts);
          // Transform saved posts to match display format
          const formattedPosts = parsed.map(
            (post: {
              id: string;
              title: string;
              slug: string;
              status: string;
              tags: string[];
              createdAt: string;
              publishDate?: string;
              views: number;
            }) => ({
              id: post.id,
              title: post.title,
              slug: post.slug,
              status: post.status,
              tags: post.tags || [],
              createdAt:
                post.publishDate ||
                post.createdAt?.split("T")[0] ||
                new Date().toISOString().split("T")[0],
              views:
                viewCounts[post.id] !== undefined
                  ? viewCounts[post.id]
                  : post.views || 0,
            }),
          );
          // Combine demo posts with saved posts
          setPosts([...demoWithViews, ...formattedPosts]);
        } else {
          setPosts(demoWithViews);
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    };
    loadPosts();
  }, []);

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

  const handleDelete = (id: string) => {
    // Check if it's a demo post (IDs 1-3 are demo)
    const isDemoPost = ["1", "2", "3"].includes(id);

    if (isDemoPost) {
      // For demo posts, just close the modal (don't actually delete)
      setShowDeleteModal(null);
      return;
    }

    // Delete from localStorage
    try {
      const savedPosts = localStorage.getItem("demo_blog_posts");
      if (savedPosts) {
        const parsed = JSON.parse(savedPosts);
        const filtered = parsed.filter((p: BlogPost) => p.id !== id);
        localStorage.setItem("demo_blog_posts", JSON.stringify(filtered));

        // Transform and update state
        const formattedPosts = filtered.map(
          (post: {
            id: string;
            title: string;
            slug: string;
            status: string;
            tags: string[];
            createdAt: string;
            publishDate?: string;
            views: number;
          }) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            status: post.status,
            tags: post.tags || [],
            createdAt:
              post.publishDate ||
              post.createdAt?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
            views: post.views || 0,
          }),
        );
        setPosts([...demoPosts, ...formattedPosts]);
        setSuccessMessage("Article supprimé avec succès!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
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
              {posts.map((post) => (
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
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        statusLabels[post.status]?.color
                      }`}
                    >
                      {statusLabels[post.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-2 py-0.5 text-xs bg-accent text-muted-foreground rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {post.createdAt}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {post.views}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les articles
          affichés sont des exemples.
        </p>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer cet article ?
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
