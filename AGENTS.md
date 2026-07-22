# Environment

- **OS**: Alpine Linux v3.24 (Linux x86_64)
- **Package Manager**: apk (apk-tools 3.0.6-r0)

# Conventions

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Format: `<type>(<scope>): <description>`

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`

# Web Server

- **Server**: darkhttpd v1.17
- **Port**: 8080
- **Document Root**: `/home/task admin`
- **Start**: `sh /home/taskadmin/serve.sh`
- **URL**: `http://localhost:8080`

# Testing

- **E2E Framework**: Playwright
- **Run tests**: `npx playwright test`
- **Test dir**: `./tests`


# Files

- `index.html` - Main HTML structure
- `styles.css` - Custom styling
- `app.js` - Application logic
- Bootstrap 5 CDN - UI framework
