# 🐳 Single Command Docker Setup

## Complete Setup Command (One Line)

Copy and paste this entire command:

```bash
cd /path/to/Hackathin_Final_project && [ -f .env ] || (cp .env.example .env && echo "⚠️  Edit .env file with your credentials!" && ${EDITOR:-nano} .env) && docker compose down 2>/dev/null; docker compose up -d --build && sleep 30 && docker compose exec -T api node scripts/seed-admin.js 2>/dev/null && echo "✅ Setup complete! Frontend: http://localhost:3000 | API: http://localhost:3001"
```

## Or Use the Setup Script

```bash
chmod +x docker-setup.sh && ./docker-setup.sh
```

## Manual Step-by-Step (If Needed)

### 1. Navigate to Project
```bash
cd Hackathin_Final_project
```

### 2. Create Environment File
```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

### 3. Start Everything
```bash
docker compose up -d --build
```

### 4. Wait and Seed
```bash
sleep 30 && docker compose exec api node scripts/seed-admin.js
```

### 5. Verify
```bash
docker compose ps
curl http://localhost:3001/healthcheck
```

## Quick Commands Reference

```bash
# Start all services
docker compose up -d --build

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart specific service
docker compose restart api

# Check status
docker compose ps

# Rebuild after code changes
docker compose build api && docker compose up -d api

# Clean restart (removes volumes)
docker compose down -v && docker compose up -d --build
```

## Troubleshooting

```bash
# If port is in use
docker compose down
# Change ports in docker-compose.yml or kill process using the port

# If containers won't start
docker compose logs api
docker compose logs frontend
docker compose logs postgres

# Complete reset
docker compose down -v
docker compose build --no-cache
docker compose up -d
```
