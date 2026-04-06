# Docker Deployment Guide - 40bierges

## Prerequisites

- A VPS running Ubuntu/Debian
- Docker and Docker Compose installed
- Git installed

## Project Architecture

```
┌──────────────┐         ┌──────────────────┐
│   Browser    │───:80──▶│  nginx (frontend) │
│              │         │  - React SPA      │
└──────────────┘         │  - Proxy /api/    │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Express API      │
                         │  - Port 3001      │
                         │  - SQLite (volume)│
                         └──────────────────┘
```

- **Frontend**: React app built and served by nginx on port **80**
- **API**: Express.js server on port **3001**, proxied via nginx at `/api/`
- **Database**: SQLite file persisted in a Docker volume

## Deployment Steps

### 1. Clone the repository

```bash
git clone https://github.com/Netrunner0101/nodesjs_projet_securite_reseaux.git
cd nodesjs_projet_securite_reseaux
```

### 2. Configure environment variables

Create a `.env` file at the project root:

```bash
echo "ACCESS_TOKEN_SECRET=your_strong_secret_here" > .env
```

> **Important**: Replace `your_strong_secret_here` with a strong random string. This is used to sign JWT tokens.

### 3. Build and start the containers

```bash
docker compose up --build -d
```

This will:
- Build the API image (Node 18 + native dependencies)
- Build the frontend image (React build + nginx)
- Start both containers in the background

### 4. Verify deployment

```bash
# Check that both containers are running
docker compose ps

# Check logs for errors
docker compose logs -f
```

### 5. Access the application

Open your browser and go to:

```
http://YOUR_VPS_IP
```

## Default Accounts

| Email             | Password | Role  |
|-------------------|----------|-------|
| admin@admin.com   | admin    | admin |
| admin2@admin.com  | admin2   | admin |
| user1@gmail.com   | user1    | user  |
| user2@gmail.com   | user2    | user  |

## Useful Commands

```bash
# Stop the application
docker compose down

# Restart after code changes
docker compose up --build -d

# View real-time logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f api
docker compose logs -f frontend

# Stop and remove everything (including database)
docker compose down -v
```

## Environment Variables Reference

| Variable              | Service  | Default                          | Description                          |
|-----------------------|----------|----------------------------------|--------------------------------------|
| `ACCESS_TOKEN_SECRET` | api      | `changeme_in_production`         | Secret key for signing JWT tokens    |
| `DB_PATH`             | api      | `/app/data/database.sqlite`      | Path to the SQLite database file     |
| `PORT`                | api      | `3001`                           | API server port                      |
| `CORS_WHITELIST`      | api      | `http://localhost:8080,...`       | Comma-separated list of allowed origins |
| `REACT_APP_API_URL`   | frontend | `/api` (set at build time)       | Base URL for API calls               |

## Data Persistence

The SQLite database is stored in a Docker named volume (`api-data`). This means:

- Data **persists** across `docker compose down` and `docker compose up`
- Data is **destroyed** only when you explicitly remove the volume with `docker compose down -v`

## Troubleshooting

### Containers won't start
```bash
docker compose logs
```
Check for errors related to port conflicts (80 or 3001 already in use).

### Frontend loads but API calls fail
```bash
# Check if the API container is healthy
docker compose ps

# Test the API directly
curl http://localhost:3001
```

### Rebuild from scratch
```bash
docker compose down -v
docker compose up --build -d
```
