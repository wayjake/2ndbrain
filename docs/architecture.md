# Architecture Documentation

**Project:** idea-flow
**Type:** Web Application (Monolith)
**Architecture Pattern:** SSR Full-Stack Monolith
**Last Updated:** 2025-10-15

---

## Executive Summary

Idea Flow is a full-stack TypeScript web application built with React Router v7 that enables users to visualize and connect their ideas using AI-powered suggestions. The application uses server-side rendering for optimal performance, SQLite for data persistence, and OpenAI GPT-3.5-turbo for intelligent idea analysis and connection suggestions.

**Key Characteristics:**
- **Single codebase** (monolith architecture)
- **SSR-first** approach for fast initial loads
- **AI-enhanced** user experience via OpenAI integration
- **Graph-based** data model for idea relationships
- **Real-time** canvas interaction with React Flow

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library for component-based rendering |
| **React Router** | 7.9.2 | Full-stack framework (routing + SSR) |
| **@xyflow/react** | 12.8.6 | Interactive graph/flow visualization |
| **Tailwind CSS** | 4.1.13 | Utility-first CSS framework |
| **TypeScript** | 5.9.2 | Type-safe JavaScript |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Router (Server)** | 7.9.2 | Node.js server with SSR |
| **SQLite** | via better-sqlite3 | Embedded relational database |
| **Drizzle ORM** | 0.44.6 | Type-safe SQL query builder |
| **OpenAI SDK** | 6.3.0 | AI-powered idea analysis |

### Build Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vite** | 7.1.7 | Build tool and dev server |
| **Drizzle Kit** | 0.31.5 | Database migrations and studio |
| **TSC** | 5.9.2 | TypeScript compiler |

---

## Architecture Pattern

### Monolith SSR Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │      React UI (Client-Side Hydration)            │  │
│  │  • React Flow Canvas (IdeaFlowCanvas)            │  │
│  │  • Chat Input (ChatPrompt)                       │  │
│  │  • Form Submissions via useFetcher               │  │
│  └────────────┬─────────────────────────┬────────────┘  │
│               │ HTTP Requests           │ SSR HTML      │
└───────────────┼─────────────────────────┼────────────────┘
                │                         │
                ▼                         ▼
┌────────────────────────────────────────────────────────────┐
│            React Router Server (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Route Handlers                                      │ │
│  │  • GET / → home.tsx loader (SSR)                     │ │
│  │  • POST /api/chat → api.chat.ts action              │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │  Server-Side Logic                                   │ │
│  │  • Data Loading (loaders)                            │ │
│  │  • Form Processing (actions)                         │ │
│  │  • Database Queries (utils.server.ts)                │ │
│  └────────────┬─────────────────┬───────────────────────┘ │
└───────────────┼─────────────────┼─────────────────────────┘
                │                 │
                ▼                 ▼
    ┌───────────────────┐   ┌──────────────────┐
    │   SQLite DB       │   │   OpenAI API     │
    │   (local.db)      │   │   (GPT-3.5)      │
    │                   │   │                  │
    │  • nodes table    │   │  • Chat          │
    │  • edges table    │   │    Completions   │
    └───────────────────┘   └──────────────────┘
```

---

## Data Architecture

### Database Schema

**ORM:** Drizzle ORM with SQLite

**Tables:**

#### `nodes`
Stores individual idea nodes in the graph.

```sql
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  summary TEXT,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  next_nodes TEXT,     -- JSON array
  prev_nodes TEXT,     -- JSON array
  timestamp INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
```

#### `edges`
Stores connections between nodes.

```sql
CREATE TABLE edges (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  label TEXT,
  type TEXT DEFAULT 'default',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);
```

### Data Flow

```
User Input → ChatPrompt
            ↓
    POST /api/chat (FormData)
            ↓
    OpenAI API Call (GPT-3.5-turbo)
            ↓
    Response: {summary, nextNodes, prevNodes}
            ↓
    saveNode() → INSERT INTO nodes
    saveEdge() → INSERT INTO edges
            ↓
    JSON Response to Client
            ↓
    Update Canvas State (React)
            ↓
    Re-render IdeaFlowCanvas
```

---

## API Design

### REST Endpoints

**POST /api/chat**
- **Purpose:** Generate AI-powered idea analysis
- **Input:** FormData (prompt, lastNodeId)
- **Output:** JSON (id, summary, nextNodes, prevNodes, position)
- **Side Effects:** Creates node and edge in database

**GET /** (Home Page)
- **Purpose:** Main application interface
- **SSR:** Yes (server-side rendered)
- **Loader:** Fetches all nodes and edges from database
- **Output:** HTML with embedded data

### External API Integration

**OpenAI Chat Completions API**
- **Model:** gpt-3.5-turbo
- **Temperature:** 0.7
- **Max Tokens:** 500
- **System Prompt:** Instructs AI to provide summaries and suggest connected ideas

---

## Component Architecture

### Component Hierarchy

```
App (root.tsx)
└── Outlet
    └── Home (routes/home.tsx)
        ├── Header (inline JSX)
        ├── IdeaFlowCanvas
        │   └── ReactFlow
        │       ├── Controls
        │       ├── MiniMap
        │       └── Background
        ├── ChatPrompt
        │   └── Form (useFetcher)
        └── NodeCounter (inline JSX)
```

### State Management

**Pattern:** Component State (useState) + Server State (loaders)

**State Location:**
- **Server State:** Database queries via loaders
- **Client State:** React useState in `Home` component
- **Form State:** React Router useFetcher in `ChatPrompt`

**No Global State Library** (Redux, Zustand, etc.)

---

## Security Architecture

### Authentication

**Status:** Not implemented

**Recommendation:** Add authentication before production deployment

### API Security

- **OpenAI API Key:** Stored server-side only (process.env)
- **Database:** Server-side only (not exposed to client)
- **CORS:** Same-origin policy (no CORS configured)

### Data Validation

**Input Validation:**
- Client-side: Required fields, non-empty strings
- Server-side: Basic checks (prompt required)

**Recommendation:** Add schema validation (Zod) for all API inputs

---

## Deployment Architecture

### Docker Containerization

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY build ./build
CMD ["npm", "run", "start"]
```

**Image Size:** ~150MB (estimated)

### Hosting Options

| Platform | Type | Notes |
|----------|------|-------|
| AWS ECS | Container | Recommended for production |
| Google Cloud Run | Container | Serverless containers |
| Azure Container Apps | Container | Managed containers |
| Fly.io | Container | Edge deployment |
| Railway | Container/Node | Simple deployment |
| Digital Ocean | Container/Node | Droplets or App Platform |

---

## Performance Characteristics

### Server-Side Rendering (SSR)

**Benefits:**
- Fast Time to First Byte (TTFB)
- SEO-friendly (fully rendered HTML)
- Progressive enhancement

**Trade-offs:**
- Server compute required
- Cannot use static hosting (Vercel/Netlify)

### Database Performance

**SQLite Characteristics:**
- **Read Performance:** Excellent (serverless queries)
- **Write Performance:** Good for single-user
- **Concurrency:** Limited (file-based locking)

**Scalability Considerations:**
- Suitable for < 1000 concurrent users
- Consider PostgreSQL for higher scale

### Bundle Size

**Estimated Production Bundle:**
- **JavaScript:** ~180KB gzipped
- **CSS:** ~20KB gzipped
- **Total:** ~200KB

**Third-Party Libraries:**
- React Flow: ~100KB (largest dependency)
- OpenAI SDK: Server-side only (not bundled)

---

## Development Workflow

### Hot Module Replacement (HMR)

- **Vite HMR:** Instant component updates
- **TypeScript:** Background compilation
- **CSS:** Instant style updates

### Type Safety

- **React Router Type Generation:** Automatic types for loaders/actions
- **Drizzle ORM:** Inferred types from schema
- **Strict TypeScript:** Full type checking enabled

---

## Scalability & Growth

### Current Limitations

1. **Single SQLite file** - Not suitable for distributed systems
2. **No authentication** - All data publicly accessible
3. **No rate limiting** - Vulnerable to abuse
4. **No caching** - Every request queries database

### Scaling Path

**Phase 1** (Current): Single server, SQLite
**Phase 2**: Add auth, rate limiting, caching
**Phase 3**: Migrate to PostgreSQL
**Phase 4**: Add read replicas, Redis cache
**Phase 5**: Microservices architecture (if needed)

---

## Technology Decisions

### Why React Router v7?

- **Full-stack framework** (no separate frontend/backend)
- **SSR built-in** (better performance than CSR)
- **Type-safe** routing with automatic generation
- **Vite integration** (fast builds)

### Why SQLite?

- **Zero configuration** (file-based)
- **Fast for read-heavy** workloads
- **Embedded** (no separate database server)
- **Good for MVP** and small-scale apps

### Why Drizzle ORM?

- **Type-safe** queries (no runtime errors)
- **Lightweight** (minimal overhead)
- **SQL-like** syntax (familiar to developers)
- **Migration support** (drizzle-kit)

### Why OpenAI?

- **Best-in-class** LLM for idea generation
- **Simple API** (easy integration)
- **Reliable** (managed service)

---

## Testing Strategy

**Current State:** No tests implemented

**Recommended Approach:**

1. **Unit Tests** (Vitest)
   - Database utilities
   - Pure functions

2. **Integration Tests** (Vitest)
   - API endpoints
   - Loaders/actions

3. **E2E Tests** (Playwright)
   - User flows
   - Canvas interactions

---

## Monitoring & Observability

**Current State:** Console logs only

**Production Needs:**
- **Logging:** Structured JSON logs (Winston/Pino)
- **Error Tracking:** Sentry or similar
- **Analytics:** User behavior tracking
- **Performance:** Web Vitals monitoring

---

## Future Architecture Considerations

### Potential Enhancements

1. **Real-time Collaboration**
   - WebSockets for live updates
   - Operational Transform (OT) for conflict resolution

2. **Offline Support**
   - Service Workers
   - IndexedDB caching
   - Sync when online

3. **Export/Import**
   - JSON export
   - PNG/SVG canvas export
   - Import from other tools

4. **Search & Filtering**
   - Full-text search (SQLite FTS5)
   - Tag system
   - Date range filters

---

## Architectural Patterns Used

- **Monolithic Architecture** - Single codebase for all functionality
- **Server-Side Rendering (SSR)** - HTML rendered on server
- **File-based Routing** - Routes defined in `routes.ts`
- **Repository Pattern** - Database utilities abstract DB access
- **Component Composition** - Reusable React components

---

## Key Takeaways

✅ **SSR full-stack** monolith for simplicity
✅ **Type-safe** end-to-end (TypeScript + Drizzle)
✅ **AI-enhanced** UX via OpenAI integration
✅ **Graph visualization** with React Flow
✅ **Fast development** with Vite + HMR
⚠️ **Limited scalability** with SQLite (good for MVP)
⚠️ **No authentication** (add before production)
⚠️ **No testing** (recommended to add)

---

## Glossary

- **SSR:** Server-Side Rendering
- **HMR:** Hot Module Replacement
- **ORM:** Object-Relational Mapping
- **TTFB:** Time to First Byte
- **CSR:** Client-Side Rendering
