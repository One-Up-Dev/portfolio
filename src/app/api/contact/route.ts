import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "../../../../db";
import { siteSettings } from "../../../../db/schema";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// POST /api/contact - Send contact form email
export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Format d'email invalide" },
        { status: 400 },
      );
    }

    // Get settings from database
    const settings = await db.select().from(siteSettings);
    const settingsObject: Record<string, string | null> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    const contactEmail = settingsObject.contactEmail || "contact@oneup.dev";
    const resendApiKey = settingsObject.resendApiKey;

    // Check if Resend API key is configured
    if (!resendApiKey) {
      console.error("Resend API key not configured");
      return NextResponse.json(
        { success: false, error: "Service d'email non configuré" },
        { status: 500 },
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);

    // Send email
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: contactEmail,
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Nouveau message de contact
          </h2>

          <div style="background-color: #1a1a2e; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: #f59e0b;">Nom:</strong></p>
            <p style="color: #ffffff; margin: 5px 0 15px 0;">${name}</p>

            <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: #f59e0b;">Email:</strong></p>
            <p style="color: #ffffff; margin: 5px 0 15px 0;"><a href="mailto:${email}" style="color: #60a5fa;">${email}</a></p>

            <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: #f59e0b;">Sujet:</strong></p>
            <p style="color: #ffffff; margin: 5px 0 15px 0;">${subject}</p>

            <p style="color: #9ca3af; margin: 5px 0;"><strong style="color: #f59e0b;">Message:</strong></p>
            <p style="color: #ffffff; margin: 5px 0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
            Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
          </p>
        </div>
      `,
      text: `
Nouveau message de contact

Nom: ${name}
Email: ${email}
Sujet: ${subject}

Message:
${message}

---
Ce message a été envoyé depuis le formulaire de contact de votre portfolio.
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'envoi de l'email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès",
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
