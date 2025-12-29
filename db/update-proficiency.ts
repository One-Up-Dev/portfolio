import { db } from "./index";
import { skills } from "./schema";
import { eq } from "drizzle-orm";

async function updateProficiency() {
  const proficiencyMap: Record<string, number> = {
    React: 80,
    "Next.js": 75,
    TypeScript: 70,
    "Tailwind CSS": 85,
    "HTML/CSS": 90,
    "Node.js": 70,
    "API REST": 75,
    PostgreSQL: 65,
    SQLite: 70,
    "Drizzle ORM": 60,
    n8n: 85,
    "claude-code": 90,
    Git: 75,
    "VS Code": 85,
    Figma: 50,
    Creativite: 90,
    Adaptabilite: 95,
    Autonomie: 85,
    Communication: 80,
    "Resolution de problemes": 85,
  };

  for (const [name, proficiency] of Object.entries(proficiencyMap)) {
    await db.update(skills).set({ proficiency }).where(eq(skills.name, name));
  }
  console.log("Proficiency values updated");
}

updateProficiency().catch(console.error);
