#!/bin/bash
# AgentForge Quick Start Script
# Handles full setup from zero

set -e

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║        AGENTFORGE QUICK START             ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
  echo "⚠️  PostgreSQL not found. Starting with Docker..."
  if command -v docker &> /dev/null; then
    docker compose up -d postgres
    echo "⏳ Waiting for PostgreSQL..."
    sleep 3
  else
    echo "❌ Neither PostgreSQL nor Docker found."
    echo "   Install PostgreSQL: https://postgresql.org/download"
    exit 1
  fi
else
  echo "✅ PostgreSQL found"
fi

# Copy env if missing
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Edit .env to set your DATABASE_URL, ZEROG_PRIVATE_KEY, and OPENAI_API_KEY"
  echo "   (App works in demo mode without 0G and OpenAI keys)"
fi

# Install deps
echo ""
echo "📦 Installing dependencies..."
npm install --silent

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate --silent

# Push schema
echo "📊 Setting up database..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || {
  echo "❌ Database connection failed. Check DATABASE_URL in .env"
  exit 1
}

# Seed
echo "🌱 Seeding demo data..."
npm run db:seed 2>/dev/null || echo "⚠️  Seed failed (may already be seeded)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting AgentForge..."
echo "   Local: http://localhost:3000"
echo ""

npm run dev
