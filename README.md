# ONEUP Portfolio

> Portfolio professionnel avec thème rétro gaming (années 80-90) pour développeur full-stack en reconversion professionnelle.

## Overview

Ce portfolio combine un design pixel art nostalgique avec des fonctionnalités modernes:
- Dashboard d'administration pour gérer projets et articles de blog
- Génération de contenu par IA (Claude API)
- Analytics de visite
- Easter eggs interactifs (Konami code, sprites cachés, sons 8-bit)

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router) avec React 18 et TypeScript
- **Styling:** Tailwind CSS avec shadcn/ui et tweakcn
- **State:** React hooks, Context API, Zustand
- **Animations:** Framer Motion
- **Rich Text:** Tiptap ou Novel (WYSIWYG)
- **Icons:** Lucide React + sprites pixel art custom

### Backend
- **Runtime:** Node.js avec Next.js API Routes
- **Database:** PostgreSQL (Vercel Postgres / Neon / Supabase)
- **ORM:** Drizzle ORM
- **Auth:** Better Auth (email/password)
- **Storage:** Vercel Blob Storage
- **Email:** Resend
- **AI:** Claude API (Anthropic SDK)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- PostgreSQL database (Vercel Postgres, Neon, or Supabase)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Run the setup script:
```bash
./init.sh
```

Or manually:
```bash
pnpm install
cp .env.example .env.local
# Fill in your environment variables
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here-minimum-32-chars

# AI (Anthropic Claude)
ANTHROPIC_API_KEY=

# Email (Resend)
RESEND_API_KEY=

# Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Site
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public pages (home, about, projects, blog, contact)
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── retro/            # Retro gaming themed components
├── lib/                   # Utilities and configurations
│   ├── db/               # Drizzle ORM setup
│   ├── ai/               # Claude API integration
│   └── auth/             # Better Auth setup
├── public/               # Static assets
│   ├── sounds/           # 8-bit sound effects
│   └── sprites/          # Pixel art sprites
├── styles/               # Global CSS
└── types/                # TypeScript types
```

## Features

### Public Pages
- **Homepage:** Hero with ONEUP logo and Miyazaki GIF background
- **About:** Parcours de reconversion, timeline
- **Projects:** Grid with filters, detail pages
- **Blog:** Articles with tags, search, syntax highlighting
- **Skills:** Categories with animated icons
- **Contact:** Form with email integration

### Admin Dashboard
- **Dashboard:** Stats, charts, quick actions
- **Projects:** CRUD, image upload, preview
- **Blog:** Rich text editor, AI generation, auto-save
- **Skills:** Drag & drop reordering
- **Media:** Library with upload, thumbnails
- **Analytics:** Visitors, page views, export
- **Settings:** Site config, export/import

### Retro Gaming Features
- 8-bit sound effects (toggle on/off)
- CRT scanlines overlay (toggle on/off)
- Konami code easter egg
- Hidden sprites (Mario, mushroom)
- Pixel art buttons and animations

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:push      # Push Drizzle schema to database
pnpm db:studio    # Open Drizzle Studio
```

## Testing

The project includes 277 end-to-end test cases in `feature_list.json` covering:
- Security & Access Control
- Navigation Integrity
- Real Data Verification
- Workflow Completeness
- Error Handling
- Responsive Design
- Accessibility
- Performance

## License

MIT

---

Made with Next.js and retro gaming vibes.
