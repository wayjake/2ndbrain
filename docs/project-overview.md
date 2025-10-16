# Project Overview

**Project Name:** idea-flow
**Type:** Web Application
**Architecture:** Monolith (SSR Full-Stack)
**Status:** Active Development
**Last Updated:** 2025-10-15

---

## Executive Summary

Idea Flow is an AI-powered visual idea mapping application that helps users organize and connect their thoughts. Built with React Router v7 and powered by OpenAI's GPT-3.5-turbo, it provides an interactive canvas where ideas are represented as nodes in a graph, with AI-generated suggestions for related concepts and connections.

**Core Value Proposition:**
Transform scattered thoughts into a structured, visual knowledge graph with AI assistance.

---

## Project Purpose

**Problem Solved:**
- Ideas and thoughts are often scattered and disconnected
- Difficult to see relationships between different concepts
- Manual brainstorming lacks intelligent suggestions

**Solution Provided:**
- Visual graph-based canvas for idea organization
- AI-powered analysis and connection suggestions
- Persistent storage of idea relationships
- Interactive drag-and-drop interface

**Target Users:**
- Creative professionals
- Students and researchers
- Product managers and designers
- Anyone doing ideation or brainstorming

---

## Technology Summary

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, React Flow |
| **Backend** | React Router v7 (Node.js), Drizzle ORM |
| **Database** | SQLite (better-sqlite3) |
| **AI** | OpenAI GPT-3.5-turbo |
| **Build** | Vite 7, TypeScript Compiler |
| **Deployment** | Docker, Node.js |

---

## Architecture Overview

**Pattern:** Server-Side Rendered (SSR) Monolith

```
┌─────────────────────────────────────────┐
│         User Interface                  │
│  • React Flow Canvas (drag/drop)        │
│  • AI Chat Input                        │
│  • Real-time Updates                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    React Router Server (Node.js)        │
│  • Route Handlers (SSR)                 │
│  • API Endpoints                        │
│  • Database Queries                     │
└──────┬────────────────┬─────────────────┘
       │                │
       ▼                ▼
┌─────────────┐   ┌────────────────┐
│   SQLite    │   │  OpenAI API    │
│  Database   │   │  (GPT-3.5)     │
└─────────────┘   └────────────────┘
```

---

## Repository Structure

**Type:** Monolith (single repository, single deployment)

**Organization:**
```
idea-flow/
├── app/            # Application source code
│   ├── components/ # React UI components (2 files)
│   ├── db/         # Database layer (3 files)
│   └── routes/     # Pages and API endpoints (2 files)
├── docs/           # Project documentation (this folder)
├── public/         # Static assets
└── bmad/           # BMAD development framework
```

**Total Source Files:** 10 TypeScript/TSX files in `app/`

---

## Key Features

### 1. Visual Idea Canvas
- Interactive graph visualization using React Flow
- Drag-and-drop node positioning
- Zoom and pan controls
- Mini-map navigation
- Dotted grid background

### 2. AI-Powered Analysis
- Submit ideas via chat interface
- GPT-3.5-turbo generates summaries
- AI suggests related "next" and "previous" ideas
- Automatic connection creation

### 3. Data Persistence
- All ideas saved to SQLite database
- Nodes store position, label, summary, connections
- Edges represent relationships between ideas
- Server-side rendering loads existing ideas on page load

### 4. Real-time Interaction
- Instant feedback on idea submissions
- Canvas updates without page reload
- Loading states during AI processing

---

## Technical Highlights

### Server-Side Rendering (SSR)

**Benefits:**
- Fast initial page load
- SEO-friendly HTML
- Progressive enhancement

**Implementation:**
- React Router v7 handles SSR automatically
- Data loaded on server via loaders
- HTML sent to client with embedded data

### Type Safety

**End-to-End TypeScript:**
- React components fully typed
- Database schema generates TypeScript types
- API routes use generated route types
- No `any` types (strict mode enabled)

### AI Integration

**OpenAI GPT-3.5-turbo:**
- Custom system prompt for idea analysis
- JSON-structured responses
- Temperature: 0.7 (balanced creativity)
- Max tokens: 500 (concise responses)

---

## Data Model

**Graph-Based Structure:**

**Nodes** (Ideas)
- Unique ID (timestamp-based)
- Label (user's idea text)
- Summary (AI-generated)
- Position (x, y coordinates)
- Next/Previous node suggestions (JSON arrays)

**Edges** (Connections)
- Source node ID
- Target node ID
- Label (optional)
- Type (default, custom)

**Relationships:**
- Nodes can have multiple incoming and outgoing edges
- Graph structure allows complex idea networks
- No cycles enforced (free-form connections)

---

## Development Approach

### Tech Stack Rationale

**React Router v7:**
- Full-stack framework (no separate frontend/backend repos)
- Built-in SSR support
- Type-safe routing
- Vite integration for fast builds

**SQLite:**
- Zero configuration
- File-based (no separate DB server)
- Perfect for MVP and single-user scenarios
- Easy to backup (single file)

**Drizzle ORM:**
- Type-safe queries
- Minimal overhead
- SQL-like syntax
- Migration support

**OpenAI:**
- Best-in-class LLM
- Simple API integration
- Reliable managed service

### Development Workflow

1. **Local Development:** `npm run dev` (port 5173)
2. **Hot Module Replacement:** Instant updates
3. **Type Checking:** `npm run typecheck`
4. **Database Management:** Drizzle Studio GUI
5. **Build:** `npm run build` → Docker deployment

---

## Deployment Options

### Supported Platforms

| Platform | Type | Suitability |
|----------|------|-------------|
| **AWS ECS** | Container | ✅ Recommended |
| **Google Cloud Run** | Container | ✅ Good |
| **Azure Container Apps** | Container | ✅ Good |
| **Fly.io** | Container | ✅ Edge deployment |
| **Railway** | Container/Node | ✅ Simple setup |
| **Digital Ocean** | Container/Node | ✅ Cost-effective |

**Note:** Static hosting (Vercel, Netlify) not suitable due to SSR requirements.

---

## Current Limitations

### Scalability
- **SQLite** limits concurrent writes
- Single server instance only
- No horizontal scaling without migration to PostgreSQL

### Security
- **No authentication** - all data publicly accessible
- **No rate limiting** - API endpoints unprotected
- **No input sanitization** beyond basic checks

### Features
- **No collaboration** - single-user experience
- **No export** - cannot download or share idea graphs
- **No search** - must scroll through canvas
- **No undo/redo** - changes are immediate and permanent

---

## Future Roadmap

### Phase 1: MVP (Current)
- ✅ Visual canvas with drag/drop
- ✅ AI-powered idea analysis
- ✅ Data persistence (SQLite)
- ✅ Basic CRUD operations

### Phase 2: Enhancement
- ⏳ User authentication
- ⏳ Export to JSON/PNG
- ⏳ Search and filtering
- ⏳ Undo/redo functionality

### Phase 3: Scale
- ⏳ Migrate to PostgreSQL
- ⏳ Real-time collaboration (WebSockets)
- ⏳ Mobile responsive design
- ⏳ Offline support (PWA)

### Phase 4: Advanced
- ⏳ Custom AI models
- ⏳ Integration with other tools
- ⏳ Team workspaces
- ⏳ Analytics dashboard

---

## Performance Characteristics

### Page Load Time
- **First Contentful Paint (FCP):** < 1.5s (estimated)
- **Time to Interactive (TTI):** < 3s (estimated)
- **Lighthouse Score:** 90+ (estimated)

### Database Performance
- **Read queries:** < 50ms (local SQLite)
- **Write queries:** < 100ms (local SQLite)
- **Full scan:** O(n) for all nodes/edges

### API Response Time
- **OpenAI API:** 1-3 seconds (network dependent)
- **Local endpoints:** < 100ms

---

## Dependencies Summary

**Production:**
- React ecosystem: 6 packages
- Database: 2 packages (Drizzle + SQLite)
- OpenAI: 1 package
- React Flow: 1 package
- Utilities: 4 packages

**Development:**
- Build tools: 5 packages (Vite, TypeScript, etc.)
- Drizzle Kit: 1 package
- Types: 3 packages

**Total:** 23 direct dependencies, 259 including transitive

---

## License & Attribution

**Project License:** (Not specified - add LICENSE file)

**Third-Party Libraries:**
- React (MIT)
- React Router (MIT)
- React Flow (MIT)
- Drizzle ORM (Apache 2.0)
- OpenAI SDK (MIT)
- Tailwind CSS (MIT)

---

## Contact & Contribution

**Repository:** (Not specified - add Git remote)
**Documentation:** `docs/` folder in project root
**Issues:** (Not configured)
**Discussions:** (Not configured)

---

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd idea-flow
npm install

# Configure environment
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# Start development server
npm run dev

# Access at http://localhost:5173
```

---

## Project Status

**Current Version:** MVP (Alpha)
**Stability:** Experimental
**Production Ready:** No (missing auth, testing, monitoring)

**Recommended Use:** Development and personal projects only

---

## Links

- **Documentation Index:** [`docs/index.md`](./index.md)
- **Architecture:** [`docs/architecture.md`](./architecture.md)
- **API Contracts:** [`docs/api-contracts.md`](./api-contracts.md)
- **Data Models:** [`docs/data-models.md`](./data-models.md)
- **Development Guide:** [`docs/development-guide.md`](./development-guide.md)
- **Component Inventory:** [`docs/component-inventory.md`](./component-inventory.md)
- **Source Tree:** [`docs/source-tree-analysis.md`](./source-tree-analysis.md)
