import {
  Code2,
  Database,
  Wrench,
  Users,
  Cpu,
  Globe,
  Palette,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "Compétences - ONEUP Portfolio",
  description:
    "Mes compétences en développement web, automatisation, et outils modernes.",
};

const skillCategories = [
  {
    id: "frontend",
    name: "Frontend",
    icon: Globe,
    skills: [
      { name: "React", level: 80 },
      { name: "Next.js", level: 75 },
      { name: "TypeScript", level: 70 },
      { name: "Tailwind CSS", level: 85 },
      { name: "HTML/CSS", level: 90 },
      { name: "Framer Motion", level: 60 },
    ],
  },
  {
    id: "backend",
    name: "Backend",
    icon: Database,
    skills: [
      { name: "Node.js", level: 70 },
      { name: "API REST", level: 75 },
      { name: "PostgreSQL", level: 65 },
      { name: "Drizzle ORM", level: 60 },
      { name: "Authentication", level: 65 },
    ],
  },
  {
    id: "outils",
    name: "Outils",
    icon: Wrench,
    skills: [
      { name: "n8n", level: 85 },
      { name: "Claude Code", level: 90 },
      { name: "Git", level: 75 },
      { name: "VS Code", level: 85 },
      { name: "Figma", level: 50 },
      { name: "Vercel", level: 70 },
    ],
  },
  {
    id: "soft_skills",
    name: "Soft Skills",
    icon: Users,
    skills: [
      { name: "Créativité", level: 90 },
      { name: "Adaptabilité", level: 95 },
      { name: "Autonomie", level: 85 },
      { name: "Communication", level: 80 },
      { name: "Résolution problèmes", level: 85 },
    ],
  },
];

const techIcons: Record<string, React.ReactNode> = {
  React: <Code2 className="h-4 w-4" />,
  "Next.js": <Globe className="h-4 w-4" />,
  TypeScript: <Terminal className="h-4 w-4" />,
  "Tailwind CSS": <Palette className="h-4 w-4" />,
  n8n: <Cpu className="h-4 w-4" />,
  "Claude Code": <Cpu className="h-4 w-4" />,
};

export default function SkillsPage() {
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
                  <div key={skill.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {techIcons[skill.name] || (
                          <Code2 className="h-4 w-4 text-muted-foreground" />
                        )}
                        {skill.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-retro-cyan transition-all duration-500"
                        style={{ width: `${skill.level}%` }}
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
