"use client";

import { useState } from "react";

// Demo media files
const demoMedia = [
  {
    id: "1",
    name: "portfolio-hero.jpg",
    url: "/images/demo-1.jpg",
    size: "245 KB",
    type: "image/jpeg",
    uploadedAt: "2024-12-20",
  },
  {
    id: "2",
    name: "project-screenshot.png",
    url: "/images/demo-2.png",
    size: "512 KB",
    type: "image/png",
    uploadedAt: "2024-12-18",
  },
  {
    id: "3",
    name: "blog-cover.jpg",
    url: "/images/demo-3.jpg",
    size: "189 KB",
    type: "image/jpeg",
    uploadedAt: "2024-12-15",
  },
];

export default function AdminMediaPage() {
  const [media] = useState(demoMedia);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const selectedItem = media.find((m) => m.id === selectedMedia);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Médiathèque</h2>
          <p className="text-muted-foreground">Gérez vos images et fichiers</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <span>📤</span>
          <span>Upload</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMedia(item.id)}
              className={`aspect-square bg-accent/30 rounded-lg overflow-hidden border-2 transition-all hover:border-primary ${
                selectedMedia === item.id
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-transparent"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-accent to-accent/50">
                🖼️
              </div>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {media.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun fichier uploadé</p>
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les fichiers
          affichés sont des exemples. Connectez Vercel Blob pour uploader des
          fichiers.
        </p>
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Détails du fichier
              </h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Preview */}
            <div className="aspect-video bg-accent/30 rounded-lg flex items-center justify-center text-6xl mb-4">
              🖼️
            </div>

            {/* Info */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nom:</span>
                <span className="text-foreground">{selectedItem.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taille:</span>
                <span className="text-foreground">{selectedItem.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploadé:</span>
                <span className="text-foreground">
                  {selectedItem.uploadedAt}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors">
                📋 Copier URL
              </button>
              <button className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
