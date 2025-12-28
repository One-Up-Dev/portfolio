import { db } from "./index";
import { users, projects, blogPosts, skills } from "./schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@oneup.dev"));

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("Admin123!", 10);
    await db.insert(users).values({
      email: "admin@oneup.dev",
      passwordHash,
      name: "Admin ONEUP",
    });
    console.log("Admin user created: admin@oneup.dev / Admin123!");
  } else {
    console.log("Admin user already exists");
  }

  // Create sample projects
  const existingProjects = await db.select().from(projects);
  if (existingProjects.length === 0) {
    await db.insert(projects).values([
      {
        slug: "portfolio-retro",
        title: "Portfolio Retro Gaming",
        shortDescription:
          "Portfolio personnel avec theme retro gaming annees 80-90",
        longDescription:
          "Un portfolio professionnel combine un design pixel art nostalgique avec des fonctionnalites modernes. Dashboard d'administration, generation de contenu par IA, analytics de visite, et easter eggs interactifs.",
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        githubUrl: "https://github.com/oneup/portfolio",
        demoUrl: "https://oneup.dev",
        status: "termine",
        projectDate: "2024-12-01",
        visible: true,
        viewCount: 42,
        orderIndex: 1,
      },
      {
        slug: "n8n-automation",
        title: "Automatisation n8n",
        shortDescription: "Workflows d'automatisation avec n8n et Claude API",
        longDescription:
          "Suite de workflows n8n pour automatiser diverses taches: scraping, generation de contenu, notifications, synchronisation de donnees entre services.",
        technologies: ["n8n", "Node.js", "API REST", "Claude API"],
        githubUrl: "https://github.com/oneup/n8n-workflows",
        status: "en_cours",
        projectDate: "2024-11-15",
        visible: true,
        viewCount: 28,
        orderIndex: 2,
      },
      {
        slug: "vibe-coding-tools",
        title: "Vibe Coding Tools",
        shortDescription:
          "Outils de developpement assistes par IA avec claude-code",
        longDescription:
          "Collection d'outils et de configurations pour le developpement assiste par IA, incluant des snippets, des prompts optimises, et des integrations VS Code.",
        technologies: ["TypeScript", "VS Code", "Claude API", "Git"],
        githubUrl: "https://github.com/oneup/vibe-tools",
        status: "en_cours",
        projectDate: "2024-10-20",
        visible: true,
        viewCount: 15,
        orderIndex: 3,
      },
      {
        slug: "retro-game-engine",
        title: "Retro Game Engine",
        shortDescription: "Moteur de jeu 2D style retro avec Phaser",
        longDescription:
          "Un moteur de jeu 2D leger et performant pour creer des jeux retro style NES/SNES. Supporte les tilemaps, les sprites animes, les effets sonores 8-bit.",
        technologies: ["Phaser", "JavaScript", "Canvas", "WebGL"],
        githubUrl: "https://github.com/oneup/retro-engine",
        demoUrl: "https://retro.oneup.dev",
        status: "termine",
        projectDate: "2024-09-10",
        visible: true,
        viewCount: 67,
        orderIndex: 4,
      },
      {
        slug: "api-dashboard",
        title: "API Dashboard",
        shortDescription:
          "Dashboard de monitoring pour APIs avec metriques temps reel",
        longDescription:
          "Un dashboard complet pour monitorer la sante et les performances de vos APIs. Graphiques temps reel, alertes, logs, et rapports automatises.",
        technologies: ["React", "Node.js", "PostgreSQL", "Chart.js"],
        githubUrl: "https://github.com/oneup/api-dashboard",
        status: "abandonne",
        projectDate: "2024-08-05",
        visible: true,
        viewCount: 23,
        orderIndex: 5,
      },
    ]);
    console.log("Sample projects created");
  } else {
    console.log("Projects already exist");
  }

  // Create sample blog posts
  const existingPosts = await db.select().from(blogPosts);
  if (existingPosts.length === 0) {
    await db.insert(blogPosts).values([
      {
        slug: "reconversion-developpeur",
        title: "Ma reconversion : de la restauration au developpement",
        excerpt:
          "Apres 20 ans dans la restauration, j'ai decide de me reconvertir dans le developpement web. Voici mon parcours.",
        content:
          "<h2>Le debut de l'aventure</h2><p>A 46 ans, beaucoup pensaient que c'etait trop tard pour changer de carriere. Je leur ai prouve le contraire.</p><h2>Les defis</h2><p>Apprendre a coder tout en continuant a travailler n'a pas ete facile, mais la passion m'a porte.</p><h2>Mes conseils</h2><p>N'ayez pas peur de commencer. Chaque ligne de code vous rapproche de votre objectif.</p>",
        tags: ["Reconversion", "Carriere", "Developpement"],
        status: "published",
        publishedAt: "2024-12-15",
        metaDescription:
          "Decouvrez mon parcours de reconversion de la restauration au developpement web a 46 ans.",
        readTimeMinutes: 5,
        viewCount: 156,
      },
      {
        slug: "automatisation-n8n-claude",
        title: "Automatiser son workflow avec n8n et Claude",
        excerpt:
          "Comment j'utilise n8n et Claude API pour automatiser mes taches repetitives et gagner du temps.",
        content:
          "<h2>Pourquoi l'automatisation ?</h2><p>Le temps est notre ressource la plus precieuse. L'automatisation permet de se concentrer sur ce qui compte vraiment.</p><h2>n8n : l'outil parfait</h2><p>n8n est un outil no-code/low-code qui permet de creer des workflows visuellement.</p><h2>Integration Claude API</h2><p>En combinant n8n avec Claude, on peut automatiser des taches intelligentes comme la redaction, l'analyse, la categorisation.</p>",
        tags: ["n8n", "Claude", "Automatisation", "Productivite"],
        status: "published",
        publishedAt: "2024-12-10",
        metaDescription:
          "Guide pratique pour automatiser vos taches avec n8n et Claude API.",
        readTimeMinutes: 8,
        viewCount: 89,
      },
      {
        slug: "vibe-coding-experience",
        title: "Le Vibe Coding : coder avec l'IA comme partenaire",
        excerpt:
          "Mon experience du vibe coding avec claude-code et comment cela a transforme ma facon de developper.",
        content:
          "<h2>Qu'est-ce que le Vibe Coding ?</h2><p>Le vibe coding, c'est coder en collaboration avec une IA. On decrit ce qu'on veut, l'IA propose, on ajuste ensemble.</p><h2>claude-code en action</h2><p>Avec claude-code, je peux prototyper des idees en quelques minutes au lieu de quelques heures.</p><h2>Les limites</h2><p>L'IA n'est pas parfaite. Il faut toujours relire, tester, et comprendre le code genere.</p>",
        tags: ["Vibe Coding", "IA", "claude-code", "Developpement"],
        status: "published",
        publishedAt: "2024-12-05",
        metaDescription:
          "Decouvrez le vibe coding et comment l'IA peut transformer votre workflow de developpement.",
        readTimeMinutes: 6,
        viewCount: 112,
      },
    ]);
    console.log("Sample blog posts created");
  } else {
    console.log("Blog posts already exist");
  }

  // Create sample skills
  const existingSkills = await db.select().from(skills);
  if (existingSkills.length === 0) {
    await db.insert(skills).values([
      // Frontend
      { name: "React", category: "frontend", orderIndex: 1 },
      { name: "Next.js", category: "frontend", orderIndex: 2 },
      { name: "TypeScript", category: "frontend", orderIndex: 3 },
      { name: "Tailwind CSS", category: "frontend", orderIndex: 4 },
      { name: "HTML/CSS", category: "frontend", orderIndex: 5 },
      // Backend
      { name: "Node.js", category: "backend", orderIndex: 1 },
      { name: "API REST", category: "backend", orderIndex: 2 },
      { name: "PostgreSQL", category: "backend", orderIndex: 3 },
      { name: "SQLite", category: "backend", orderIndex: 4 },
      { name: "Drizzle ORM", category: "backend", orderIndex: 5 },
      // Outils
      { name: "n8n", category: "outils", orderIndex: 1 },
      { name: "claude-code", category: "outils", orderIndex: 2 },
      { name: "Git", category: "outils", orderIndex: 3 },
      { name: "VS Code", category: "outils", orderIndex: 4 },
      { name: "Figma", category: "outils", orderIndex: 5 },
      // Soft Skills
      { name: "Creativite", category: "soft_skills", orderIndex: 1 },
      { name: "Adaptabilite", category: "soft_skills", orderIndex: 2 },
      { name: "Autonomie", category: "soft_skills", orderIndex: 3 },
      { name: "Communication", category: "soft_skills", orderIndex: 4 },
      {
        name: "Resolution de problemes",
        category: "soft_skills",
        orderIndex: 5,
      },
    ]);
    console.log("Sample skills created");
  } else {
    console.log("Skills already exist");
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
