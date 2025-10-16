# Idea Flow - Project Documentation Index

**Project:** idea-flow
**Type:** Web Application (SSR Monolith)
**Framework:** React Router v7
**Last Updated:** 2025-10-15

---

## 📋 Quick Reference

| Attribute | Value |
|-----------|-------|
| **Primary Language** | TypeScript |
| **Architecture** | Server-Side Rendered Monolith |
| **Database** | SQLite (Drizzle ORM) |
| **AI Integration** | OpenAI GPT-3.5-turbo |
| **UI Framework** | React 19 + Tailwind CSS |
| **Deployment** | Docker / Node.js |

---

## 🚀 Getting Started

### New to the Project?

1. **Read:** [Project Overview](./project-overview.md) - Understand what this project does
2. **Setup:** [Development Guide](./development-guide.md) - Get your environment running
3. **Explore:** [Source Tree Analysis](./source-tree-analysis.md) - Navigate the codebase

### Key Commands

```bash
npm install              # Install dependencies
npm run dev              # Start development server (http://localhost:5173)
npm run typecheck        # Check TypeScript types
npm run build            # Production build
npm run db:push          # Sync database schema
npm run db:studio        # Open database GUI
```

---

## 📚 Documentation Structure

### Core Documentation

- **[Project Overview](./project-overview.md)**
  Executive summary, tech stack, features, roadmap

- **[Architecture](./architecture.md)**
  System design, data flow, technology decisions, scalability

- **[Development Guide](./development-guide.md)**
  Setup instructions, coding standards, workflows, debugging

- **[Source Tree Analysis](./source-tree-analysis.md)**
  Directory structure, file organization, critical folders

### Technical References

- **[API Contracts](./api-contracts.md)**
  Endpoint documentation, request/response schemas, examples

- **[Data Models](./data-models.md)**
  Database schema, relationships, operations, migrations

- **[Component Inventory](./component-inventory.md)**
  React components, props, patterns, state management

### Project Management

- **[Workflow Status](./bmm-workflow-status.md)**
  BMM workflow tracking, current phase, next actions

- **[Technical Decisions Template](./technical-decisions-template.md)**
  Template for documenting architecture decisions

---

## 🗂️ Documentation by Use Case

### I want to...

**...understand the project**
→ Start with [Project Overview](./project-overview.md)

**...set up my development environment**
→ Follow [Development Guide](./development-guide.md)

**...add a new feature**
→ Review [Architecture](./architecture.md) + [Development Guide](./development-guide.md)

**...understand the database**
→ Read [Data Models](./data-models.md)

**...call an API endpoint**
→ Check [API Contracts](./api-contracts.md)

**...find a specific file**
→ Use [Source Tree Analysis](./source-tree-analysis.md)

**...modify a React component**
→ See [Component Inventory](./component-inventory.md)

**...deploy to production**
→ Reference [Development Guide](./development-guide.md#deployment)

---

## 🏗️ Project Structure

```
idea-flow/
├── app/                    # Application source code
│   ├── components/         # React UI components (2)
│   ├── db/                 # Database layer (SQLite + Drizzle)
│   ├── routes/             # Pages + API endpoints (2)
│   ├── root.tsx            # Root layout
│   └── routes.ts           # Route configuration
│
├── docs/                   # 📍 YOU ARE HERE
│   ├── index.md            # This file
│   ├── project-overview.md
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── data-models.md
│   ├── component-inventory.md
│   ├── development-guide.md
│   └── source-tree-analysis.md
│
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Build tool configuration
└── Dockerfile              # Container configuration
```

---

## 🔧 Technology Stack

### Frontend

- **React** 19.1.1 - UI library
- **React Router** 7.9.2 - Full-stack framework (SSR)
- **@xyflow/react** 12.8.6 - Interactive graph visualization
- **Tailwind CSS** 4.1.13 - Utility-first CSS

### Backend

- **React Router Server** 7.9.2 - Node.js server
- **Drizzle ORM** 0.44.6 - Type-safe database queries
- **SQLite** (better-sqlite3) - Embedded database
- **OpenAI SDK** 6.3.0 - AI integration

### Build & Dev Tools

- **Vite** 7.1.7 - Build tool and dev server
- **TypeScript** 5.9.2 - Type-safe JavaScript
- **Drizzle Kit** 0.31.5 - Database migrations

---

## 📊 Key Features

### Visual Idea Canvas
Interactive graph-based canvas for organizing and connecting ideas with drag-and-drop functionality.

**Components:**
- `IdeaFlowCanvas` - Main visualization component
- React Flow - Graph rendering library
- Controls, MiniMap, Background

### AI-Powered Analysis
Automatically analyze ideas and suggest connections using OpenAI GPT-3.5-turbo.

**Endpoint:** `POST /api/chat`
**Model:** gpt-3.5-turbo
**Features:** Summary generation, next/previous idea suggestions

### Data Persistence
Store all ideas and connections in SQLite database with full CRUD operations.

**Tables:** `nodes`, `edges`
**ORM:** Drizzle (type-safe)
**Location:** `./local.db`

---

## 🌐 API Reference

### Endpoints

| Method | Path | Purpose | Documentation |
|--------|------|---------|---------------|
| `POST` | `/api/chat` | AI idea analysis | [API Contracts](./api-contracts.md#post-apichat) |
| `GET` | `/` | Main page (SSR) | [API Contracts](./api-contracts.md#get--home-page) |

### Database Operations

**Utilities:** `app/db/utils.server.ts`

- `saveNode(nodeData)` - Create new idea node
- `saveEdge(edgeData)` - Create connection
- `getAllNodes()` - Fetch all ideas
- `getAllEdges()` - Fetch all connections
- `updateNodePosition(id, x, y)` - Update position
- `deleteNode(id)` - Delete node (cascade deletes edges)
- `deleteEdge(id)` - Delete connection

**Full Documentation:** [Data Models](./data-models.md)

---

## 🧩 Component Reference

### React Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `IdeaFlowCanvas` | `app/components/IdeaFlowCanvas.tsx` | Graph visualization canvas |
| `ChatPrompt` | `app/components/ChatPrompt.tsx` | AI chat input form |
| `Home` | `app/routes/home.tsx` | Main page layout |

**Full Catalog:** [Component Inventory](./component-inventory.md)

---

## 🗄️ Database Schema

### Tables

**nodes** (Ideas)
- `id` TEXT PRIMARY KEY
- `label` TEXT NOT NULL
- `summary` TEXT
- `position_x` REAL
- `position_y` REAL
- `next_nodes` TEXT (JSON)
- `prev_nodes` TEXT (JSON)
- `timestamp` INTEGER
- `created_at` INTEGER

**edges** (Connections)
- `id` TEXT PRIMARY KEY
- `source` TEXT NOT NULL
- `target` TEXT NOT NULL
- `label` TEXT
- `type` TEXT
- `created_at` INTEGER

**Complete Schema:** [Data Models](./data-models.md)

---

## 🛠️ Development Workflow

### Daily Development

1. **Start server:** `npm run dev`
2. **Make changes** in `app/` directory
3. **Browser auto-reloads** (HMR enabled)
4. **Check types:** `npm run typecheck`
5. **Commit changes:** Git workflow

### Adding Features

**New Page:**
1. Create `app/routes/page-name.tsx`
2. Add to `app/routes.ts`
3. Access at `/page-name`

**New API Endpoint:**
1. Create `app/routes/api.endpoint.ts`
2. Export `loader` or `action` function
3. Access at `/api/endpoint`

**New Component:**
1. Create `app/components/ComponentName.tsx`
2. Import where needed

**Complete Guide:** [Development Guide](./development-guide.md)

---

## 🔐 Environment Variables

Required for local development:

```bash
# .env file
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL=file:./local.db  # Optional, this is the default
```

---

## 📦 Deployment

### Docker

```bash
docker build -t idea-flow .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your-key \
  idea-flow
```

### Node.js

```bash
npm run build
npm run start
```

**Supported Platforms:**
- AWS ECS, Google Cloud Run, Azure Container Apps
- Fly.io, Railway, Digital Ocean
- Any Docker or Node.js host

**Deployment Guide:** [Development Guide](./development-guide.md#deployment)

---

## ⚠️ Known Limitations

### Security
- ❌ No authentication system
- ❌ No rate limiting on API endpoints
- ❌ OpenAI API key required (cost considerations)

### Scalability
- ⚠️ SQLite limits concurrent writes
- ⚠️ Single server instance only
- ⚠️ No horizontal scaling without DB migration

### Features
- ⏳ No collaboration/sharing
- ⏳ No export functionality
- ⏳ No search or filtering
- ⏳ No undo/redo

**Full Analysis:** [Architecture](./architecture.md#scalability--growth)

---

## 🎯 Future Roadmap

### Phase 1: MVP (Current)
✅ Visual canvas
✅ AI-powered analysis
✅ Data persistence

### Phase 2: Enhancement
⏳ User authentication
⏳ Export (JSON/PNG)
⏳ Search functionality

### Phase 3: Scale
⏳ PostgreSQL migration
⏳ Real-time collaboration
⏳ Mobile responsive

**Complete Roadmap:** [Project Overview](./project-overview.md#future-roadmap)

---

## 📖 Additional Resources

### External Documentation

- **React Router:** https://reactrouter.com/
- **Drizzle ORM:** https://orm.drizzle.team/
- **React Flow:** https://reactflow.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **OpenAI API:** https://platform.openai.com/docs/

### Project Files

- **README:** `../README.md` (template documentation)
- **Package Config:** `../package.json`
- **TypeScript Config:** `../tsconfig.json`
- **Docker Config:** `../Dockerfile`

---

## 🤝 Contributing

**Development Environment:**
- Node.js 18+
- npm 9+
- OpenAI API key

**Before Contributing:**
1. Read [Development Guide](./development-guide.md)
2. Check [Architecture](./architecture.md) for design patterns
3. Follow TypeScript strict mode
4. Use Tailwind CSS for styling

---

## 📝 Documentation Maintenance

**Last Updated:** 2025-10-15
**Generated By:** BMAD document-project workflow
**Scan Level:** Exhaustive
**Documentation Version:** 1.0

### Updating Documentation

When making significant changes:
1. Update relevant `.md` files in `docs/`
2. Update "Last Updated" dates
3. Keep index.md in sync with file structure
4. Run `npm run typecheck` to verify links

---

## 🔍 Quick Searches

**Find by keyword:**
- "API" → [API Contracts](./api-contracts.md)
- "Database" → [Data Models](./data-models.md)
- "Component" → [Component Inventory](./component-inventory.md)
- "Deploy" → [Development Guide](./development-guide.md#deployment)
- "Architecture" → [Architecture](./architecture.md)

**Find by file location:**
- `app/routes/*` → [Source Tree](./source-tree-analysis.md#approutes---routes--api)
- `app/components/*` → [Component Inventory](./component-inventory.md)
- `app/db/*` → [Data Models](./data-models.md)

---

## 📞 Getting Help

**Documentation Issues:**
- Check this index for navigation
- Search within documentation files
- Review [Development Guide](./development-guide.md#troubleshooting)

**Code Issues:**
- Check [Architecture](./architecture.md) for design patterns
- Review [Component Inventory](./component-inventory.md) for examples
- See [Source Tree](./source-tree-analysis.md) for file locations

---

**Thank you for using Idea Flow! 🚀**

*This documentation was generated to support AI-assisted development and brownfield project understanding.*
