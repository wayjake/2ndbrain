# Source Tree Analysis

**Project:** idea-flow
**Type:** Monolith
**Primary Language:** TypeScript
**Framework:** React Router v7

---

## Project Structure

```
idea-flow/
├── app/                          # Main application source code
│   ├── components/               # Reusable React components
│   │   ├── ChatPrompt.tsx        # AI chat input form (bottom fixed)
│   │   └── IdeaFlowCanvas.tsx    # React Flow canvas for idea visualization
│   │
│   ├── db/                       # Database layer (SQLite + Drizzle ORM)
│   │   ├── db.server.ts          # Database connection and table initialization
│   │   ├── schema.ts             # Drizzle ORM schema (nodes, edges tables)
│   │   └── utils.server.ts       # Database utility functions (CRUD operations)
│   │
│   ├── routes/                   # React Router routes and API endpoints
│   │   ├── api.chat.ts           # POST /api/chat - OpenAI integration endpoint
│   │   └── home.tsx              # GET / - Main application page (loader + UI)
│   │
│   ├── welcome/                  # Welcome page assets (default template)
│   │   ├── logo-dark.svg         # Dark mode logo
│   │   ├── logo-light.svg        # Light mode logo
│   │   └── welcome.tsx           # Welcome component (unused)
│   │
│   ├── app.css                   # Global Tailwind CSS imports + theme
│   ├── root.tsx                  # Root layout with HTML structure, fonts, error boundary
│   └── routes.ts                 # Route configuration (index + API routes)
│
├── bmad/                         # BMAD framework (development tooling)
│   ├── bmm/                      # BMAD Method Module (workflows, agents)
│   ├── core/                     # Core BMAD utilities and tasks
│   ├── cis/                      # Claude IDE System
│   ├── _cfg/                     # BMAD configuration
│   └── docs/                     # BMAD documentation
│
├── docs/                         # Project documentation
│   ├── api-contracts.md          # API endpoint documentation
│   ├── component-inventory.md    # React component catalog
│   ├── data-models.md            # Database schema documentation
│   ├── bmm-workflow-status.md    # BMM workflow tracking
│   ├── project-scan-report.json  # Automated analysis state file
│   ├── technical-decisions-template.md  # Template for technical decisions
│   └── stories/                  # User stories directory
│
├── public/                       # Static assets served at root
│   └── favicon.ico               # Browser favicon
│
├── .claude/                      # Claude Code IDE configuration
├── .cursor/                      # Cursor IDE configuration
├── .git/                         # Git version control
├── .react-router/                # React Router build artifacts
├── node_modules/                 # NPM dependencies (259 packages)
│
├── .dockerignore                 # Docker ignore rules
├── .gitignore                    # Git ignore rules
├── Dockerfile                    # Docker container configuration
├── README.md                     # Project README (template documentation)
│
├── drizzle.config.ts             # Drizzle ORM configuration
├── package.json                  # NPM package configuration and scripts
├── package-lock.json             # Locked dependency versions
├── react-router.config.ts        # React Router configuration (SSR enabled)
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite build tool configuration
```

---

## Critical Directories

### `app/` - Application Source

**Purpose:** Main application code organized by React Router conventions

**Key Subdirectories:**
- `components/` - Reusable UI components (not route-specific)
- `db/` - Database layer (server-side only, `.server.ts` suffix)
- `routes/` - Route modules (pages and API endpoints)

**Entry Point:** `app/root.tsx` → Renders `<Outlet />` for route content

**Routing Pattern:** File-based routes defined in `app/routes.ts`

---

### `app/db/` - Database Layer

**Purpose:** SQLite database with Drizzle ORM

**Files:**
- `schema.ts` - Table definitions (`nodes`, `edges`)
- `db.server.ts` - Database connection and initialization
- `utils.server.ts` - CRUD operations exported for routes

**Server-Only:** All files use `.server.ts` suffix (not bundled for client)

**Database Location:** `./local.db` (SQLite file in project root)

---

### `app/routes/` - Routes & API

**Purpose:** Application pages and API endpoints

**Route Structure:**
- `home.tsx` - Index route (`/`) with loader and component
- `api.chat.ts` - API route (`/api/chat`) with action handler

**Configured In:** `app/routes.ts`

---

### `app/components/` - Reusable Components

**Purpose:** Shared React components used across routes

**Components:**
- `ChatPrompt.tsx` - AI chat input form
- `IdeaFlowCanvas.tsx` - React Flow visualization canvas

**Not route-specific:** Can be imported by any route module

---

### `docs/` - Project Documentation

**Purpose:** Generated and manual project documentation

**Generated Files:**
- `api-contracts.md` - API documentation
- `component-inventory.md` - Component catalog
- `data-models.md` - Database schema
- `project-scan-report.json` - Analysis state

**Manual Files:**
- `bmm-workflow-status.md` - Workflow tracking
- `technical-decisions-template.md` - Decision log template

**Subdirectories:**
- `stories/` - User stories and requirements

---

### `bmad/` - Development Framework

**Purpose:** BMAD (Business Modeling and Development) framework tooling

**Not Part of Application:** Separate development/planning system

**Key Modules:**
- `bmm/` - BMAD Method Module (workflows, agents, configs)
- `core/` - Core tasks and utilities
- `cis/` - Claude IDE System integration

**Usage:** Supports project planning, documentation, and workflow management

---

### `public/` - Static Assets

**Purpose:** Files served directly at application root

**Current Contents:**
- `favicon.ico` - Browser icon

**Usage:** Place images, fonts, or other static files here

**Build:** Copied to `build/client/` during production build

---

## Configuration Files

### Build & Development

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build tool configuration (plugins: tailwindcss, reactRouter, tsconfigPaths) |
| `react-router.config.ts` | React Router settings (SSR: true) |
| `tsconfig.json` | TypeScript compiler options (strict mode, ES2022) |
| `package.json` | Dependencies, scripts, project metadata |

### Database

| File | Purpose |
|------|---------|
| `drizzle.config.ts` | Drizzle ORM configuration (SQLite dialect, schema path) |

### Deployment

| File | Purpose |
|------|---------|
| `Dockerfile` | Container build instructions |
| `.dockerignore` | Files excluded from Docker image |

### Styling

| File | Purpose |
|------|---------|
| `app/app.css` | Tailwind CSS imports and custom theme |

---

## Key File Purposes

### Application Core

- **`app/root.tsx`** - Root HTML layout, global fonts (Inter), error boundary
- **`app/routes.ts`** - Route configuration (maps URLs to files)
- **`app/routes/home.tsx`** - Main page (loads all nodes/edges, renders canvas + chat)
- **`app/routes/api.chat.ts`** - AI endpoint (calls OpenAI, saves to DB)

### Database

- **`app/db/schema.ts`** - Data models (nodes, edges tables)
- **`app/db/db.server.ts`** - Database instance and table creation SQL
- **`app/db/utils.server.ts`** - Functions: saveNode, getAllNodes, deleteNode, etc.

### Components

- **`app/components/IdeaFlowCanvas.tsx`** - React Flow wrapper with controls, minimap
- **`app/components/ChatPrompt.tsx`** - Form that submits to `/api/chat`

---

## Build Output

**Development:**
- Runs on port 5173 (Vite dev server)
- Hot module replacement enabled

**Production Build:**
```
build/
├── client/       # Static assets (JS, CSS, images)
└── server/       # Server-side bundle (index.js)
```

**Deployment:**
- Run `npm run build`
- Start with `npm run start` or `node build/server/index.js`

---

## Folder Naming Conventions

- **Kebab-case:** Not used (no multi-word folder names yet)
- **Lowercase:** Most folders (`app`, `routes`, `components`, `docs`)
- **PascalCase:** Not used for folders
- **Dot-prefix:** IDE configs (`.claude`, `.cursor`)

---

## File Naming Conventions

### TypeScript/TSX Files

- **PascalCase:** React components (`ChatPrompt.tsx`, `IdeaFlowCanvas.tsx`)
- **lowercase:** Routes and utilities (`home.tsx`, `api.chat.ts`)
- **`.server.ts` suffix:** Server-only code (not bundled for client)

### Configuration Files

- **lowercase with dots:** `package.json`, `tsconfig.json`
- **kebab-case:** `react-router.config.ts`, `vite.config.ts`

### Documentation

- **kebab-case:** `api-contracts.md`, `component-inventory.md`
- **lowercase:** `README.md`, `Dockerfile`

---

## Ignored Directories

**Not tracked in Git:**
- `node_modules/` - NPM dependencies
- `build/` - Production build output
- `.react-router/` - React Router type generation
- `local.db` - SQLite database file

**Configured In:**
- `.gitignore` - Git ignore rules
- `.dockerignore` - Docker ignore rules

---

## Integration Points

### Client ↔ Server

- **Data Loading:** `home.tsx` loader → database via `db/utils.server.ts`
- **Form Submission:** `ChatPrompt` → `/api/chat` → database + OpenAI API

### Application ↔ External Services

- **OpenAI API:** `app/routes/api.chat.ts` → `https://api.openai.com/v1/chat/completions`
- **Fonts:** `app/root.tsx` → Google Fonts CDN (Inter font family)

### Application ↔ Database

- **ORM:** Drizzle ORM (`app/db/db.server.ts`)
- **Driver:** better-sqlite3
- **Location:** `./local.db` (file-based SQLite)

---

## Special Patterns

### Server-Only Code

Files ending in `.server.ts` are automatically excluded from client bundles by React Router.

**Examples:**
- `app/db/*.server.ts` - Database code
- `app/**/*.server.ts` - Server utilities

### Route Type Generation

React Router auto-generates types in `.react-router/types/` directory for each route module.

**Usage:**
```typescript
import type { Route } from "./+types/home";
// Provides typed loader, action, meta functions
```

---

## Development Workflow

### Common Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run typecheck    # TypeScript + type generation
npm run db:push      # Sync database schema
npm run db:studio    # Open Drizzle Studio GUI
```

### File Watch Patterns

**Vite watches:**
- `app/**/*.{ts,tsx,css}`
- Config files (`*.config.ts`)

**React Router watches:**
- `app/routes.ts` - Route config changes
- `app/routes/**/*` - Route module changes

---

## Notes

- **No separate `src/` directory:** Code lives in `app/` (React Router convention)
- **No `api/` sibling to `app/`:** API routes live inside `app/routes/api.*`
- **No `pages/` directory:** Routes are in `app/routes/`
- **TypeScript strict mode:** Enabled in `tsconfig.json`
- **ES Modules only:** `"type": "module"` in `package.json`
