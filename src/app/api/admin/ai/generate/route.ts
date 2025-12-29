import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { siteSettings } from "../../../../../../db/schema";
import { eq } from "drizzle-orm";

function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const sessionCookie = request.cookies.get("admin_session");

  if (authHeader?.startsWith("Bearer ") && authHeader.length > 10) {
    return true;
  }

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.isAuthenticated && session.expiresAt > Date.now()) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

async function getClaudeApiKey(): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "claude_api_key"))
      .limit(1);

    if (result.length > 0 && result[0].value) {
      return result[0].value as string;
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch content from URL for context
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BlogContentBot/1.0)",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return `[Could not fetch: ${url}]`;
    }

    const html = await response.text();
    // Extract text content from HTML (basic extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000); // Limit to 5000 chars per URL

    return textContent || `[No content extracted from: ${url}]`;
  } catch {
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
  if (contextUrls.length > 0) {
    const urlContents = await Promise.all(
      contextUrls.slice(0, 5).map(async (url) => {
        const content = await fetchUrlContent(url);
        return `\n\n--- Content from ${url} ---\n${content}`;
      }),
    );
    contextContent = urlContents.join("\n");
  }

  const systemPrompt = `You are an expert SEO content writer and blog specialist. Your task is to generate a complete, premium-quality blog article in French.

You MUST respond with a valid JSON object containing exactly these 4 fields:
{
  "title": "SEO-optimized engaging title (50-60 characters)",
  "excerpt": "Compelling excerpt for previews (150-200 characters)",
  "content": "Full article content in Markdown format (2000+ words, well-structured with H2/H3 headers)",
  "metaDescription": "SEO meta description (150-160 characters, includes target keywords)"
}

Requirements for each field:
- TITLE: Engaging, keyword-rich, clickable (50-60 chars optimal for SEO). IMPORTANT: Do NOT repeat or include the user's prompt description in the title.
- EXCERPT: Works as a preview/teaser, enticing readers to click (150-200 chars). Do NOT mention or repeat the prompt.
- CONTENT: Premium quality, minimum 2000 words, uses ## (H2) and ### (H3) headers ONLY (never use #). CRITICAL: Content MUST START DIRECTLY with ## - no introductory text or title. Includes bullet points, code examples if relevant, engaging paragraphs.
- META_DESCRIPTION: Optimized for search engines, includes primary keyword, drives click-through (150-160 chars). Do NOT include the prompt description.

Write in French. Do NOT include any placeholder text or Lorem ipsum. Provide real, valuable, actionable content.
Respond ONLY with the JSON object, no additional text.`;

  const userMessage = `Generate a complete blog article about: "${prompt}"

${contextContent ? `Use the following reference content to enrich your article and ensure accuracy:\n${contextContent}` : ""}

Remember to:
1. Create an engaging, SEO-optimized title (50-60 characters)
2. Write a compelling excerpt for article previews (150-200 characters)
3. Generate premium, long-form content (2000+ words) with proper structure
4. Create an SEO meta description (150-160 characters)

Respond with a JSON object containing: title, excerpt, content, metaDescription`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
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
      model: "claude-3-haiku-20240307",
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
  if (!isAuthenticated(request)) {
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
              model: "claude-3-5-sonnet",
            },
            message: "Complete article generated successfully with Claude AI",
          });
        } catch (claudeError) {
          console.error("Claude API error for complete article:", claudeError);
          // Fall back to demo mode
          const demoArticle = generateDemoCompleteArticle(body.prompt);
          return NextResponse.json({
            success: true,
            data: {
              type: "complete",
              ...demoArticle,
              tokensUsed: 0,
              model: "demo-mode-fallback",
            },
            message:
              "Complete article generated in demo mode (Claude API error - check your API key)",
          });
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
            model: "claude-3-haiku",
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
