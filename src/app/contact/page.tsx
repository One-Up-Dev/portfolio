"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  Github,
  Linkedin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simulate form submission (will be replaced with real API call)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo, always succeed
    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="py-20">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-pixel text-2xl text-primary md:text-3xl">
            Contact
          </h1>
          <p className="text-lg text-muted-foreground">
            Discutons de votre projet ou simplement échangeons !
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-6 text-lg font-semibold">
              Envoyez-moi un message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Nom <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Votre nom"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Sujet <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Sujet de votre message"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Votre message..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </button>

              {/* Status Messages */}
              {status === "success" && (
                <div className="flex items-center gap-2 rounded-lg bg-green-500/20 p-3 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Message envoyé avec succès !</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/20 p-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>Une erreur est survenue. Veuillez réessayer.</span>
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Direct Contact */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Contact direct</h2>

              <div className="space-y-4">
                <a
                  href="mailto:contact@oneup.dev"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      contact@oneup.dev
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold">Réseaux sociaux</h2>

              <div className="space-y-4">
                <a
                  href="https://github.com/oneup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GitHub</p>
                    <p className="font-medium text-foreground">@oneup</p>
                  </div>
                </a>

                <a
                  href="https://linkedin.com/in/oneup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                >
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                    <p className="font-medium text-foreground">ONEUP</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Availability */}
            <div className="rounded-lg border border-primary/50 bg-primary/5 p-6">
              <h3 className="mb-2 font-semibold text-primary">
                ✨ Disponible pour des projets
              </h3>
              <p className="text-sm text-muted-foreground">
                Je suis actuellement disponible pour des missions freelance ou
                des collaborations. N&apos;hésitez pas à me contacter !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
