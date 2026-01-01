"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Calendar } from "lucide-react";
import { useParams, notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  technologies: string[];
  status: "en_cours" | "termine" | "abandonne";
  projectDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  mainImageUrl?: string;
  galleryImages?: string[];
  visible: boolean;
}

const statusLabels = {
  en_cours: {
    label: "En cours",
    className: "bg-yellow-500/20 text-yellow-400",
  },
  termine: { label: "Terminé", className: "bg-green-500/20 text-green-400" },
  abandonne: { label: "Abandonné", className: "bg-red-500/20 text-red-400" },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Build back URL preserving filter params from referrer
  const [backUrl, setBackUrl] = useState("/projets");

  useEffect(() => {
    // Check if there are stored filter params in sessionStorage
    const storedParams = sessionStorage.getItem("projetsFilterParams");
    if (storedParams) {
      setBackUrl(`/projets?${storedParams}`);
    }
  }, []);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/projects/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFoundState(true);
            return;
          }
          throw new Error("Failed to fetch project");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setProject(result.data);
        } else {
          setNotFoundState(true);
        }
      } catch (error) {
        console.error("Error loading project:", error);
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center py-20">
            <RetroLoader size="lg" text="CHARGEMENT" />
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState || !project) {
    notFound();
  }

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Back link */}
        <Link
          href={backUrl}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>

        {/* Project Image */}
        <div className="mb-8 aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-retro-dark to-retro-purple relative">
          {project.mainImageUrl ? (
            <img
              src={project.mainImageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              🎮
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-4">
          {/* Status & Date */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusLabels[project.status]?.className || statusLabels.en_cours.className}`}
            >
              {statusLabels[project.status]?.label || "En cours"}
            </span>
            {project.projectDate && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(project.projectDate).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            {project.title}
          </h1>

          {/* Short description */}
          <p className="font-pixel text-xl font-semibold text-foreground">
            {project.shortDescription}
          </p>
        </div>

        {/* Links */}
        <div className="mb-4 flex flex-wrap gap-4">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              Voir le code
            </Link>
          )}
          {project.demoUrl && (
            <Link
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Voir la démo
            </Link>
          )}
        </div>

        {/* Long description */}
        {project.longDescription && (
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-line text-muted-foreground">
              {project.longDescription}
            </div>
          </div>
        )}

        {/* Gallery */}
        {project.galleryImages && project.galleryImages.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Galerie
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {project.galleryImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="group relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-retro-dark to-retro-purple cursor-pointer"
                  onClick={() => setSelectedImage(imageUrl)}
                >
                  <img
                    src={imageUrl}
                    alt={`${project.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                </div>
              ))}
            </div>

            <ImageLightbox
              isOpen={!!selectedImage}
              src={selectedImage || ""}
              alt={selectedImage ? `${project.title} - Galerie` : ""}
              onClose={() => setSelectedImage(null)}
            />
          </div>
        )}

        {/* Technologies */}
        <div className="mt-12">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Technologies
          </h2>
          <div className="flex flex-wrap gap-2">
            {(project.technologies || []).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
