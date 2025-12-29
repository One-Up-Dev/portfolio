"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { useParams, notFound } from "next/navigation";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  tags: string[];
  status: string;
  publishedAt: string;
  readTimeMinutes?: number;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  // Build back URL preserving filter params from referrer
  const [backUrl, setBackUrl] = useState("/blog");

  useEffect(() => {
    // Check if there are stored filter params in sessionStorage
    const storedParams = sessionStorage.getItem("blogFilterParams");
    if (storedParams) {
      setBackUrl(`/blog?${storedParams}`);
    }
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/blog/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setNotFoundState(true);
            return;
          }
          throw new Error("Failed to fetch blog post");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setPost(result.data);
        } else {
          setNotFoundState(true);
        }
      } catch (error) {
        console.error("Error loading post:", error);
        setNotFoundState(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3 text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState || !post) {
    notFound();
  }

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Back link */}
        <Link
          href={backUrl}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {(post.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Date inconnue"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTimeMinutes || 5} min de lecture
            </span>
          </div>
        </header>

        {/* Content */}
        <article
          className="prose prose-invert max-w-none prose-headings:text-primary prose-headings:font-heading prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:font-body prose-li:text-muted-foreground prose-strong:text-foreground prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:font-mono"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.content || "", {
              ALLOWED_TAGS: [
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "p",
                "br",
                "strong",
                "em",
                "ul",
                "ol",
                "li",
                "a",
                "code",
                "pre",
                "blockquote",
                "img",
                "span",
                "div",
              ],
              ALLOWED_ATTR: ["href", "src", "alt", "class", "target", "rel"],
            }),
          }}
        />

        {/* Share / Navigation */}
        <footer className="mt-12 border-t border-border pt-8">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voir tous les articles
          </Link>
        </footer>
      </div>
    </div>
  );
}
