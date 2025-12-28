#!/bin/bash

# ONEUP Portfolio - Development Environment Setup
# ================================================
# This script initializes and starts the development environment
# for the ONEUP Portfolio application with retro gaming theme.

set -e

echo "🎮 ONEUP Portfolio - Development Environment Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ required. Current: $(node -v)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
}

# Check pnpm
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠ pnpm not found. Installing...${NC}"
        npm install -g pnpm
    fi
    echo -e "${GREEN}✓ pnpm $(pnpm -v) detected${NC}"
}

# Setup environment file
setup_env() {
    if [ ! -f .env.local ]; then
        echo -e "${YELLOW}⚠ Creating .env.local from template...${NC}"
        cat > .env.local << 'EOF'
# Database (Vercel Postgres / Neon / Supabase)
DATABASE_URL=

# Authentication (Better Auth)
BETTER_AUTH_SECRET=your-secret-key-here-minimum-32-chars

# AI Content Generation (Anthropic Claude)
ANTHROPIC_API_KEY=

# Email Service (Resend)
RESEND_API_KEY=

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Site Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
        echo -e "${YELLOW}⚠ Please fill in .env.local with your API keys before running${NC}"
        echo ""
    else
        echo -e "${GREEN}✓ .env.local exists${NC}"
    fi
}

# Install dependencies
install_deps() {
    echo ""
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    pnpm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Setup database
setup_database() {
    echo ""
    echo -e "${BLUE}🗄️ Setting up database...${NC}"

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠ DATABASE_URL not set. Skipping database setup.${NC}"
        echo "  Please set DATABASE_URL in .env.local and run: pnpm db:push"
        return
    fi

    # Run Drizzle migrations
    pnpm db:push
    echo -e "${GREEN}✓ Database schema synchronized${NC}"
}

# Create admin user seed
seed_admin() {
    echo ""
    echo -e "${BLUE}👤 Checking admin user...${NC}"

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠ DATABASE_URL not set. Skipping admin seed.${NC}"
        return
    fi

    # Run seed script if exists
    if [ -f "scripts/seed-admin.ts" ]; then
        pnpm tsx scripts/seed-admin.ts
        echo -e "${GREEN}✓ Admin user seeded${NC}"
    else
        echo -e "${YELLOW}⚠ No seed script found. Admin user needs manual creation.${NC}"
    fi
}

# Start development server
start_dev() {
    echo ""
    echo -e "${BLUE}🚀 Starting development server...${NC}"
    echo ""
    echo "=================================================="
    echo -e "${GREEN}🎮 ONEUP Portfolio is starting!${NC}"
    echo ""
    echo "  📍 Local:    http://localhost:3000"
    echo "  📍 Admin:    http://localhost:3000/admin"
    echo ""
    echo "  Press Ctrl+C to stop the server"
    echo "=================================================="
    echo ""

    pnpm dev
}

# Main execution
main() {
    check_node
    check_pnpm
    setup_env

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        install_deps
    else
        echo -e "${GREEN}✓ Dependencies already installed${NC}"
        echo -e "${YELLOW}  Run 'pnpm install' to update if needed${NC}"
    fi

    # Load env vars for database check
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi

    # Optional: setup database (comment out if not needed initially)
    # setup_database
    # seed_admin

    start_dev
}

# Run main function
main
