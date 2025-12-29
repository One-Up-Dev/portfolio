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
