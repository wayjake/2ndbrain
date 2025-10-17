# Idea Flow - Development Guidelines

A visual idea mapping tool with AI assistance for organizing and connecting thoughts.

## Project Overview

Idea Flow is a React Router v7 application that uses React Flow for interactive node-based visualization, OpenAI for AI-powered idea generation, and SQLite for persistent storage.

### Key Concepts

- **Idea Nodes**: User-generated ideas with AI-created titles and summaries
- **Node Chain**: Linear sequence of connected ideas (prevNode/nextNode relationships)
- **Flow Edges**: Visual connections generated dynamically from node chain
- **Positioning**: Automatic vertical layout based on node height estimation

## Styling

**IMPORTANT**: This project uses Tailwind CSS v4 for all styling.

- Use Tailwind utility classes for all component styling
- Responsive design principles: mobile-first approach
- Color scheme:
  - Idea nodes: Emerald/green tones (`text-emerald-600`, `bg-emerald-50`)
  - Edges: Green for flow (`#10b981`)
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
  - Contains menu for actions (delete)
  - Handles timestamp formatting
  - Manages node-level interactions

- **ChatPrompt.tsx**: AI chat input interface
  - Bottom-fixed input for creating new ideas
  - Submits to `/api/chat` endpoint
  - Requires node selection to create connected ideas
  - Handles user input and API responses

- **Toast.tsx** & **ToastContainer.tsx**: Toast notification system
  - Shows success, error, warning, and info messages
  - Auto-dismiss after timeout
  - Stacked notifications in bottom-right corner

- **ConfirmModal.tsx**: Generic confirmation dialog
  - Used for delete and clear operations
  - Prevents accidental destructive actions
  - Customizable title, message, and button text

- **GlobalActionsMenu.tsx**: Global menu component
  - "Clear All" functionality
  - Future actions can be added here

#### Custom Hooks (`app/hooks/`)

- **useToast.ts**: Toast notification management
- **useClearAll.ts**: Clear all nodes functionality
- **useNodeConnect.ts**: Node connection logic
- **useNodeDelete.ts**: Node deletion with chain maintenance
- **useIdeaChat.ts**: AI chat integration

### API Routes (`app/routes/`)

#### Main Route
- **home.tsx**: Main application page
  - Loader fetches all nodes from database
  - Calculates node positions based on chain (prevNode/nextNode)
  - Generates edges dynamically from node relationships
  - Manages client-side state for nodes and edges

#### API Endpoints
- **api.chat.ts**: AI-powered idea creation
  - Accepts user input and parent node ID
  - Calls OpenAI (gpt-5-mini-2025-08-07) to generate title and body
  - Creates node in database with prevNode reference
  - Updates parent node's nextNode reference
  - Returns formatted response

- **api.nodes.connect.ts**: Manual node connection
  - Connects two existing nodes
  - Updates prevNode/nextNode relationships
  - Validates connection constraints

- **api.nodes.delete.ts**: Delete individual nodes
  - Removes node from database
  - Maintains chain integrity by updating neighboring nodes
  - Reconnects previous and next nodes

- **api.nodes.clear.ts**: Clear all nodes
  - Removes all nodes from database
  - Used for starting fresh

### Database Layer (`app/db/`)

#### Schema (`schema.ts`)
```typescript
// Nodes table: Stores idea nodes
- id (text, primary key)
- rawInput (text) - Original user input
- title (text) - AI-generated title
- body (text) - AI-generated summary
- nextNode (text) - ID of next node in chain
- prevNode (text) - ID of previous node in chain
- timestamp (integer)
- createdAt (integer)

// Note: Edges are NOT stored in database
// They are generated dynamically from nextNode relationships
```

#### Utilities (`utils.server.ts`)
- `getAllNodes()`: Fetch all idea nodes
- `getNodeById(id)`: Fetch single node by ID
- `saveNode(nodeData)`: Insert new node
- `deleteNode(id)`: Delete node and update chain
- CRUD operations for nodes

#### Configuration (`db.server.ts`)
- Drizzle ORM setup with better-sqlite3
- Database connection configuration

#### Utils (`app/utils/`)
- `cn.ts`: Class name utility for conditional Tailwind classes

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

### Chain-Based Positioning

Nodes are positioned automatically based on their chain order:
```typescript
// Find head node (no prevNode)
const headNode = dbNodes.find(n => !n.prevNode);

// Walk the chain and calculate positions
let currentY = 100;
const centerX = 400;

while (currentNode) {
  nodePositions.set(currentNode.id, { x: centerX, y: currentY });

  // Calculate height based on content
  const nodeHeight = estimateNodeHeight(currentNode.title, currentNode.body);
  currentY += nodeHeight + 50; // 50px spacing

  // Move to next node
  currentNode = dbNodes.find(n => n.id === currentNode.nextNode);
}
```

### Node Chain Integrity

When deleting nodes, the chain is maintained:
```typescript
// In deleteNode():
// 1. Get the node to delete
// 2. Update previous node's nextNode to point to this node's nextNode
// 3. Update next node's prevNode to point to this node's prevNode
// 4. Delete the node
```

### AI Integration

OpenAI integration for idea generation:
- Model: **gpt-5-mini-2025-08-07**
- Structured output using Zod schema validation
- Concise titles (1-7 words) and detailed bodies (1-7 sentences)
- Decision-maker system prompt for focused responses

### Edge Generation

Edges are generated dynamically, not stored in database:
```typescript
// Create edges from node relationships
const edges = dbNodes
  .filter(node => node.nextNode)
  .map(node => ({
    id: `${node.id}-${node.nextNode}`,
    source: node.id,
    target: node.nextNode,
    type: 'default',
    markerEnd: { type: MarkerType.ArrowClosed },
    label: 'next',
    style: { stroke: '#10b981', strokeWidth: 2 }
  }));
```

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

## Recent Changes

### Version 2.0 Refactor
- ✅ Removed association nodes feature (simplified to single node type)
- ✅ Removed edges database table (edges now generated dynamically)
- ✅ Added custom hooks for better code organization
- ✅ Fixed node deletion to maintain chain integrity
- ✅ Added toast notification system
- ✅ Updated AI model to gpt-5-mini-2025-08-07
- ✅ Improved TypeScript typing throughout

## Future Enhancements

Potential features to consider:
- [ ] Multiple canvas workspaces
- [ ] Export/import functionality
- [ ] Branching node chains (multiple paths)
- [ ] Node templates and categories
- [ ] Search and filter nodes
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Collaborative editing

## Git Workflow

**IMPORTANT**: Keep commit messages clean and professional.

Good commit messages:
```bash
git commit -m "Add association node deletion"
git commit -m "Fix edge positioning on node drag"
git commit -m "Improve AI prompt for better summaries"
```

Avoid watermarks or attribution in commits.
