# 🐳 Frontend Docker Setup - Complete Guide

## ✅ Status: RUNNING SUCCESSFULLY

The complete full-stack application (Frontend + Backend + Database) is now running in Docker!

## 🚀 Quick Access

### Frontend Application
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Container**: `skillpilot-frontend`
- **Technology**: Next.js 16.0.3

### Backend API
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Container**: `skillpilot-api`
- **Technology**: NestJS + TypeScript

### Database
- **PostgreSQL**: Running on port `5433` (mapped from container port 5432)
- **Container**: `skillpilot-postgres`
- **Status**: ✅ Healthy

### API Documentation
- **Swagger UI**: http://localhost:3001/api-docs
- **Status**: ✅ Available

## 📋 Application Structure

```
Hackathin_Final_project/
├── Frontend/                    # Next.js Frontend
│   ├── Dockerfile              # Frontend Docker configuration
│   ├── .dockerignore           # Docker ignore rules
│   ├── pages/                   # Next.js pages
│   ├── components/              # React components
│   └── contexts/                # React contexts
├── skillpilot-mock-server/      # NestJS Backend
│   ├── Dockerfile              # Backend Docker configuration
│   ├── src/                     # NestJS source code
│   └── docker-compose.yml      # Backend-only compose (optional)
└── docker-compose.yml          # Root-level compose (Full Stack)

```

## 🐳 Docker Services

### All Services Running
```bash
NAME                  STATUS                    PORTS
skillpilot-frontend   Up                       0.0.0.0:3000->3000/tcp
skillpilot-api        Up                       0.0.0.0:3001->3001/tcp
skillpilot-postgres   Up (healthy)             0.0.0.0:5433->5432/tcp
```

## 🎯 Frontend Features

### Pages Available
- `/` - Login page
- `/dashboard` - Learner dashboard
- `/admin-dashboard` - Admin dashboard
- `/admin` - Admin management
- `/create-link` - Create sharing links
- `/shareLink` - Share link page

### Authentication
- Simple email-based authentication
- Role-based access (admin/learner)
- Local storage for session management

## 🔧 Docker Commands

### View Running Containers
```bash
cd Hackathin_Final_project
docker compose ps
```

### View Logs
```bash
# Frontend logs
docker compose logs frontend -f

# Backend logs
docker compose logs api -f

# Database logs
docker compose logs postgres -f

# All logs
docker compose logs -f
```

### Stop All Services
```bash
docker compose down
```

### Start All Services
```bash
docker compose up -d
```

### Restart Services
```bash
docker compose restart
```

### Rebuild After Code Changes
```bash
# Rebuild frontend
docker compose build frontend
docker compose up -d frontend

# Rebuild backend
docker compose build api
docker compose up -d api

# Rebuild all
docker compose build
docker compose up -d
```

### Seed Database
```bash
docker compose exec api npm run seed
```

## 🌐 Network Configuration

All services are connected via Docker network `skillpilot-network`:
- Frontend can access API at: `http://api:3001` (internal)
- Frontend exposed at: `http://localhost:3000` (external)
- API exposed at: `http://localhost:3001` (external)
- Database exposed at: `localhost:5433` (external)

## 📝 Environment Variables

### Frontend
- `NODE_ENV`: production
- `NEXT_PUBLIC_API_URL`: http://api:3001 (internal Docker network)

### Backend
- `NODE_ENV`: production
- `PORT`: 3001
- `DB_HOST`: postgres
- `DB_PORT`: 5432
- `DB_USER`: skillpilot
- `DB_PASSWORD`: skillpilot123
- `DB_NAME`: skillpilot_db

## 🧪 Testing the Application

### Test Frontend
```bash
# Open in browser
open http://localhost:3000

# Or use curl
curl http://localhost:3000
```

### Test Backend
```bash
# Health check
curl http://localhost:3001/healthcheck

# Get learners
curl http://localhost:3001/learners | jq
```

### Test Database Connection
```bash
docker compose exec postgres psql -U skillpilot -d skillpilot_db -c "SELECT COUNT(*) FROM learners;"
```

## 🔍 Troubleshooting

### Frontend Not Loading
1. Check if container is running: `docker compose ps`
2. Check logs: `docker compose logs frontend`
3. Verify port 3000 is not in use: `lsof -i :3000`

### Backend Not Responding
1. Check if container is running: `docker compose ps`
2. Check logs: `docker compose logs api`
3. Verify database is healthy: `docker compose ps postgres`

### Database Connection Issues
1. Check if database is healthy: `docker compose ps postgres`
2. Check database logs: `docker compose logs postgres`
3. Verify connection string in backend environment

### Build Errors
1. Clear Docker cache: `docker compose build --no-cache`
2. Remove old containers: `docker compose down -v`
3. Rebuild from scratch: `docker compose build --no-cache && docker compose up -d`

## 📊 Container Information

### Frontend Container
- **Image**: `hackathin_final_project-frontend`
- **Base Image**: `node:20-alpine`
- **Port**: `3000:3000`
- **Status**: Running
- **Build Time**: ~13 seconds

### Backend Container
- **Image**: `hackathin_final_project-api`
- **Base Image**: `node:18-alpine`
- **Port**: `3001:3001`
- **Status**: Running

### Database Container
- **Image**: `postgres:15-alpine`
- **Port**: `5433:5432`
- **Status**: Healthy
- **Volume**: `hackathin_final_project_postgres_data`

## ✨ Features

✅ **Full-Stack Docker Setup** - Frontend, Backend, and Database
✅ **Next.js 16** - Latest Next.js with Turbopack
✅ **NestJS Backend** - TypeScript-based API server
✅ **PostgreSQL Database** - Persistent data storage
✅ **Docker Networking** - Services communicate internally
✅ **Health Checks** - Database health monitoring
✅ **Hot Reload Ready** - Development-friendly setup
✅ **Production Ready** - Optimized builds

## 🎉 Success!

Your complete full-stack application is now running in Docker! 

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs

All services are connected and ready to use!

---

**Last Updated**: November 22, 2025
**Status**: ✅ Production Ready

