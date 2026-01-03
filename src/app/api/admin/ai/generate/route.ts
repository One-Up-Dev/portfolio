import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { siteSettings } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

async function getClaudeApiKey(): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "claudeApiKey"))
      .limit(1);

    if (result.length > 0 && result[0].value) {
      return result[0].value as string;
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch content from URL for context - enhanced extraction
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      return `[Could not fetch: ${url} - Status: ${response.status}]`;
    }

    const html = await response.text();

    // Enhanced content extraction
    let textContent = html
      // Remove script tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      // Remove style tags
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // Remove nav, header, footer, sidebar elements
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove SVG
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
      // Preserve headings with markers
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n## $1\n\n")
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n### $1\n\n")
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n#### $1\n\n")
      // Preserve paragraphs
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n")
      // Preserve list items
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n• $1")
      // Preserve line breaks
      .replace(/<br\s*\/?>/gi, "\n")
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, " ")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&mdash;/g, "—")
      .replace(/&ndash;/g, "–")
      .replace(/&hellip;/g, "...")
      // Clean up whitespace
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    // Limit content length but try to end at a sentence
    if (textContent.length > 8000) {
      textContent = textContent.slice(0, 8000);
      const lastPeriod = textContent.lastIndexOf(".");
      if (lastPeriod > 6000) {
        textContent = textContent.slice(0, lastPeriod + 1);
      }
    }

    return textContent || `[No content extracted from: ${url}]`;
  } catch (error) {
    console.error(`Error fetching URL ${url}:`, error);
    return `[Error fetching: ${url}]`;
  }
}

interface CompleteArticle {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
}

async function generateCompleteArticleWithClaude(
  prompt: string,
  apiKey: string,
  contextUrls: string[] = [],
): Promise<{ article: CompleteArticle; tokensUsed: number }> {
  // Fetch content from context URLs if provided
  let contextContent = "";
  const fetchedUrls: string[] = [];

  if (contextUrls.length > 0) {
    console.log(`Fetching content from ${contextUrls.length} URLs...`);
    const urlContents = await Promise.all(
      contextUrls.slice(0, 5).map(async (url) => {
        const content = await fetchUrlContent(url);
        if (!content.startsWith("[")) {
          fetchedUrls.push(url);
          return `\n\n=== SOURCE: ${url} ===\n${content}\n=== FIN SOURCE ===`;
        }
        return "";
      }),
    );
    contextContent = urlContents.filter((c) => c).join("\n");
    console.log(`Successfully fetched content from ${fetchedUrls.length} URLs`);
  }

  const hasContextUrls = contextContent.length > 100;

  const systemPrompt = `Tu es un expert en rédaction SEO et création de contenu blog. Ta tâche est de générer un article de blog complet, de qualité premium, en français.

Tu DOIS répondre avec un objet JSON valide contenant exactement ces 4 champs:
{
  "title": "Titre SEO optimisé et accrocheur (50-60 caractères)",
  "excerpt": "Extrait captivant pour les aperçus (150-200 caractères)",
  "content": "Contenu complet de l'article en HTML (2000+ mots, bien structuré avec des balises H2/H3)",
  "metaDescription": "Meta description SEO (150-160 caractères, inclut les mots-clés cibles)"
}

EXIGENCES CRITIQUES:
- TITRE: Accrocheur, riche en mots-clés, incite au clic (50-60 caractères optimal). NE PAS répéter le prompt de l'utilisateur.
- EXTRAIT: Fonctionne comme aperçu/teaser, incite à cliquer (150-200 caractères).
- CONTENU:
  * Format HTML avec balises <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
  * Minimum 2000 mots de contenu substantiel
  * COMMENCE DIRECTEMENT avec <h2> - pas de titre H1 ni texte d'intro avant
  * Inclut des listes à puces, exemples de code si pertinent, paragraphes engageants
  * ${hasContextUrls ? "BASE-TOI PRINCIPALEMENT sur le contenu des URLs sources fourni ci-dessous pour créer un article original qui synthétise et enrichit ces informations." : "Crée du contenu original, informatif et actionable."}
- META_DESCRIPTION: Optimisée pour les moteurs de recherche (150-160 caractères).

Écris en français. NE PAS inclure de texte placeholder ou Lorem ipsum.
Réponds UNIQUEMENT avec l'objet JSON, sans texte supplémentaire.`;

  const userMessage = hasContextUrls
    ? `Génère un article de blog complet basé sur le sujet: "${prompt}"

SOURCES DE RÉFÉRENCE À UTILISER:
${contextContent}

INSTRUCTIONS:
1. Analyse attentivement le contenu des sources ci-dessus
2. Crée un article ORIGINAL qui synthétise, réorganise et enrichit ces informations
3. Ajoute ta propre expertise et des insights supplémentaires
4. Structure l'article de manière logique avec des sections H2 et H3
5. Le contenu doit être en HTML (h2, h3, p, ul, li, strong, em)
6. Minimum 2000 mots

Génère le JSON avec: title, excerpt, content, metaDescription`
    : `Génère un article de blog complet sur le sujet: "${prompt}"

INSTRUCTIONS:
1. Crée un titre SEO accrocheur (50-60 caractères)
2. Écris un extrait captivant (150-200 caractères)
3. Génère un contenu premium de 2000+ mots en HTML
4. Crée une meta description SEO (150-160 caractères)

Le contenu doit utiliser les balises HTML: h2, h3, p, ul, li, strong, em
Commence directement avec <h2>, pas de titre H1.

Réponds avec le JSON: title, excerpt, content, metaDescription`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Claude API error:", errorData);
    throw new Error(
      `Claude API error: ${response.status} - ${JSON.stringify(errorData)}`,
    );
  }

  const data = await response.json();

  if (!data.content || data.content.length === 0) {
    throw new Error("No content generated from Claude API");
  }

  const responseText = data.content[0].text;
  const tokensUsed = data.usage?.output_tokens || 0;

  // Parse JSON response
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const article = JSON.parse(jsonMatch[0]) as CompleteArticle;

    // Validate required fields
    if (
      !article.title ||
      !article.excerpt ||
      !article.content ||
      !article.metaDescription
    ) {
      throw new Error("Missing required fields in generated article");
    }

    return { article, tokensUsed };
  } catch (parseError) {
    console.error("Failed to parse AI response:", parseError);
    throw new Error("Failed to parse AI-generated article");
  }
}

async function generateWithClaude(
  prompt: string,
  apiKey: string,
  type: string = "article",
): Promise<{ content: string; tokensUsed: number }> {
  const systemPrompt =
    type === "article"
      ? `You are a professional blog content writer. Write engaging, informative, and well-structured blog articles in French.
         Use proper Markdown formatting with headers (##), paragraphs, bullet points where appropriate.
         The content should be professional, informative, and valuable to readers.
         Do NOT include "Lorem ipsum" or any placeholder text.
         Write real, substantive content that provides actual value and information on the topic.`
      : `You are a professional content writer. Generate high-quality, well-structured content in French based on the given prompt.
         Use proper formatting and ensure the content is valuable and informative.
         Do NOT include "Lorem ipsum" or any placeholder text.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Write a blog article about: ${prompt}

Please create engaging, informative content that:
- Has a clear structure with introduction, main sections, and conclusion
- Provides real, valuable information (no placeholder text)
- Uses proper Markdown formatting
- Is written in French
- Is approximately 500-800 words`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Claude API error:", errorData);
    throw new Error(
      `Claude API error: ${response.status} - ${JSON.stringify(errorData)}`,
    );
  }

  const data = await response.json();

  if (!data.content || data.content.length === 0) {
    throw new Error("No content generated from Claude API");
  }

  const content = data.content[0].text;
  const tokensUsed = data.usage?.output_tokens || 0;

  return { content, tokensUsed };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Bad Request", message: "Prompt is required" },
        { status: 400 },
      );
    }

    // Get Claude API key from settings
    const apiKey = await getClaudeApiKey();
    console.log("Claude API Key check:", {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      startsWithSkAnt: apiKey?.startsWith("sk-ant-"),
      preview: apiKey ? `${apiKey.slice(0, 10)}...` : "null",
    });

    // Handle "complete" type - generates all 4 fields (title, excerpt, content, metaDescription)
    if (body.type === "complete") {
      const contextUrls = body.contextUrls || [];

      if (apiKey && apiKey.startsWith("sk-ant-")) {
        try {
          const { article, tokensUsed } =
            await generateCompleteArticleWithClaude(
              body.prompt,
              apiKey,
              contextUrls,
            );

          return NextResponse.json({
            success: true,
            data: {
              type: "complete",
              title: article.title,
              excerpt: article.excerpt,
              content: article.content,
              metaDescription: article.metaDescription,
              tokensUsed,
              model: "claude-sonnet-4",
            },
            message: "Complete article generated successfully with Claude AI",
          });
        } catch (claudeError) {
          const errorMessage =
            claudeError instanceof Error
              ? claudeError.message
              : String(claudeError);
          console.error("Claude API error for complete article:", errorMessage);

          // Return the actual error instead of silently falling back to demo
          return NextResponse.json(
            {
              success: false,
              error: "Claude API Error",
              message: `Erreur API Claude: ${errorMessage}`,
              details: errorMessage,
            },
            { status: 500 },
          );
        }
      }

      // Demo mode for complete article
      const demoArticle = generateDemoCompleteArticle(body.prompt);
      return NextResponse.json({
        success: true,
        data: {
          type: "complete",
          ...demoArticle,
          tokensUsed: 0,
          model: "demo-mode",
        },
        message:
          "Complete article generated in demo mode. Configure a Claude API key in Settings > Integrations for real AI generation.",
      });
    }

    // Standard generation (single content field)
    if (apiKey && apiKey.startsWith("sk-ant-")) {
      // Use real Claude API
      try {
        const { content, tokensUsed } = await generateWithClaude(
          body.prompt,
          apiKey,
          body.type || "article",
        );

        return NextResponse.json({
          success: true,
          data: {
            content,
            type: body.type || "article",
            tokensUsed,
            model: "claude-sonnet-4",
          },
          message: "Content generated successfully with Claude AI",
        });
      } catch (claudeError) {
        console.error("Claude API error:", claudeError);
        // Fall back to demo mode if Claude API fails
        return NextResponse.json({
          success: true,
          data: {
            content: generateDemoContent(body.prompt),
            type: body.type || "article",
            tokensUsed: 0,
            model: "demo-mode-fallback",
          },
          message:
            "Content generated in demo mode (Claude API error - check your API key)",
        });
      }
    }

    // Demo mode - no API key configured
    return NextResponse.json({
      success: true,
      data: {
        content: generateDemoContent(body.prompt),
        type: body.type || "article",
        tokensUsed: 0,
        model: "demo-mode",
      },
      message:
        "Content generated in demo mode. Configure a Claude API key in Settings > Integrations for real AI generation.",
    });
  } catch {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid request body" },
      { status: 400 },
    );
  }
}

function generateDemoContent(prompt: string): string {
  return `# Article sur: ${prompt}

## Introduction

Bienvenue dans cet article qui explore le sujet passionnant de "${prompt}". Dans le monde du développement moderne, comprendre ces concepts est essentiel pour tout développeur souhaitant rester à la pointe de la technologie.

## Contenu Principal

Le sujet de "${prompt}" est particulièrement pertinent dans le contexte actuel du développement web et des technologies modernes. Voici les points clés à retenir:

- **Point 1**: L'importance croissante de ce domaine dans l'industrie
- **Point 2**: Les meilleures pratiques recommandées par les experts
- **Point 3**: Comment intégrer ces concepts dans vos projets

### Détails Techniques

Pour approfondir ce sujet, il est recommandé d'explorer les ressources suivantes et de pratiquer régulièrement. L'apprentissage continu est la clé du succès dans ce domaine en constante évolution.

## Conclusion

En conclusion, maîtriser "${prompt}" vous permettra d'améliorer significativement vos compétences et la qualité de vos projets. N'hésitez pas à expérimenter et à partager vos découvertes avec la communauté.

---
*Note: Ceci est un contenu de démonstration. Configurez une clé API Claude dans Paramètres > Intégrations pour générer du contenu avec l'IA.*`;
}

function generateDemoCompleteArticle(prompt: string): {
  title: string;
  excerpt: string;
  content: string;
  metaDescription: string;
} {
  const cleanPrompt = prompt.slice(0, 50);

  return {
    title: `Guide Complet: ${cleanPrompt}`,
    excerpt: `Découvrez tout ce que vous devez savoir sur ${cleanPrompt}. Un guide pratique et détaillé pour maîtriser ce sujet essentiel du développement moderne.`,
    content: `# Guide Complet: ${prompt}

## Introduction

Dans le monde du développement web moderne, ${prompt} représente un sujet crucial que tout développeur se doit de maîtriser. Cet article vous guidera à travers les concepts fondamentaux, les meilleures pratiques et les techniques avancées.

## Pourquoi ${prompt} est Important

Comprendre ${prompt} est essentiel pour plusieurs raisons:

- **Productivité accrue**: Maîtriser ce sujet vous permettra de travailler plus efficacement
- **Code de meilleure qualité**: Vos projets bénéficieront de cette expertise
- **Évolution de carrière**: Les développeurs compétents dans ce domaine sont très recherchés

## Les Fondamentaux

### Concept 1: Les Bases

Avant de plonger dans les détails avancés, il est important de comprendre les fondamentaux. ${prompt} repose sur plusieurs principes clés que nous allons explorer.

Les bases incluent:

1. **Compréhension du contexte**: Savoir quand et pourquoi utiliser ces techniques
2. **Configuration initiale**: Mettre en place l'environnement nécessaire
3. **Premiers pas**: Commencer avec des exemples simples

### Concept 2: Application Pratique

Une fois les bases acquises, vous pouvez commencer à appliquer ces connaissances dans des projets réels. Voici quelques exemples concrets:

\`\`\`javascript
// Exemple de code illustrant le concept
function example() {
  console.log("Mise en pratique de ${cleanPrompt}");
  return true;
}
\`\`\`

### Concept 3: Techniques Avancées

Pour aller plus loin, explorez ces techniques avancées:

- Optimisation des performances
- Intégration avec d'autres outils
- Automatisation des processus
- Tests et validation

## Meilleures Pratiques

### Organisation du Code

Une bonne organisation est essentielle. Structurez votre code de manière logique et maintenable.

### Documentation

Documentez toujours votre travail. Cela facilitera la maintenance et la collaboration.

### Tests

N'oubliez pas d'écrire des tests pour valider votre implémentation.

## Outils Recommandés

Pour travailler efficacement avec ${prompt}, voici les outils recommandés:

| Outil | Utilisation | Niveau |
|-------|-------------|--------|
| VS Code | Éditeur principal | Débutant |
| Git | Contrôle de version | Débutant |
| Docker | Containerisation | Intermédiaire |
| CI/CD | Automatisation | Avancé |

## Ressources pour Aller Plus Loin

- Documentation officielle
- Tutoriels vidéo
- Communautés en ligne
- Projets open source

## Conclusion

Maîtriser ${prompt} est un investissement qui portera ses fruits tout au long de votre carrière. Commencez par les bases, pratiquez régulièrement, et n'hésitez pas à explorer les techniques avancées.

La clé du succès réside dans la pratique constante et l'apprentissage continu. Bonne chance dans votre parcours!

---
*Article généré en mode démonstration. Configurez une clé API Claude pour obtenir du contenu personnalisé et optimisé SEO.*`,
    metaDescription: `Guide complet sur ${cleanPrompt}: découvrez les fondamentaux, meilleures pratiques et techniques avancées pour maîtriser ce sujet essentiel.`,
  };
}
