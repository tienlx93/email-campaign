# Mini Campaign Manager

**Mini Campaign Manager** — a simplified MarTech tool for marketers to create, manage, and track email campaigns.

## Project Structure

**Monorepo** managed by **npm workspaces**, with two packages:
- `packages/api` — Express.js backend
- `packages/web` — React frontend

```
email-campaign/
├── packages/
│   ├── api/          # Backend (Express + TypeScript)
│   └── web/          # Frontend (React + Vite + TypeScript)
├── docker-compose.yml
├── package.json      # Root workspace config
└── .context/         # Project documentation
```

---
