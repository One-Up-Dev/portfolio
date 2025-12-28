"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// Session type for demo authentication
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt: number;
}

// Admin sidebar navigation items
const navItems = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Projets", href: "/admin/projets", icon: "🚀" },
  { name: "Blog", href: "/admin/blog", icon: "📝" },
  { name: "Compétences", href: "/admin/competences", icon: "⚡" },
  { name: "Médias", href: "/admin/medias", icon: "🖼️" },
  { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  { name: "Paramètres", href: "/admin/parametres", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      // Skip auth check for login page
      if (pathname === "/admin/login") {
        setIsLoading(false);
        return;
      }

      const storedSession = localStorage.getItem("admin_session");
      if (storedSession) {
        try {
          const parsedSession: Session = JSON.parse(storedSession);
          // Check if session is expired
          if (parsedSession.expiresAt > Date.now()) {
            setSession(parsedSession);
            setIsLoading(false);
            return;
          }
        } catch {
          // Invalid session data
        }
      }

      // No valid session, redirect to login
      localStorage.removeItem("admin_session");
      router.push("/admin/login");
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setSession(null);
    router.push("/admin/login");
  };

  // Show nothing while checking auth (or for login page)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-card border-r border-border flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link
            href="/admin"
            className={`flex items-center gap-2 text-primary font-bold ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <span className="text-2xl">🎮</span>
            {!sidebarCollapsed && <span>ONEUP Admin</span>}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 hover:bg-accent rounded transition-colors"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          {!sidebarCollapsed && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-foreground truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
            title={sidebarCollapsed ? "Déconnexion" : undefined}
          >
            <span className="text-lg">🚪</span>
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {navItems.find((item) => item.href === pathname)?.name ||
                "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
            >
              Voir le site →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
