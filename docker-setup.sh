#!/bin/bash
# SkillPilot AI - Complete Docker Setup Command
# Usage: ./docker-setup.sh

set -e

echo "🚀 SkillPilot AI - Complete Docker Setup"
echo "========================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing Docker..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "📦 macOS detected. Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
        exit 1
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "📦 Installing Docker on Linux..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "⚠️  Please log out and log back in, then run this script again"
        exit 0
    else
        echo "❌ Unsupported OS. Please install Docker manually."
        exit 1
    fi
fi

# Check Docker Compose
if ! docker compose version &> /dev/null && ! docker-compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is installed"

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  IMPORTANT: Please edit .env file with your credentials!"
        echo "   Required: DB_PASSWORD, JWT_SECRET, GROQ_API_KEY, MAILERSEND_API_TOKEN, etc."
        echo ""
        read -p "Press Enter after editing .env file (or Ctrl+C to exit)..."
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

# Build and start
echo "🔨 Building and starting containers..."
docker compose up -d --build

# Wait for services
echo "⏳ Waiting for services to start (20 seconds)..."
sleep 20

# Check status
echo "📊 Container Status:"
docker compose ps

# Wait a bit more for services to be ready
echo "⏳ Waiting for services to be ready (10 more seconds)..."
sleep 10

# Seed admin
echo "👤 Seeding admin user..."
docker compose exec -T api node scripts/seed-admin.js 2>/dev/null || echo "⚠️  Admin seeding may have failed (check if user exists)"

# Health check
echo ""
echo "🔍 Health Checks:"
echo "API:"
curl -s http://localhost:3001/healthcheck 2>/dev/null | head -3 || echo "   ⚠️  API not ready yet"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🌐 Access Points:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Docs:    http://localhost:3001/api-docs"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:    docker compose logs -f"
echo "   Stop:         docker compose down"
echo "   Restart:      docker compose restart"
echo "   Status:       docker compose ps"
