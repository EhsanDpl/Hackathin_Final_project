# 🐳 Docker Final Product - SkillPilot AI API Server

## ✅ Status: RUNNING SUCCESSFULLY

The combined NestJS + Mock Server application is now running in Docker containers!

## 🚀 Quick Access

### API Server
- **URL**: http://localhost:3001
- **Status**: ✅ Running
- **Container**: `skillpilot-api`

### Database
- **PostgreSQL**: Running on port `5433` (mapped from container port 5432)
- **Container**: `skillpilot-postgres`
- **Status**: ✅ Healthy

### API Documentation
- **Swagger UI**: http://localhost:3001/api-docs
- **Status**: ✅ Available

## 📋 Available Endpoints

### Mock Server Endpoints (No prefix)

#### Health & System
- `GET /healthcheck` - Health check endpoint
  ```bash
  curl http://localhost:3001/healthcheck
  ```

#### Learners
- `GET /learners` - Get all learners
- `GET /learners/:id` - Get specific learner by ID
  ```bash
  curl http://localhost:3001/learners
  curl http://localhost:3001/learners/1
  ```

#### Integrations
- `GET /githubProfiles` - Get GitHub profiles (optional: `?learnerId=1`)
- `GET /linkedinProfiles` - Get LinkedIn profiles (optional: `?learnerId=1`)
- `GET /skillAssessments` - Get skill assessments (optional: `?learnerId=1`)
- `GET /learningPaths` - Get learning paths (optional: `?learnerId=1`)
- `GET /dailyMissions` - Get daily missions (optional: `?learnerId=1`)
- `GET /teamsCalendar` - Get Teams calendar (optional: `?learnerId=1`)
- `GET /jiraData` - Get JIRA data (optional: `?learnerId=1`)
- `GET /skillTaxonomy` - Get skill taxonomy
- `GET /courses` - Get courses

### LangChain Chat Endpoints (Prefix: `/api/v1/langchain-chat`)

- `POST /api/v1/langchain-chat/basic-chat` - Basic AI chat
  ```bash
  curl -X POST http://localhost:3001/api/v1/langchain-chat/basic-chat \
    -H "Content-Type: application/json" \
    -d '{"user_query": "What is TypeScript?"}'
  ```

- `POST /api/v1/langchain-chat/context-aware-chat` - Context-aware chat
  ```bash
  curl -X POST http://localhost:3001/api/v1/langchain-chat/context-aware-chat \
    -H "Content-Type: application/json" \
    -d '{"messages": [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}, {"role": "user", "content": "What is NestJS?"}]}'
  ```

- `POST /api/v1/langchain-chat/document-chat` - Document-based chat (requires vector store)
- `POST /api/v1/langchain-chat/agent-chat` - Agent-based chat with search
- `POST /api/v1/langchain-chat/upload-document` - Upload PDF document

## 🗄️ Database Status

### Seeded Data
✅ Database has been successfully seeded with:
- **10 learners** - Complete learner profiles
- **10 GitHub profiles** - GitHub integration data
- **5 LinkedIn profiles** - LinkedIn integration data
- **50 skill assessments** - Skill assessment records
- **10 learning paths** - Learning path recommendations
- **10 daily missions** - Daily mission data
- **4 Teams calendar events** - Calendar integration
- **4 JIRA records** - JIRA integration data

### Database Connection
- **Host**: `postgres` (internal Docker network)
- **Port**: `5432` (internal), `5433` (external)
- **Database**: `skillpilot_db`
- **User**: `skillpilot`
- **Password**: `skillpilot123`

## 🐳 Docker Commands

### View Running Containers
```bash
cd skillpilot-mock-server
docker compose ps
```

### View Logs
```bash
# API logs
docker compose logs api -f

# Database logs
docker compose logs postgres -f

# All logs
docker compose logs -f
```

### Stop Containers
```bash
docker compose down
```

### Start Containers
```bash
docker compose up -d
```

### Restart Containers
```bash
docker compose restart
```

### Rebuild After Code Changes
```bash
docker compose build api
docker compose up -d
```

### Seed Database (if needed)
```bash
docker compose exec api npm run seed
```

## 📊 Container Information

### API Container
- **Image**: `skillpilot-mock-server-api`
- **Port**: `3001:3001`
- **Status**: Running
- **Technology**: NestJS + TypeScript

### PostgreSQL Container
- **Image**: `postgres:15-alpine`
- **Port**: `5433:5432`
- **Status**: Healthy
- **Volume**: `skillpilot-mock-server_postgres_data`

## 🔧 Configuration

### Environment Variables
The application uses the following environment variables (set in docker-compose.yml):
- `NODE_ENV`: production
- `PORT`: 3001
- `DB_HOST`: postgres
- `DB_PORT`: 5432
- `DB_USER`: skillpilot
- `DB_PASSWORD`: skillpilot123
- `DB_NAME`: skillpilot_db

### Optional: Vector Store
To enable document chat functionality, set:
- `ENABLE_VECTOR_STORE`: true
- Requires a separate PostgreSQL instance with pgvector extension

## 🧪 Testing the API

### Test Health Check
```bash
curl http://localhost:3001/healthcheck
```

### Test Learners Endpoint
```bash
curl http://localhost:3001/learners | jq
```

### Test GitHub Profiles
```bash
curl http://localhost:3001/githubProfiles | jq
```

### Test LangChain Basic Chat
```bash
curl -X POST http://localhost:3001/api/v1/langchain-chat/basic-chat \
  -H "Content-Type: application/json" \
  -d '{"user_query": "Explain NestJS in one sentence"}' | jq
```

## 📝 Notes

1. **Vector Store**: The vector store for document chat is optional. The application will start without it, but document chat features will not be available unless `ENABLE_VECTOR_STORE=true` is set and a pgvector database is configured.

2. **Port Conflicts**: If port 3001 is already in use, you can change it in `docker-compose.yml` under the `api` service `ports` section.

3. **Database Persistence**: Data is persisted in a Docker volume. To reset the database, remove the volume:
   ```bash
   docker compose down -v
   ```

4. **API Documentation**: Full API documentation is available at http://localhost:3001/api-docs with Swagger UI.

## ✨ Features

✅ **NestJS Framework** - Modern, scalable Node.js framework
✅ **TypeScript** - Type-safe development
✅ **PostgreSQL Integration** - Robust database support
✅ **JSON Fallback** - Works without database (if DB_HOST not set)
✅ **LangChain Integration** - AI chat capabilities
✅ **Swagger Documentation** - Interactive API docs
✅ **Docker Support** - Containerized deployment
✅ **Health Checks** - Monitoring endpoints
✅ **Error Handling** - Proper HTTP status codes
✅ **CORS Enabled** - Cross-origin requests supported

## 🎉 Success!

Your combined NestJS + Mock Server application is now running successfully in Docker! All endpoints are accessible and the database is seeded with realistic data.

---

**Last Updated**: November 22, 2025
**Status**: ✅ Production Ready

