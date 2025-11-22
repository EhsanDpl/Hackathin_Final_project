# 🚀 Quick Start - Run on New PC

## One-Line Setup (After Docker is installed)

```bash
git clone <repo-url> && cd Hackathin_Final_project && cp .env.example .env && nano .env && docker compose up -d --build && sleep 30 && docker compose exec api node scripts/seed-admin.js
```

## Step-by-Step Commands

### 1. Install Docker (if not installed)
```bash
# macOS
brew install --cask docker

# Linux (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and log back in
```

### 2. Clone and Setup Project
```bash
# Clone repository
git clone <repository-url>
cd Hackathin_Final_project

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or vim, code, etc.
```

### 3. Start Docker Containers
```bash
# Build and start all services
docker compose up -d --build

# Wait for services to start
sleep 30
```

### 4. Initialize Database
```bash
# Seed admin user
docker compose exec api node scripts/seed-admin.js
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

## Or Use the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart a service
docker compose restart api

# Rebuild after code changes
docker compose build api && docker compose up -d api
```

## Troubleshooting

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs api
docker compose logs frontend

# Restart everything
docker compose down && docker compose up -d --build
```

For detailed setup instructions, see `SETUP_DOCKER.md`
