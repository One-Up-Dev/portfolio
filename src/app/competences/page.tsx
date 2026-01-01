"use client";

import { useState, useEffect } from "react";
import { Code2, Database, Wrench, Users, Globe } from "lucide-react";
import { RetroLoader } from "@/components/ui/retro-spinner";

interface Skill {
  id: string;
  name: string;
  category: string;
  iconUrl: string | null;
  proficiency: number;
  orderIndex: number | null;
}

interface SkillCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  skills: Skill[];
}

const categoryConfig: Record<
  string,
  { name: string; icon: React.ComponentType<{ className?: string }> }
> = {
  frontend: { name: "Frontend", icon: Globe },
  backend: { name: "Backend", icon: Database },
  outils: { name: "Outils", icon: Wrench },
  soft_skills: { name: "Soft Skills", icon: Users },
};

export default function SkillsPage() {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load skills from API on mount
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/skills");
        if (!response.ok) {
          throw new Error("Failed to fetch skills");
        }
        const result = await response.json();

        if (result.success) {
          // Transform API data into skill categories
          const categories: SkillCategory[] = [];

          for (const categoryId of [
            "frontend",
            "backend",
            "outils",
            "soft_skills",
          ]) {
            const config = categoryConfig[categoryId];
            const categorySkills = result.data[categoryId] || [];

            if (categorySkills.length > 0) {
              categories.push({
                id: categoryId,
                name: config.name,
                icon: config.icon,
                skills: categorySkills,
              });
            }
          }

          setSkillCategories(categories);
        }
      } catch (err) {
        console.error("Error loading skills:", err);
        setError("Erreur lors du chargement des compétences");
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center py-20">
            <RetroLoader size="lg" text="CHARGEMENT" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center py-20 text-destructive">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            Compétences
          </h1>
          <p className="text-lg text-muted-foreground">
            Technologies et savoir-faire que je maîtrise
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {skillCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              {/* Category Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <category.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{category.name}</h2>
              </div>

              {/* Skills List */}
              <div className="space-y-4">
                {category.skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {skill.iconUrl ? (
                          <span className="text-base">{skill.iconUrl}</span>
                        ) : (
                          <Code2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        {skill.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-retro-cyan transition-all duration-500"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold">
            En apprentissage constant
          </h3>
          <p className="text-muted-foreground">
            Je continue d&apos;apprendre chaque jour de nouvelles technologies
            et d&apos;améliorer mes compétences existantes. L&apos;IA et
            l&apos;automatisation sont mes domaines de prédilection actuels.
          </p>
        </div>
      </div>
    </div>
  );
}
