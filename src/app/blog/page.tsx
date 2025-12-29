"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: string;
  publishedAt: string;
  readTimeMinutes?: number;
  coverImageUrl?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-primary/30 text-primary px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function BlogPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Track if this is initial mount to prevent page reset
  const isInitialMount = useRef(true);

  // Initialize state from URL params
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedTag, setSelectedTag] = useState<string | null>(
    searchParams.get("tag") || null,
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("q") || "",
  );

  // Update URL when filters change and store in sessionStorage for back navigation
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTag) params.set("tag", selectedTag);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const paramsString = params.toString();
    const newUrl = paramsString ? `/blog?${paramsString}` : "/blog";
    router.replace(newUrl, { scroll: false });

    // Store filter params in sessionStorage for back navigation from detail pages
    if (paramsString) {
      sessionStorage.setItem("blogFilterParams", paramsString);
    } else {
      sessionStorage.removeItem("blogFilterParams");
    }
  }, [selectedTag, debouncedSearch, currentPage, router]);

  // Reset to page 1 when filters change (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [selectedTag, debouncedSearch]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load all tags on mount (for filter buttons) with counts
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch("/api/blog");
        const result = await response.json();
        if (result.success && result.data) {
          // Count occurrences of each tag
          const counts: Record<string, number> = {};
          result.data.forEach((p: BlogPost) => {
            (p.tags || []).forEach((tag: string) => {
              counts[tag] = (counts[tag] || 0) + 1;
            });
          });
          setTagCounts(counts);

          const tags = Object.keys(counts).sort();
          setAllTags(tags);
        }
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    loadTags();
  }, []);

  // Load posts from API when filters change
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        // Build URL with filter params
        const params = new URLSearchParams();

        if (selectedTag) {
          params.set("tag", selectedTag);
        }

        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }

        params.set("page", currentPage.toString());
        params.set("limit", "10");

        const response = await fetch(`/api/blog?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          setPosts(result.data);
          setPagination({
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
          });
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Error loading posts:", error);
        setPosts([]);
      }
      setIsLoading(false);
    };

    loadPosts();
  }, [selectedTag, debouncedSearch, currentPage]);

  // Handle tag toggle
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

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

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Réflexions sur le développement, l&apos;automatisation et la
            reconversion
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                selectedTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              Tous
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {tag}
                {tagCounts[tag] > 0 && (
                  <span className="ml-1 opacity-70">({tagCounts[tag]})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Blog posts list */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {(post.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary line-clamp-2">
                  {highlightMatch(post.title, debouncedSearch)}
                </h2>

                {/* Excerpt */}
                <p className="mb-4 text-muted-foreground line-clamp-3">
                  {highlightMatch(post.excerpt, debouncedSearch)}
                </p>

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
              </Link>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </button>

            <div className="flex items-center gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-10 w-10 rounded-lg text-sm transition-colors ${
                    pageNum === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card hover:border-primary"
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Page suivante"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Page info */}
        {pagination.total > 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Affichage {(currentPage - 1) * pagination.limit + 1} -{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} sur{" "}
            {pagination.total} articles
          </p>
        )}

        {/* Empty state */}
        {posts.length === 0 && !isLoading && (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              {searchQuery || selectedTag
                ? "Aucun article ne correspond à votre recherche."
                : "Aucun article pour le moment. Revenez bientôt !"}
            </p>
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag(null);
                }}
                className="mt-4 text-primary hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense>
      <BlogPageContent />
    </Suspense>
  );
}
