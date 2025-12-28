"use client";

// Demo analytics data
const stats = {
  totalVisitors: 1247,
  totalPageViews: 4523,
  avgSessionDuration: "2m 34s",
  bounceRate: "42%",
};

const topPages = [
  { path: "/", views: 1245, percentage: 28 },
  { path: "/projets", views: 867, percentage: 19 },
  { path: "/blog", views: 654, percentage: 14 },
  { path: "/a-propos", views: 523, percentage: 12 },
  { path: "/contact", views: 412, percentage: 9 },
];

const trafficSources = [
  { source: "Direct", visits: 534, percentage: 43 },
  { source: "Google", visits: 423, percentage: 34 },
  { source: "LinkedIn", visits: 189, percentage: 15 },
  { source: "GitHub", visits: 101, percentage: 8 },
];

export default function AdminAnalyticsPage() {
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
            {stats.totalVisitors}
          </p>
          <p className="text-xs text-green-500 mt-1">+15% vs mois dernier</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Pages vues</p>
          <p className="text-3xl font-bold text-foreground">
            {stats.totalPageViews}
          </p>
          <p className="text-xs text-green-500 mt-1">+23% vs mois dernier</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Durée moyenne</p>
          <p className="text-3xl font-bold text-foreground">
            {stats.avgSessionDuration}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Par session</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Taux de rebond</p>
          <p className="text-3xl font-bold text-foreground">
            {stats.bounceRate}
          </p>
          <p className="text-xs text-yellow-500 mt-1">-5% vs mois dernier</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Pages les plus visitées
          </h3>
          <div className="space-y-4">
            {topPages.map((page) => (
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
        </div>

        {/* Traffic Sources */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Sources de trafic
          </h3>
          <div className="space-y-4">
            {trafficSources.map((source) => (
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
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Visiteurs (30 derniers jours)
        </h3>
        <div className="h-64 flex items-center justify-center bg-accent/20 rounded-lg">
          <p className="text-muted-foreground">
            📊 Graphique disponible avec base de données connectée
          </p>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les
          statistiques affichées sont des exemples.
        </p>
      </div>
    </div>
  );
}
