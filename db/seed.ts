import { db } from "./index";
import { users, projects, blogPosts, skills } from "./schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

// Additional projects for performance testing (to reach 20+)
const additionalProjects = [
  {
    slug: "ecommerce-platform",
    title: "E-Commerce Platform",
    shortDescription: "Plateforme e-commerce moderne avec panier et paiement",
    longDescription:
      "Une plateforme e-commerce complète avec gestion de produits, panier, checkout et intégration Stripe.",
    technologies: ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS"],
    githubUrl: "https://github.com/oneup/ecommerce",
    status: "termine" as const,
    projectDate: "2024-07-15",
    visible: true,
    viewCount: 35,
    orderIndex: 6,
  },
  {
    slug: "chat-realtime",
    title: "Chat Realtime App",
    shortDescription: "Application de chat en temps réel avec WebSocket",
    technologies: ["React", "Socket.io", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/oneup/chat-app",
    status: "termine" as const,
    projectDate: "2024-06-20",
    visible: true,
    viewCount: 28,
    orderIndex: 7,
  },
  {
    slug: "task-manager",
    title: "Task Manager Pro",
    shortDescription:
      "Gestionnaire de tâches avec drag & drop et filtres avancés",
    technologies: ["React", "TypeScript", "Redux", "Tailwind CSS"],
    githubUrl: "https://github.com/oneup/task-manager",
    status: "termine" as const,
    projectDate: "2024-05-10",
    visible: true,
    viewCount: 42,
    orderIndex: 8,
  },
  {
    slug: "weather-dashboard",
    title: "Weather Dashboard",
    shortDescription: "Dashboard météo avec prévisions et graphiques",
    technologies: ["Vue.js", "Chart.js", "OpenWeather API"],
    githubUrl: "https://github.com/oneup/weather-dashboard",
    status: "termine" as const,
    projectDate: "2024-04-25",
    visible: true,
    viewCount: 19,
    orderIndex: 9,
  },
  {
    slug: "blog-cms",
    title: "Blog CMS",
    shortDescription: "CMS pour blog avec éditeur WYSIWYG",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "TipTap"],
    githubUrl: "https://github.com/oneup/blog-cms",
    status: "en_cours" as const,
    projectDate: "2024-03-15",
    visible: true,
    viewCount: 31,
    orderIndex: 10,
  },
  {
    slug: "crypto-tracker",
    title: "Crypto Tracker",
    shortDescription: "Suivi de portefeuille crypto avec alertes",
    technologies: ["React", "CoinGecko API", "Chart.js"],
    githubUrl: "https://github.com/oneup/crypto-tracker",
    status: "termine" as const,
    projectDate: "2024-02-28",
    visible: true,
    viewCount: 55,
    orderIndex: 11,
  },
  {
    slug: "recipe-app",
    title: "Recipe App",
    shortDescription: "Application de recettes avec recherche et favoris",
    technologies: ["React Native", "Firebase", "Spoonacular API"],
    githubUrl: "https://github.com/oneup/recipe-app",
    status: "termine" as const,
    projectDate: "2024-01-20",
    visible: true,
    viewCount: 24,
    orderIndex: 12,
  },
  {
    slug: "fitness-tracker",
    title: "Fitness Tracker",
    shortDescription: "Application de suivi fitness avec objectifs",
    technologies: ["React", "Node.js", "MongoDB", "Chart.js"],
    githubUrl: "https://github.com/oneup/fitness-tracker",
    status: "en_cours" as const,
    projectDate: "2023-12-10",
    visible: true,
    viewCount: 18,
    orderIndex: 13,
  },
  {
    slug: "note-taking-app",
    title: "Note Taking App",
    shortDescription: "Application de prise de notes avec Markdown",
    technologies: ["Electron", "React", "SQLite"],
    githubUrl: "https://github.com/oneup/notes-app",
    status: "termine" as const,
    projectDate: "2023-11-05",
    visible: true,
    viewCount: 33,
    orderIndex: 14,
  },
  {
    slug: "url-shortener",
    title: "URL Shortener",
    shortDescription: "Raccourcisseur d'URL avec analytics",
    technologies: ["Node.js", "Redis", "PostgreSQL"],
    githubUrl: "https://github.com/oneup/url-shortener",
    status: "termine" as const,
    projectDate: "2023-10-15",
    visible: true,
    viewCount: 47,
    orderIndex: 15,
  },
  {
    slug: "image-gallery",
    title: "Image Gallery",
    shortDescription: "Galerie d'images avec lazy loading et filtres",
    technologies: ["React", "Cloudinary", "Tailwind CSS"],
    githubUrl: "https://github.com/oneup/image-gallery",
    status: "termine" as const,
    projectDate: "2023-09-20",
    visible: true,
    viewCount: 26,
    orderIndex: 16,
  },
  {
    slug: "podcast-player",
    title: "Podcast Player",
    shortDescription: "Lecteur de podcasts avec favoris et playlists",
    technologies: ["React", "iTunes API", "Web Audio API"],
    githubUrl: "https://github.com/oneup/podcast-player",
    status: "termine" as const,
    projectDate: "2023-08-10",
    visible: true,
    viewCount: 21,
    orderIndex: 17,
  },
  {
    slug: "quiz-game",
    title: "Quiz Game",
    shortDescription: "Jeu de quiz multijoueur en temps réel",
    technologies: ["React", "Socket.io", "MongoDB"],
    githubUrl: "https://github.com/oneup/quiz-game",
    status: "termine" as const,
    projectDate: "2023-07-25",
    visible: true,
    viewCount: 38,
    orderIndex: 18,
  },
];

// Additional blog posts for performance testing (to reach 50+)
const additionalBlogPosts = Array.from({ length: 50 }, (_, i) => ({
  slug: `article-${i + 4}`,
  title: `Article ${i + 4}: ${["Deep Dive into React Hooks", "Understanding TypeScript Generics", "Building Scalable APIs", "CSS Grid vs Flexbox", "Testing Best Practices", "Performance Optimization", "Docker for Developers", "GraphQL Fundamentals", "CI/CD Pipeline Setup", "Security Best Practices"][i % 10]}`,
  excerpt: `Découvrez les meilleures pratiques pour ${["React", "TypeScript", "Node.js", "CSS", "Testing", "Performance", "Docker", "GraphQL", "DevOps", "Security"][i % 10]} dans cet article détaillé.`,
  content: `<h2>Introduction</h2><p>Dans cet article, nous allons explorer en profondeur les concepts importants de ${["React", "TypeScript", "Node.js", "CSS", "Testing", "Performance", "Docker", "GraphQL", "DevOps", "Security"][i % 10]}.</p><h2>Les fondamentaux</h2><p>Comprendre les bases est essentiel pour maîtriser n'importe quelle technologie.</p><h2>Exemples pratiques</h2><p>Voici quelques exemples concrets que vous pouvez utiliser dans vos projets.</p><h2>Conclusion</h2><p>En appliquant ces principes, vous améliorerez significativement la qualité de votre code.</p>`,
  tags: [
    ["React", "JavaScript"],
    ["TypeScript", "Types"],
    ["Node.js", "API"],
    ["CSS", "Design"],
    ["Testing", "Quality"],
    ["Performance", "Optimization"],
    ["Docker", "DevOps"],
    ["GraphQL", "API"],
    ["CI/CD", "DevOps"],
    ["Security", "Auth"],
  ][i % 10],
  status: "published" as const,
  publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  metaDescription: `Guide complet sur ${["React", "TypeScript", "Node.js", "CSS", "Testing", "Performance", "Docker", "GraphQL", "DevOps", "Security"][i % 10]} pour développeurs.`,
  readTimeMinutes: 5 + (i % 10),
  viewCount: 10 + Math.floor(Math.random() * 100),
}));

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

  // Add additional projects for performance testing if less than 20
  const currentProjects = await db.select().from(projects);
  if (currentProjects.length < 20) {
    const projectsToAdd = additionalProjects.filter(
      (p) => !currentProjects.some((existing) => existing.slug === p.slug),
    );
    if (projectsToAdd.length > 0) {
      await db.insert(projects).values(projectsToAdd);
      console.log(
        `Added ${projectsToAdd.length} additional projects for performance testing`,
      );
    }
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

  // Add additional blog posts for performance testing if less than 50
  const currentPosts = await db.select().from(blogPosts);
  if (currentPosts.length < 50) {
    const postsToAdd = additionalBlogPosts.filter(
      (p) => !currentPosts.some((existing) => existing.slug === p.slug),
    );
    if (postsToAdd.length > 0) {
      await db.insert(blogPosts).values(postsToAdd);
      console.log(
        `Added ${postsToAdd.length} additional blog posts for performance testing`,
      );
    }
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
