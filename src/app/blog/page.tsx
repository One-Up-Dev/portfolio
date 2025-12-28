"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Calendar, Clock, Tag, Search } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  status: string;
  publishedAt: string;
  readTimeMinutes?: number;
  readTime?: number;
  publishDate?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load posts from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedPosts = localStorage.getItem("demo_blog_posts");
      let allPosts: BlogPost[] = [];

      if (savedPosts) {
        const parsed = JSON.parse(savedPosts);
        // Transform saved posts to match display format
        allPosts = parsed.map(
          (post: {
            id: string;
            slug: string;
            title: string;
            excerpt?: string;
            content?: string;
            tags: string[];
            status: string;
            publishDate?: string;
            createdAt?: string;
            publishedAt?: string;
            readTime?: number;
          }) => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt:
              post.excerpt || post.content?.substring(0, 150) + "..." || "",
            tags: post.tags || [],
            status: post.status,
            publishedAt:
              post.publishDate ||
              post.publishedAt ||
              post.createdAt?.split("T")[0] ||
              new Date().toISOString().split("T")[0],
            readTimeMinutes: post.readTime || 5,
          }),
        );
      }

      // Only show published posts
      const publishedPosts = allPosts.filter((p) => p.status === "published");
      setPosts(publishedPosts);
      setFilteredPosts(publishedPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
      setPosts([]);
      setFilteredPosts([]);
    }
    setIsLoading(false);
  }, []);

  // Get all unique tags from posts
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  // Handle search and filter
  useEffect(() => {
    let result = posts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query),
      );
    }

    // Filter by tag
    if (selectedTag) {
      result = result.filter((post) => post.tags.includes(selectedTag));
    }

    setFilteredPosts(result);
  }, [searchQuery, selectedTag, posts]);

  // Handle tag toggle
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin text-4xl">⏳</div>
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
              </button>
            ))}
          </div>
        </div>

        {/* Blog posts list */}
        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
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
                <h2 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mb-4 text-muted-foreground">{post.excerpt}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTimeMinutes || post.readTime || 5} min de lecture
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Empty state */}
        {filteredPosts.length === 0 && !isLoading && (
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
