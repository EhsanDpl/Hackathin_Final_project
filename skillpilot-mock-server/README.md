## 🚀 Quick Start

### Option 1: Docker Setup (Recommended) 🐳

**Prerequisites:** Docker Desktop installed ([Download Docker](https://www.docker.com/products/docker-desktop/))

```bash
# 1. Navigate to project directory
cd skillpilot-mock-server

# 2. Build and start containers (PostgreSQL + API)
docker-compose up --build

# 3. In a new terminal, seed the database
docker-compose exec api npm run seed

# 4. Test the API
curl http://localhost:3001/healthcheck
```

**📖 For detailed Docker setup instructions, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)**

### Option 2: Local Development (JSON Server)

**Prerequisites:**
- Node.js 14+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

```bash
# Clone or download the project
cd skillpilot-mock-server

# Install dependencies
npm install

# Start the server (uses JSON file)
npm run start-mock-server
```

### Access Points

| Resource | URL |
|----------|-----|
| **API Endpoints** | http://localhost:3001 |
| **Swagger UI** | http://localhost:3001/api-docs |
| **Health Check** | http://localhost:3001/healthcheck |

### Available Endpoints

- `GET /learners` - Get all learners
- `GET /learners/:id` - Get specific learner
- `GET /githubProfiles` - Get GitHub profiles
- `GET /linkedinProfiles` - Get LinkedIn profiles
- `GET /skillAssessments` - Get skill assessments
- `GET /learningPaths` - Get learning paths
- `GET /dailyMissions` - Get daily missions
- `GET /teamsCalendar` - Get Teams calendar events
- `GET /jiraData` - Get JIRA data

### Docker Commands

```bash
# Start containers
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose stop

# View logs
docker-compose logs -f api

# Rebuild after changes
docker-compose up --build

# Seed database
docker-compose exec api npm run seed
```
