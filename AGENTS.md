# Environment

- **OS**: Alpine Linux v3.24 (Linux x86_64)
- **Package Manager**: apk (apk-tools 3.0.6-r0)

# Conventions

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Format: `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

# Web Server

- **Server**: Express (serves static files + API)
- **Port**: 8080
- **Start**: `npm start`
- **URL**: `http://localhost:8080`

# Testing

- **E2E Framework**: Playwright
- **Run tests**: `npx playwright test`
- **Test dir**: `./tests`


# Files

- `index.html` - Main HTML structure
- `styles.css` - Custom styling
- `app.js` - Application logic
- Bootstrap Icons CDN - icon library (no Bootstrap CSS/JS)

# PostgreSQL Database

- **Host**: `my-postgres-1`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `root`
- **Database**: `postgres`
- **Connect**: `PGPASSWORD=root psql -h my-postgres-1 -U postgres`
- **Table**: `tasks` (id, title, description, start_date, due_date, completed, category, created_at)

# API Server

- **Port**: 8080
- **Start**: `npm start`
- **Endpoints**:
  - `GET /api/tasks` - List all tasks
  - `GET /api/tasks/:id` - Get task by ID
  - `POST /api/tasks` - Create task
  - `PUT /api/tasks/:id` - Update task
  - `DELETE /api/tasks/:id` - Delete task

# Figma API

- **Base URL**: `https://api.figma.com`
- **Auth**: `X-Figma-Token` header with a personal access token
- **Token**: `<token>`
- **User**: Emmanuel John Ayarma (johnayarmahe@gmail.com)
- **Example** (verify connection): `GET /v1/me`
  ```bash
  curl -H "X-Figma-Token: <token>" https://api.figma.com/v1/me
  ```
