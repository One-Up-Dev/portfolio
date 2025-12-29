"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  mimeType: string;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  createdAt: string;
}

// Allowed image MIME types (must match backend)
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// Forbidden file extensions (for client-side validation)
const FORBIDDEN_EXTENSIONS = [
  ".exe",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".php",
  ".py",
  ".sh",
  ".bat",
  ".cmd",
  ".ps1",
  ".dll",
  ".so",
  ".bin",
  ".html",
  ".htm",
  ".mjs",
  ".cjs",
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = media.find((m) => m.id === selectedMedia);

  const fetchMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/media", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch media");
      }

      const data = await response.json();
      setMedia(data.data || []);
    } catch (err) {
      setError("Erreur lors du chargement des médias");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const validateFile = (file: File): string | null => {
    // Check file extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (FORBIDDEN_EXTENSIONS.includes(ext)) {
      return `Type de fichier non autorisé: ${ext}. Seules les images sont permises.`;
    }

    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Type de fichier invalide: ${file.type}. Seules les images (JPEG, PNG, GIF, WebP, SVG) sont autorisées.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `Fichier trop volumineux (${actualSizeMB}MB). Taille maximale: ${maxSizeMB}MB.`;
    }

    return null;
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset messages
    setUploadError(null);
    setSuccessMessage(null);

    // Client-side validation
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<{
        ok: boolean;
        data: Record<string, unknown>;
      }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
          } catch {
            reject(new Error("Invalid response"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error"));
        });

        xhr.open("POST", "/api/admin/media");
        xhr.withCredentials = true;
        xhr.send(formData);
      });

      const { ok, data } = await uploadPromise;

      if (!ok) {
        throw new Error((data.error as string) || "Upload failed");
      }

      setUploadProgress(100);
      setSuccessMessage("Fichier uploadé avec succès!");
      await fetchMedia();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'upload";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setSuccessMessage("Fichier supprimé avec succès!");
      setSelectedMedia(null);
      await fetchMedia();
    } catch (err) {
      setError("Erreur lors de la suppression");
      console.error(err);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setSuccessMessage("URL copiée dans le presse-papier!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Médiathèque</h2>
          <p className="text-muted-foreground">
            Gérez vos images et fichiers ({media.length} fichiers)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg transition-colors cursor-pointer ${
              isUploading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-primary/90"
            }`}
          >
            <span>{isUploading ? "⏳" : "📤"}</span>
            <span>{isUploading ? "Upload en cours..." : "Upload"}</span>
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div
          className="bg-card border border-border rounded-lg p-4"
          role="progressbar"
          aria-valuenow={uploadProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Upload en cours...
            </span>
            <span className="text-sm font-medium text-primary">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-accent/30 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {uploadProgress < 100 ? "Transfert du fichier..." : "Traitement..."}
          </p>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-4">
          {error}
        </div>
      )}

      {uploadError && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive rounded-lg p-4">
          <strong>Erreur d&apos;upload:</strong> {uploadError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 rounded-lg p-4">
          {successMessage}
        </div>
      )}

      {/* File Type Info */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Formats acceptés:</strong> JPEG,
          PNG, GIF, WebP, SVG (max 5MB)
        </p>
      </div>

      {/* Media Grid */}
      <div className="bg-card border border-border rounded-lg p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-muted-foreground">Aucun fichier uploadé</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cliquez sur &quot;Upload&quot; pour ajouter des images
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedMedia(item.id)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary ${
                  selectedMedia === item.id
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-transparent"
                }`}
              >
                {item.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image
                    src={item.url}
                    alt={item.altText || item.originalFilename}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-accent to-accent/50">
                    🖼️
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
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
            <div className="aspect-video bg-accent/30 rounded-lg flex items-center justify-center overflow-hidden mb-4">
              {selectedItem.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <Image
                  src={selectedItem.url}
                  alt={selectedItem.altText || selectedItem.originalFilename}
                  fill
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-6xl">🖼️</span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nom:</span>
                <span className="text-foreground truncate ml-2 max-w-[200px]">
                  {selectedItem.originalFilename}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taille:</span>
                <span className="text-foreground">
                  {formatFileSize(selectedItem.sizeBytes)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground">{selectedItem.mimeType}</span>
              </div>
              {selectedItem.width && selectedItem.height && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="text-foreground">
                    {selectedItem.width} × {selectedItem.height}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploadé:</span>
                <span className="text-foreground">
                  {formatDate(selectedItem.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => handleCopyUrl(selectedItem.url)}
                className="flex-1 px-4 py-2 bg-accent text-foreground rounded-lg hover:bg-accent/80 transition-colors"
              >
                📋 Copier URL
              </button>
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
