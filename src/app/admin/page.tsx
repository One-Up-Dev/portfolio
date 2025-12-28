"use client";

import Link from "next/link";

// Demo statistics data
const stats = [
  {
    name: "Projets",
    value: 5,
    icon: "🚀",
    href: "/admin/projets",
    change: "+2 ce mois",
  },
  {
    name: "Articles",
    value: 3,
    icon: "📝",
    href: "/admin/blog",
    change: "+1 ce mois",
  },
  {
    name: "Visiteurs",
    value: 1247,
    icon: "👥",
    href: "/admin/analytics",
    change: "+15% ce mois",
  },
  {
    name: "Compétences",
    value: 12,
    icon: "⚡",
    href: "/admin/competences",
    change: "4 catégories",
  },
];

// Demo recent activity
const recentActivity = [
  {
    id: 1,
    action: "Projet créé",
    item: "Portfolio ONEUP",
    time: "Il y a 2 heures",
    icon: "🚀",
  },
  {
    id: 2,
    action: "Article publié",
    item: "Guide n8n pour débutants",
    time: "Il y a 5 heures",
    icon: "📝",
  },
  {
    id: 3,
    action: "Compétence ajoutée",
    item: "Claude Code",
    time: "Hier",
    icon: "⚡",
  },
  {
    id: 4,
    action: "Projet modifié",
    item: "App de gestion",
    time: "Il y a 2 jours",
    icon: "✏️",
  },
];

// Demo top content
const topProjects = [
  { name: "Portfolio ONEUP", views: 342 },
  { name: "App de gestion", views: 256 },
  { name: "Bot Discord", views: 189 },
];

const topArticles = [
  { name: "Guide n8n pour débutants", views: 567 },
  { name: "Automatisation avec Claude", views: 423 },
  { name: "Vibe Coding expliqué", views: 312 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Bienvenue sur le dashboard 🎮
        </h2>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble de votre portfolio ONEUP
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                {stat.name}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Actions rapides
        </h3>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/projets/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span>🚀</span>
            <span>Nouveau projet</span>
          </Link>
          <Link
            href="/admin/blog/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <span>📝</span>
            <span>Nouvel article</span>
          </Link>
          <Link
            href="/admin/medias"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <span>🖼️</span>
            <span>Gérer les médias</span>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Activité récente
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.item}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Contenu populaire
          </h3>

          {/* Top Projects */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              🚀 Projets les plus vus
            </h4>
            <div className="space-y-2">
              {topProjects.map((project, index) => (
                <div
                  key={project.name}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-foreground">
                      {project.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {project.views} vues
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Articles */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              📝 Articles les plus lus
            </h4>
            <div className="space-y-2">
              {topArticles.map((article, index) => (
                <div
                  key={article.name}
                  className="flex items-center justify-between p-2 rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-foreground">
                      {article.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {article.views} vues
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice */}
      <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Mode démo:</strong> Les données
          affichées sont des exemples. Connectez une base de données pour voir
          les vraies statistiques.
        </p>
      </div>
    </div>
  );
}
