# Idea Flow - Development Guidelines

A visual idea mapping tool with AI assistance for organizing and connecting thoughts.

## Project Overview

Idea Flow is a React Router v7 application that uses React Flow for interactive node-based visualization, OpenAI for AI-powered idea generation, and SQLite for persistent storage.

### Key Concepts

- **Idea Nodes**: User-generated ideas with AI-created titles and summaries
- **Association Nodes**: Contextual connections between ideas positioned using vector math
- **Flow Edges**: Sequential connections showing idea progression
- **Association Edges**: Purple lines connecting association nodes to parent ideas

## Styling

**IMPORTANT**: This project uses Tailwind CSS v4 for all styling.

- Use Tailwind utility classes for all component styling
- Responsive design principles: mobile-first approach
- Color scheme:
  - Idea nodes: Emerald/green tones (`text-emerald-600`, `bg-emerald-50`)
  - Association nodes: Purple tones (`text-purple-600`, `bg-purple-50`)
  - Edges: Green for flow (`#10b981`), purple for associations (`#9333ea`)
- Avoid raw CSS unless absolutely necessary for React Flow customization

### Tailwind Configuration

The project uses Tailwind CSS v4 with Vite integration. Configuration is minimal by design.

## Architecture

### Frontend Components

#### Core Components (`app/components/`)

- **IdeaFlowCanvas.tsx**: Main React Flow canvas wrapper
  - Handles node/edge state management
  - Configures React Flow controls and settings
  - Manages canvas interactions (pan, zoom, click)

- **IdeaNode.tsx**: Individual idea node component
  - Displays AI-generated title and body
  - Contains menu for actions (create association, delete)
  - Handles timestamp formatting
  - Manages node-level interactions

- **AssociationNode.tsx**: Association node component
  - Shows association description
  - Positioned relative to parent using vector direction and distance
  - Non-draggable (moves with parent node)

- **ChatPrompt.tsx**: AI chat input interface
  - Bottom-fixed input for creating new ideas
  - Submits to `/api/chat` endpoint
  - Handles user input and API responses

- **CreateAssociationModal.tsx**: Association creation modal
  - Form for association description
  - Vector direction input (0-360 degrees)
  - Distance from parent node
  - Submits to `/api/associations` endpoint

- **ConfirmModal.tsx**: Generic confirmation dialog
  - Used for delete and clear operations
  - Prevents accidental destructive actions
  - Customizable title, message, and button text

- **GlobalActionsMenu.tsx**: Global menu component
  - "Clear All" functionality
  - Future actions can be added here

### API Routes (`app/routes/`)

#### Main Route
- **home.tsx**: Main application page
  - Loader fetches all nodes, edges, and associations from database
  - Transforms DB data to React Flow format
  - Manages client-side state for nodes and edges
  - Handles association position calculations on parent node movement

#### API Endpoints
- **api.chat.ts**: AI-powered idea creation
  - Accepts user input
  - Calls OpenAI to generate title and body
  - Creates node in database
  - Creates edge if connecting to previous node
  - Returns formatted response

- **api.associations.ts**: Association CRUD operations
  - Creates association nodes
  - Calculates position based on vector and distance
  - Creates edge connecting to parent node
  - Stores association metadata

- **api.nodes.delete.ts**: Delete individual nodes
  - Removes node from database
  - Cascades to associated edges
  - Updates connected nodes' prev/next arrays

- **api.nodes.clear.ts**: Clear all nodes
  - Removes all nodes, edges, and associations
  - Used for starting fresh

### Database Layer (`app/db/`)

#### Schema (`schema.ts`)
```typescript
// Nodes table: Stores idea nodes
- id (text, primary key)
- rawInput (text) - Original user input
- title (text) - AI-generated title
- body (text) - AI-generated summary
- positionX, positionY (real) - Canvas coordinates
- nextNodes, prevNodes (text) - JSON arrays of connected node IDs
- timestamp (integer)

// Edges table: Stores connections
- id (text, primary key)
- source, target (text) - Node IDs
- label (text) - Optional edge label
- type (text) - 'default' or 'association'

// Associations table: Stores association nodes
- id (text, primary key)
- parentNodeId (text) - Parent idea node
- description (text) - Association description
- vectorDirection (real) - Angle 0-360 degrees
- distance (real) - Distance from parent in pixels
- prevNodeData, nextNodeData (text) - JSON context data
```

#### Utilities (`utils.server.ts`)
- `getAllNodes()`: Fetch all idea nodes
- `getAllEdges()`: Fetch all edges
- `getAllAssociations()`: Fetch all associations
- CRUD operations for nodes, edges, associations

#### Configuration (`config.ts`)
- Drizzle ORM setup with better-sqlite3
- Database connection configuration

## Development Workflow

### Starting Development

```bash
# Install dependencies (first time only)
npm install

# Initialize database
npm run db:push

# Start dev server
npm run dev
```

### Database Changes

When modifying the schema:
```bash
# Generate migration
npm run db:generate

# Apply changes
npm run db:push

# Inspect database
npm run db:studio
```

### Testing Flow

1. **Local Testing**: Use the dev server at http://localhost:5173
2. **Database Inspection**: Use Drizzle Studio to verify data
3. **Type Checking**: Run `npm run typecheck` before committing

## Key Implementation Details

### Vector-Based Positioning

Association nodes use polar coordinates for positioning:
```typescript
// Calculate position from parent
const angleRad = (vectorDirection * Math.PI) / 180;
const positionX = parentX + Math.cos(angleRad) * distance;
const positionY = parentY + Math.sin(angleRad) * distance;
```

### Node Movement with Associations

When idea nodes move, associated nodes must follow:
```typescript
// In home.tsx: handleNodesWithAssociations
// Recalculate association positions when parent moves
// Updates both position and edge connections
```

### AI Integration

OpenAI integration for idea generation:
- Model: GPT-4 or GPT-3.5-turbo
- Prompt engineering for concise titles and detailed bodies
- Structured output for consistent formatting

### Edge Styling

Two types of edges:
1. **Flow edges** (green): Show sequential idea progression
   - Include arrow markers
   - Default curved style
   - Label: "follows"

2. **Association edges** (purple): Connect associations to parents
   - No arrow markers
   - Straight lines
   - No labels

## Environment Variables

Required:
```bash
OPENAI_API_KEY=sk-...          # OpenAI API key for idea generation
```

Optional:
```bash
DATABASE_URL=file:./local.db   # SQLite database path
```

## Common Tasks

### Adding a New Node Type

1. Define component in `app/components/`
2. Add to `nodeTypes` in `IdeaFlowCanvas.tsx`
3. Update database schema if needed
4. Add transformation logic in `home.tsx` loader

### Adding API Endpoint

1. Create route file in `app/routes/` (e.g., `api.feature.ts`)
2. Add to route configuration in `app/routes.ts`
3. Implement loader/action with proper types
4. Handle errors and return appropriate responses

### Modifying Database Schema

1. Edit `app/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:push` to apply changes
4. Update TypeScript types throughout codebase
5. Update utility functions in `utils.server.ts`

## Code Style

- **TypeScript**: Strict typing, avoid `any`
- **React**: Functional components with hooks
- **Imports**: Use relative imports for app code
- **Naming**:
  - Components: PascalCase
  - Functions: camelCase
  - Database tables: lowercase plural
  - API routes: `api.resource.action.ts` pattern

## UI Guidelines

### Modal Pattern

Always use custom modal components, never system dialogs:
```typescript
// ❌ BAD
confirm("Delete this node?")

// ✅ GOOD
<ConfirmModal
  isOpen={isOpen}
  onClose={handleClose}
  onConfirm={handleConfirm}
  title="Delete Node"
  message="Are you sure?"
/>
```

### Loading States

Show loading indicators for async operations:
- Form submissions
- API requests
- Database operations

### Error Handling

- Display user-friendly error messages
- Log errors to console for debugging
- Provide recovery options when possible

## Performance Considerations

1. **React Flow Optimization**
   - Memoize node components
   - Use `useCallback` for event handlers
   - Minimize re-renders with proper state management

2. **Database Queries**
   - Use indexes on frequently queried fields
   - Batch operations when possible
   - Optimize JSON parsing for node connections

3. **AI API Calls**
   - Implement proper loading states
   - Handle rate limits gracefully
   - Consider caching responses for similar inputs

## Deployment

### Environment Setup

Ensure these are set in production:
- `OPENAI_API_KEY`: Required for AI features
- `DATABASE_URL`: Path to SQLite file (persistent volume)
- `NODE_ENV=production`: For production optimizations

### Build Process

```bash
npm run build
npm run start
```

### Docker Deployment

The included Dockerfile supports containerized deployment:
```bash
docker build -t idea-flow .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -v /path/to/data:/app/data \
  idea-flow
```

## Troubleshooting

### Database Issues
- Check file permissions for `local.db`
- Verify schema with `npm run db:studio`
- Reset database: Delete `local.db` and run `npm run db:push`

### React Flow Issues
- Check console for rendering errors
- Verify node data structure matches types
- Ensure position values are valid numbers

### OpenAI Issues
- Verify API key is set correctly
- Check rate limits and quotas
- Review API response format changes

## Future Enhancements

Potential features to consider:
- [ ] Multiple canvas workspaces
- [ ] Export/import functionality
- [ ] Collaborative editing
- [ ] Custom node colors and styles
- [ ] Search and filter nodes
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Node templates

## Git Workflow

**IMPORTANT**: Keep commit messages clean and professional.

Good commit messages:
```bash
git commit -m "Add association node deletion"
git commit -m "Fix edge positioning on node drag"
git commit -m "Improve AI prompt for better summaries"
```

Avoid watermarks or attribution in commits.
