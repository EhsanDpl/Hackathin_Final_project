# 🐳 Docker Setup Guide - Complete Commands

This guide provides all necessary commands to set up and run the SkillPilot AI project on a new PC.

## Prerequisites Check

```bash
# Check if Docker is installed
docker --version

# Check if Docker Compose is installed
docker compose version

# If not installed, see installation section below
```

## Installation Commands

### For macOS

```bash
# Install Docker Desktop for Mac
# Download from: https://www.docker.com/products/docker-desktop/
# Or use Homebrew:
brew install --cask docker
```

### For Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
```

### For Windows

```bash
# Download Docker Desktop for Windows from:
# https://www.docker.com/products/docker-desktop/
# Install and restart your computer
```

## Project Setup Commands

### 1. Clone or Copy the Project

```bash
# If using Git
git clone <repository-url>
cd Hackathin_Final_project

# Or if you have the project files, navigate to the project directory
cd /path/to/Hackathin_Final_project
```

### 2. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use your preferred editor (vim, code, etc.)
```

**Required variables in `.env`:**
```env
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
GROQ_API_KEY=your_groq_api_key
MAILERSEND_API_TOKEN=your_mailersend_token
MAILERSEND_FROM_EMAIL=noreply@your-verified-domain.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Start Docker Services

```bash
# Build and start all containers
docker compose up -d --build

# Or in one command (if docker-compose is separate)
docker-compose up -d --build
```

### 4. Check Container Status

```bash
# View running containers
docker compose ps

# View logs
docker compose logs

# View logs for specific service
docker compose logs api
docker compose logs frontend
docker compose logs postgres
docker compose logs redis
```

### 5. Initialize Database (First Time Only)

```bash
# Seed admin user
docker compose exec api node scripts/seed-admin.js

# Or if running locally
cd skillpilot-mock-server
npm install
node scripts/seed-admin.js
```

## Complete Setup Script (All-in-One)

Save this as `setup.sh` and run: `chmod +x setup.sh && ./setup.sh`

```bash
#!/bin/bash

echo "🚀 SkillPilot AI - Docker Setup Script"
echo "========================================"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker is installed"

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your credentials before continuing!"
    echo "Press Enter after editing .env file..."
    read
fi

echo "🔨 Building and starting Docker containers..."
docker compose down 2>/dev/null  # Stop any existing containers
docker compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 10

echo "📊 Checking container status..."
docker compose ps

echo "🔍 Checking service health..."
echo "API Health:"
curl -s http://localhost:3001/healthcheck | head -5 || echo "API not ready yet"

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
```

## Common Commands

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### Stop and Remove Volumes (Clean Start)
```bash
docker compose down -v
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres
```

### Restart a Service
```bash
docker compose restart api
docker compose restart frontend
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker compose build api
docker compose up -d api

# Rebuild all
docker compose build
docker compose up -d
```

### Access Container Shell
```bash
# API container
docker compose exec api sh

# Database container
docker compose exec postgres psql -U skillpilot -d skillpilot_db
```

### Clean Up
```bash
# Stop and remove containers
docker compose down

# Remove containers, networks, and volumes
docker compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :3001  # API
lsof -i :5433  # Database

# Kill the process or change port in docker-compose.yml
```

### Database Connection Issues
```bash
# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres

# Check database connection
docker compose exec postgres psql -U skillpilot -d skillpilot_db -c "SELECT NOW();"
```

### Container Won't Start
```bash
# Check logs
docker compose logs <service-name>

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Permission Issues (Linux)
```bash
# Fix Docker permissions
sudo chmod 666 /var/run/docker.sock
# Or add user to docker group
sudo usermod -aG docker $USER
# Then log out and log back in
```

## Quick Start (Minimal Commands)

```bash
# 1. Navigate to project
cd Hackathin_Final_project

# 2. Create .env file
cp .env.example .env
# Edit .env with your credentials

# 3. Start everything
docker compose up -d --build

# 4. Wait for services (30 seconds)
sleep 30

# 5. Seed admin
docker compose exec api node scripts/seed-admin.js

# 6. Access
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

## Verification Commands

```bash
# Check all services are running
docker compose ps

# Test API
curl http://localhost:3001/healthcheck

# Test Frontend (should return HTML)
curl http://localhost:3000

# Check database
docker compose exec postgres psql -U skillpilot -d skillpilot_db -c "\dt"

# Check Redis
docker compose exec redis redis-cli ping
```

## Environment Variables Reference

All required environment variables are in `.env.example`. Copy it to `.env` and fill in:

- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `GROQ_API_KEY` - Groq API key for AI features
- `MAILERSEND_API_TOKEN` - MailerSend API token
- `MAILERSEND_FROM_EMAIL` - Verified email domain
- `ADMIN_EMAIL` - Super admin email
- `ADMIN_PASSWORD` - Super admin password

---

**That's it!** Your SkillPilot AI application should now be running on the new PC.

