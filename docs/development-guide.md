# Development Guide

**Project:** idea-flow
**Framework:** React Router v7.9.2
**Package Manager:** npm

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| Node.js | 18.0.0+ | JavaScript runtime |
| npm | 9.0.0+ | Package manager |
| Git | 2.0+ | Version control |

### Optional Tools

- **Docker** - For containerized deployment
- **Drizzle Studio** - Database GUI (included in dev dependencies)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd idea-flow
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- 14 production dependencies
- 9 development dependencies
- Total: 259 packages (including transitive dependencies)

### 3. Environment Setup

Create a `.env` file in the project root:

```bash
# Required for OpenAI integration
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Custom database location
DATABASE_URL=file:./local.db
```

**Environment Variables:**

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `OPENAI_API_KEY` | ✓ | - | OpenAI API authentication |
| `DATABASE_URL` | ✗ | `file:./local.db` | SQLite database file path |

### 4. Initialize Database

The database tables are created automatically on first run, but you can manually push the schema:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

**Access the application at:** `http://localhost:5173`

**Features enabled:**
- Hot Module Replacement (HMR)
- Server-Side Rendering (SSR)
- Automatic TypeScript compilation
- Tailwind CSS live reload

---

## Available Scripts

### Development

```bash
npm run dev
# Starts Vite dev server on port 5173
# Enables HMR for instant updates
# Watches: app/**, *.config.ts files
```

### Type Checking

```bash
npm run typecheck
# Generates React Router types (.react-router/types/)
# Runs TypeScript compiler (tsc)
# Does not emit JavaScript (noEmit: true)
```

### Building

```bash
npm run build
# Creates production build in build/ directory
# Output structure:
#   build/client/   - Static assets (JS, CSS)
#   build/server/   - Server bundle (index.js)
```

### Production Server

```bash
npm run start
# Serves production build
# Runs: react-router-serve ./build/server/index.js
# Requires: npm run build first
```

### Database Management

```bash
# Push schema changes to database
npm run db:push

# Generate migration files (not auto-applied)
npm run db:generate

# Open Drizzle Studio GUI (browser-based)
npm run db:studio
# Access at: https://local.drizzle.studio
```

---

## Project Structure for Development

```
app/
├── components/     # Add new React components here
├── db/             # Database schema and utilities
│   ├── schema.ts   # Edit to add new tables
│   └── utils.server.ts  # Add database functions here
├── routes/         # Add new pages and API endpoints here
│   ├── *.tsx       # Page routes (with loaders)
│   └── api.*.ts    # API routes (with actions)
├── root.tsx        # Modify global layout/fonts/error pages
└── routes.ts       # Register new routes here
```

---

## Adding New Features

### Add a New Page Route

1. **Create route file:** `app/routes/about.tsx`
   ```typescript
   import type { Route } from "./+types/about";

   export function meta({}: Route.MetaArgs) {
     return [{ title: "About - Idea Flow" }];
   }

   export default function About() {
     return <div>About page</div>;
   }
   ```

2. **Register route:** In `app/routes.ts`
   ```typescript
   export default [
     index("routes/home.tsx"),
     route("about", "routes/about.tsx"),  // Add this line
     route("api/chat", "routes/api.chat.ts")
   ] satisfies RouteConfig;
   ```

3. **Navigate:** Access at `/about`

### Add a New API Endpoint

1. **Create API file:** `app/routes/api.ideas.ts`
   ```typescript
   import type { Route } from "./+types/api.ideas";
   import { getAllNodes } from "../db/utils.server";

   export async function loader({ request }: Route.LoaderArgs) {
     const ideas = await getAllNodes();
     return Response.json(ideas);
   }
   ```

2. **Register route:** In `app/routes.ts`
   ```typescript
   route("api/ideas", "routes/api.ideas.ts")
   ```

3. **Access:** `GET /api/ideas`

### Add a New Database Table

1. **Define schema:** In `app/db/schema.ts`
   ```typescript
   export const tags = sqliteTable('tags', {
     id: text('id').primaryKey(),
     name: text('name').notNull(),
   });
   ```

2. **Update database:**
   ```bash
   npm run db:push
   ```

3. **Add utilities:** In `app/db/utils.server.ts`
   ```typescript
   export async function getAllTags() {
     return await db.select().from(tags);
   }
   ```

### Add a New React Component

1. **Create component:** `app/components/Sidebar.tsx`
   ```typescript
   export default function Sidebar({ children }: { children: React.ReactNode }) {
     return (
       <aside className="w-64 bg-gray-100 p-4">
         {children}
       </aside>
     );
   }
   ```

2. **Import and use:** In any route
   ```typescript
   import Sidebar from "../components/Sidebar";
   ```

---

## Coding Standards

### TypeScript

- **Strict mode:** Enabled (`strict: true` in tsconfig.json)
- **Type imports:** Use `import type` for type-only imports
- **Route types:** Always import from `./+types/<route-name>`

**Example:**
```typescript
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  // Fully typed loader
}
```

### File Naming

- **Components:** PascalCase (`ChatPrompt.tsx`)
- **Routes:** lowercase (`home.tsx`, `api.chat.ts`)
- **Server-only:** Use `.server.ts` suffix
- **Config:** kebab-case (`react-router.config.ts`)

### Styling

- **Framework:** Tailwind CSS 4.1.13
- **No CSS files:** Use Tailwind utility classes
- **Global styles:** Only in `app/app.css`

**Example:**
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold">Title</h2>
</div>
```

---

## Development Workflow

### Typical Development Cycle

1. **Start dev server:** `npm run dev`
2. **Make changes** to files in `app/`
3. **Browser auto-reloads** (HMR)
4. **Check types:** `npm run typecheck` (periodically)
5. **Test in browser:** Verify functionality
6. **Commit changes:** Git workflow

### Hot Module Replacement (HMR)

**Files that trigger instant reload:**
- `app/**/*.tsx` - React components
- `app/**/*.ts` - TypeScript modules
- `app/app.css` - Tailwind styles
- `*.config.ts` - Config changes (may require full restart)

**Files that require server restart:**
- `package.json` - After installing new dependencies
- `.env` - Environment variable changes

---

## Debugging

### Development Console

**Browser DevTools:**
- React components visible in React DevTools extension
- Network tab shows loader/action requests
- Console logs visible for client-side code

**Terminal:**
- Server-side logs appear in the terminal running `npm run dev`
- `console.log()` in loaders/actions → terminal
- `console.log()` in components → browser console

### Common Issues

**Issue:** Port 5173 already in use

```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

**Issue:** TypeScript errors

```bash
# Regenerate types
npm run typecheck

# Check for syntax errors
tsc --noEmit
```

**Issue:** Database locked

```bash
# Close Drizzle Studio
# Stop dev server
# Delete local.db and restart
rm local.db
npm run dev
```

---

## Testing

**Current State:** No test framework configured

**Recommended Setup:**

- **Unit Tests:** Vitest
- **E2E Tests:** Playwright
- **Component Tests:** Testing Library

**Future commands:**
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:watch    # Watch mode
```

---

## Build Process

### Development Build

```bash
npm run dev
```

- **Mode:** Development
- **Optimization:** None
- **Source Maps:** Inline
- **Minification:** Disabled

### Production Build

```bash
npm run build
```

**Process:**
1. TypeScript compilation
2. React Router type generation
3. Vite bundling and optimization
4. Output to `build/` directory

**Output:**
```
build/
├── client/
│   ├── assets/
│   │   ├── [hash].js      # JavaScript bundles
│   │   └── [hash].css     # CSS bundles
│   └── manifest.json      # Asset manifest
└── server/
    └── index.js           # Server entry point
```

**Optimizations Applied:**
- Tree shaking (unused code removal)
- Minification (Terser)
- Code splitting (dynamic imports)
- Asset hashing (cache busting)

---

## Deployment

### Docker Deployment

**Build image:**
```bash
docker build -t idea-flow .
```

**Run container:**
```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your-key \
  -e DATABASE_URL=file:/app/data/db.sqlite \
  -v $(pwd)/data:/app/data \
  idea-flow
```

**Access:** `http://localhost:3000`

### Node.js Deployment

**Requirements:**
- Node.js 18+ on server
- npm installed

**Steps:**
1. Build locally: `npm run build`
2. Upload `build/`, `package.json`, `package-lock.json` to server
3. Install production deps: `npm ci --production`
4. Start server: `npm run start`

### Platforms Supported

- **AWS ECS** - Container deployment
- **Google Cloud Run** - Container deployment
- **Azure Container Apps** - Container deployment
- **Digital Ocean App Platform** - Container or Node.js
- **Fly.io** - Container deployment
- **Railway** - Container or Node.js
- **Vercel/Netlify** - Not recommended (SSR needs long-running server)

---

## Environment-Specific Configuration

### Development

```bash
NODE_ENV=development
DATABASE_URL=file:./local.db
```

- SQLite file in project root
- Detailed error messages
- Source maps enabled

### Production

```bash
NODE_ENV=production
DATABASE_URL=file:/app/data/prod.db
OPENAI_API_KEY=sk-prod-key
```

- SQLite file in persistent volume
- Error messages hidden
- Optimized bundles

---

## Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>

# Install latest versions
npm install <package>@latest
```

### Database Migrations

**Current:** Schema changes pushed directly with `npm run db:push`

**Recommended for Production:**
```bash
# Generate migration
npm run db:generate

# Review migration in drizzle/ folder
# Apply migration manually or via CI/CD
```

---

## Performance Optimization

### Development

- Vite's lightning-fast HMR
- No full page reloads (most changes)
- TypeScript type checking in background

### Production

- **Bundle Size:** ~200KB gzipped (estimated)
- **Code Splitting:** Automatic by React Router
- **Caching:** Asset hashing for long-term caching
- **SSR:** Faster initial page load

**Tips:**
- Use dynamic imports for large dependencies
- Optimize images before adding to `public/`
- Monitor bundle size with `npm run build`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Dev server won't start | Check port 5173 availability, delete `.react-router/` |
| TypeScript errors | Run `npm run typecheck`, check `tsconfig.json` |
| Database errors | Delete `local.db`, restart server |
| OpenAI API failing | Verify `OPENAI_API_KEY` in `.env` |
| Build fails | Clear `build/` and `node_modules/`, reinstall |
| Styles not applying | Check Tailwind class names, restart dev server |

---

## Additional Resources

- **React Router Docs:** https://reactrouter.com/
- **Drizzle ORM Docs:** https://orm.drizzle.team/
- **Tailwind CSS Docs:** https://tailwindcss.com/
- **Vite Docs:** https://vitejs.dev/
- **OpenAI API Docs:** https://platform.openai.com/docs/

---

## Quick Reference

```bash
# Start development
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Run production build
npm run start

# Database commands
npm run db:push       # Sync schema
npm run db:studio     # Open GUI

# Docker
docker build -t idea-flow .
docker run -p 3000:3000 idea-flow
```
