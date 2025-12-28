"use client";

import { useEffect, useState } from "react";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface AnalyticsData {
  totalVisitors: number;
  visitorsThisMonth: number;
  visitorsChange: number;
  totalPageViews: number;
  pageViewsThisMonth: number;
  topPages: Array<{ path: string; views: number }>;
  topProjects: Array<{ title: string; views: number }>;
  topArticles: Array<{ title: string; views: number }>;
  trafficSources: Array<{ source: string; visits: number; percentage: number }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/admin/analytics/overview");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch analytics");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RetroLoader text="Chargement des analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Calculate percentages for top pages
  const maxPageViews = Math.max(...analytics.topPages.map((p) => p.views), 1);
  const topPagesWithPercentage = analytics.topPages.map((page) => ({
    ...page,
    percentage: Math.round((page.views / maxPageViews) * 100),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground">
            Statistiques de votre portfolio
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
          <span>📥</span>
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">
            Visiteurs uniques
          </p>
          <p className="text-3xl font-bold text-foreground">
            {analytics.totalVisitors}
          </p>
          <p
            className={`text-xs mt-1 ${
              analytics.visitorsChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {analytics.visitorsChange >= 0 ? "+" : ""}
            {analytics.visitorsChange}% vs mois dernier
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Pages vues</p>
          <p className="text-3xl font-bold text-foreground">
            {analytics.totalPageViews}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.pageViewsThisMonth} ce mois-ci
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Top Projet</p>
          <p className="text-xl font-bold text-foreground truncate">
            {analytics.topProjects[0]?.title || "Aucun"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.topProjects[0]?.views || 0} vues
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Top Article</p>
          <p className="text-xl font-bold text-foreground truncate">
            {analytics.topArticles[0]?.title || "Aucun"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.topArticles[0]?.views || 0} vues
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Pages les plus visitées
          </h3>
          {topPagesWithPercentage.length > 0 ? (
            <div className="space-y-4">
              {topPagesWithPercentage.map((page) => (
                <div key={page.path} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{page.path}</span>
                    <span className="text-muted-foreground">
                      {page.views} vues
                    </span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${page.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aucune donnée disponible
            </p>
          )}
        </div>

        {/* Traffic Sources */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sources de trafic
          </h3>
          {analytics.trafficSources.length > 0 ? (
            <div className="space-y-4">
              {analytics.trafficSources.map((source) => (
                <div key={source.source} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{source.source}</span>
                    <span className="text-muted-foreground">
                      {source.visits} ({source.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </div>

      {/* Top Projects and Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Projects */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Projets les plus vus
          </h3>
          {analytics.topProjects.length > 0 ? (
            <div className="space-y-3">
              {analytics.topProjects.map((project, index) => (
                <div
                  key={project.title}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">
                      #{index + 1}
                    </span>
                    <span className="text-foreground">{project.title}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {project.views} vues
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aucun projet
            </p>
          )}
        </div>

        {/* Top Articles */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Articles les plus lus
          </h3>
          {analytics.topArticles.length > 0 ? (
            <div className="space-y-3">
              {analytics.topArticles.map((article, index) => (
                <div
                  key={article.title}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">
                      #{index + 1}
                    </span>
                    <span className="text-foreground">{article.title}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {article.views} vues
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Aucun article
            </p>
          )}
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Note:</strong> Les statistiques
          sont mises à jour en temps réel à partir des données de la base.
        </p>
      </div>
    </div>
  );
}
