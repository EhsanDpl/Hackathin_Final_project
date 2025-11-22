# ⚡ Quick Start Guide - SkillPilot AI with Docker

## 🎯 5-Minute Setup

### Step 1: Install Docker

**macOS/Windows:**
1. Download from: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Verify: `docker --version`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
```

### Step 2: Start the Application

```bash
# Navigate to project
cd skillpilot-mock-server

# Start everything (PostgreSQL + API)
docker-compose up --build
```

Wait for: `✅ Connected to PostgreSQL database`

### Step 3: Seed the Database

Open a **new terminal** and run:

```bash
cd skillpilot-mock-server
docker-compose exec api npm run seed
```

You should see: `🎉 Database seeding completed successfully!`

### Step 4: Test It!

```bash
# Health check
curl http://localhost:3001/healthcheck

# Get learners
curl http://localhost:3001/learners

# Or open in browser:
# http://localhost:3001/api-docs
```

## ✅ Done!

Your API is running at:
- **API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api-docs

## 🛠️ Common Commands

```bash
# Stop containers
docker-compose stop

# View logs
docker-compose logs -f api

# Restart
docker-compose restart

# Remove everything (including data)
docker-compose down -v
```

## ❓ Need Help?

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed instructions and troubleshooting.

