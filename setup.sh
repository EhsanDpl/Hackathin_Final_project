#!/bin/bash

echo "🚀 SkillPilot AI - Docker Setup Script"
echo "========================================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   macOS: brew install --cask docker"
    echo "   Linux: See SETUP_DOCKER.md for installation commands"
    echo "   Windows: Download from https://www.docker.com/products/docker-desktop/"
    exit 1
fi

if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker is installed"

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Please edit .env file with your credentials!"
        echo "   Required: DB_PASSWORD, JWT_SECRET, GROQ_API_KEY, MAILERSEND_API_TOKEN, etc."
        echo ""
        echo "Press Enter after editing .env file (or Ctrl+C to exit)..."
        read
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

echo "🔨 Stopping any existing containers..."
docker compose down 2>/dev/null

echo "🔨 Building and starting Docker containers..."
docker compose up -d --build

echo "⏳ Waiting for services to start (15 seconds)..."
sleep 15

echo "📊 Checking container status..."
docker compose ps

echo ""
echo "🔍 Checking service health..."
echo "API Health:"
curl -s http://localhost:3001/healthcheck 2>/dev/null | head -3 || echo "   ⚠️  API not ready yet (may need more time)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - API Docs: http://localhost:3001/api-docs"
echo "  - Database: localhost:5433"
echo ""
echo "📝 Next steps:"
echo "  1. Seed admin user: docker compose exec api node scripts/seed-admin.js"
echo "  2. Check logs: docker compose logs -f"
echo "  3. Stop services: docker compose down"
echo ""
echo "📚 For more commands, see SETUP_DOCKER.md"

