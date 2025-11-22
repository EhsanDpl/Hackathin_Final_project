# 🐳 Docker & PostgreSQL Setup Guide for SkillPilot AI

This guide will help you set up SkillPilot AI with Docker and PostgreSQL, even if you're new to Docker.

## 📋 Table of Contents
1. [What is Docker?](#what-is-docker)
2. [Installing Docker](#installing-docker)
3. [Understanding the Setup](#understanding-the-setup)
4. [Quick Start](#quick-start)
5. [Detailed Steps](#detailed-steps)
6. [Troubleshooting](#troubleshooting)

---

## 🤔 What is Docker?

**Docker** is a platform that allows you to package your application and all its dependencies into a "container" that can run anywhere. Think of it like a shipping container for software - it works the same way on your laptop, your colleague's computer, or a server.

**Key Concepts:**
- **Container**: A lightweight, standalone package containing your app and everything it needs
- **Image**: A template for creating containers (like a blueprint)
- **Docker Compose**: A tool to run multiple containers together (like your app + database)

**Why use Docker?**
- ✅ Works the same on any computer
- ✅ Easy to share with teammates
- ✅ No need to install PostgreSQL, Node.js, etc. on your machine
- ✅ Clean and isolated environment

---

## 💻 Installing Docker

### For macOS

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Mac"
   - Choose the version for your Mac (Intel or Apple Silicon/M1/M2)

2. **Install:**
   - Open the downloaded `.dmg` file
   - Drag Docker to Applications folder
   - Open Docker from Applications
   - Follow the setup wizard

3. **Verify Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

### For Windows

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"

2. **Install:**
   - Run the installer
   - Follow the setup wizard
   - Restart your computer if prompted

3. **Verify Installation:**
   ```bash
   docker --version
   docker-compose --version
   ```

### For Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to avoid sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

---

## 🏗️ Understanding the Setup

Our Docker setup includes:

1. **PostgreSQL Container** (`postgres`)
   - Database server running in a container
   - Port 5432 exposed to your machine
   - Data persists in a Docker volume

2. **Node.js API Container** (`api`)
   - Your Express server running in a container
   - Port 3001 exposed to your machine
   - Connects to PostgreSQL container

3. **Docker Compose**
   - Orchestrates both containers
   - Sets up networking between them
   - Manages startup order

**File Structure:**
```
skillpilot-mock-server/
├── Dockerfile              # Instructions to build Node.js container
├── docker-compose.yml      # Configuration for both containers
├── init.sql                # Database schema (runs automatically)
├── server-pg.js            # PostgreSQL version of server
├── scripts/
│   └── seed.js            # Script to populate database
└── db.json                # Source data for seeding
```

---

## 🚀 Quick Start

Once Docker is installed, follow these steps:

```bash
# 1. Navigate to project directory
cd skillpilot-mock-server

# 2. Build and start containers
docker-compose up --build

# 3. In a new terminal, seed the database
docker-compose exec api npm run seed

# 4. Test the API
curl http://localhost:3001/healthcheck
```

**That's it!** Your API is now running at `http://localhost:3001`

---

## 📝 Detailed Steps

### Step 1: Navigate to Project Directory

```bash
cd "/Users/ehsanullah/Desktop/Final Hackathon/skillpilot-mock-server"
```

### Step 2: Build Docker Images

This creates the container images for your application:

```bash
docker-compose build
```

**What happens:**
- Reads `Dockerfile` to build Node.js container
- Downloads PostgreSQL image
- Sets up the environment

### Step 3: Start Containers

```bash
docker-compose up
```

**What happens:**
- Starts PostgreSQL container
- Waits for PostgreSQL to be ready
- Starts Node.js API container
- Creates database tables from `init.sql`

**To run in background (detached mode):**
```bash
docker-compose up -d
```

### Step 4: Seed the Database

Populate the database with sample data:

```bash
docker-compose exec api npm run seed
```

**What happens:**
- Runs the seed script inside the API container
- Reads data from `db.json`
- Inserts all learners, profiles, missions, etc. into PostgreSQL

### Step 5: Verify Everything Works

```bash
# Check health
curl http://localhost:3001/healthcheck

# Get all learners
curl http://localhost:3001/learners

# Get GitHub profiles
curl http://localhost:3001/githubProfiles

# Get LinkedIn profiles
curl http://localhost:3001/linkedinProfiles
```

Or open in browser:
- API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api-docs

---

## 🛠️ Common Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs postgres

# Follow logs (like tail -f)
docker-compose logs -f api
```

### Stop Containers
```bash
docker-compose stop
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Stop, Remove Containers AND Data
```bash
docker-compose down -v
```
⚠️ **Warning:** This deletes all database data!

### Restart Containers
```bash
docker-compose restart
```

### Access Container Shell
```bash
# Access API container
docker-compose exec api sh

# Access PostgreSQL container
docker-compose exec postgres psql -U skillpilot -d skillpilot_db
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to Docker daemon"

**Solution:**
- Make sure Docker Desktop is running
- On Linux: `sudo systemctl start docker`

### Problem: "Port already in use"

**Solution:**
- Check if something is using port 3001 or 5432:
  ```bash
  # macOS/Linux
  lsof -i :3001
  lsof -i :5432
  
  # Windows
  netstat -ano | findstr :3001
  ```
- Stop the conflicting service or change ports in `docker-compose.yml`

### Problem: "Database connection failed"

**Solution:**
1. Check if PostgreSQL container is running:
   ```bash
   docker-compose ps
   ```
2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```
3. Wait a few seconds - PostgreSQL needs time to start

### Problem: "Module not found" errors

**Solution:**
- Rebuild the container:
  ```bash
  docker-compose build --no-cache api
  docker-compose up
  ```

### Problem: Database is empty after restart

**Solution:**
- The database data is stored in a Docker volume
- If you ran `docker-compose down -v`, the volume was deleted
- Re-seed the database:
  ```bash
  docker-compose exec api npm run seed
  ```

### Problem: Changes to code not reflected

**Solution:**
- Rebuild the container:
  ```bash
  docker-compose up --build
  ```

### View Container Logs for Debugging
```bash
# All logs
docker-compose logs

# Specific service with timestamps
docker-compose logs -f --timestamps api
```

---

## 🔐 Database Credentials

**Default credentials (set in docker-compose.yml):**
- **Host:** `postgres` (inside Docker network) or `localhost` (from your machine)
- **Port:** `5432`
- **Database:** `skillpilot_db`
- **Username:** `skillpilot`
- **Password:** `skillpilot123`

**To change credentials:**
1. Edit `docker-compose.yml`
2. Update environment variables
3. Rebuild: `docker-compose up --build`

---

## 📊 Database Management

### Connect to PostgreSQL from Your Machine

```bash
# Using psql (if installed)
psql -h localhost -U skillpilot -d skillpilot_db

# Or using Docker
docker-compose exec postgres psql -U skillpilot -d skillpilot_db
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U skillpilot skillpilot_db > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U skillpilot skillpilot_db < backup.sql
```

---

## 🎯 Next Steps

1. **Explore the API:**
   - Visit http://localhost:3001/api-docs for Swagger documentation
   - Try different endpoints

2. **Modify Data:**
   - Edit `db.json` and re-run seed script
   - Or connect directly to PostgreSQL

3. **Develop:**
   - Make changes to `server-pg.js`
   - Rebuild: `docker-compose up --build`

4. **Deploy:**
   - Use the same `docker-compose.yml` on any server
   - Or build images for cloud platforms

---

## 📚 Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Docker Compose Reference:** https://docs.docker.com/compose/

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Docker is installed and running
- [ ] `docker-compose ps` shows both containers running
- [ ] `http://localhost:3001/healthcheck` returns OK
- [ ] `http://localhost:3001/learners` returns learner data
- [ ] `http://localhost:3001/githubProfiles` returns GitHub profiles
- [ ] `http://localhost:3001/linkedinProfiles` returns LinkedIn profiles
- [ ] Swagger docs accessible at `http://localhost:3001/api-docs`

---

**Need Help?** Check the logs: `docker-compose logs` or review the troubleshooting section above.

