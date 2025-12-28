"use client";

import Link from "next/link";
import { useState } from "react";

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

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "Publié", color: "bg-green-500/20 text-green-500" },
  draft: { label: "Brouillon", color: "bg-yellow-500/20 text-yellow-500" },
};

export default function AdminBlogPage() {
  const [posts] = useState(demoPosts);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const handleDelete = () => {
    setShowDeleteModal(null);
  };

  return (
    <div className="space-y-6">
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
                onClick={handleDelete}
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
