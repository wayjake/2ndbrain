# Idea Flow

A visual idea mapping tool with AI assistance built with React Router v7, React Flow, and OpenAI.

## Features

- **Visual Idea Mapping**: Create and organize ideas on an interactive canvas using React Flow
- **AI-Powered Ideas**: Generate idea titles and summaries automatically with OpenAI
- **Association Nodes**: Create contextual connections between ideas with custom descriptions
- **Flow Connections**: Link ideas in sequential flows with visual edges
- **Interactive Canvas**: Drag nodes, pan, zoom, and arrange your idea space
- **Persistent Storage**: SQLite database with Drizzle ORM for data persistence
- **Real-time Updates**: Server-side rendering with optimistic UI updates
- **Clean UI**: Tailwind CSS styling with a modern, minimalist design

## Tech Stack

- **Frontend**: React 19, React Router v7, React Flow
- **Backend**: Node.js with React Router server-side rendering
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenAI API for idea generation
- **Styling**: Tailwind CSS v4
- **TypeScript**: Full type safety throughout

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd idea-flow
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the root directory
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Development

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking

# Database commands
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Project Structure

```
idea-flow/
├── app/
│   ├── components/          # React components
│   │   ├── IdeaFlowCanvas.tsx      # Main React Flow canvas
│   │   ├── IdeaNode.tsx            # Idea node component
│   │   ├── AssociationNode.tsx     # Association node component
│   │   ├── ChatPrompt.tsx          # AI chat interface
│   │   ├── CreateAssociationModal.tsx
│   │   ├── ConfirmModal.tsx
│   │   └── GlobalActionsMenu.tsx
│   ├── db/                  # Database setup
│   │   ├── schema.ts        # Database schema definitions
│   │   ├── config.ts        # Database configuration
│   │   └── utils.server.ts  # Server-side database utilities
│   ├── routes/              # Route modules
│   │   ├── home.tsx         # Main canvas page
│   │   ├── api.chat.ts      # AI chat API endpoint
│   │   ├── api.associations.ts  # Association CRUD
│   │   ├── api.nodes.delete.ts
│   │   └── api.nodes.clear.ts
│   ├── root.tsx             # Root layout
│   ├── routes.ts            # Route configuration
│   └── app.css              # Global styles
├── public/                  # Static assets
├── drizzle.config.ts        # Drizzle ORM configuration
├── react-router.config.ts   # React Router configuration
└── package.json
```

## How It Works

### Idea Nodes

1. Type your idea into the chat prompt at the bottom
2. AI generates a concise title and detailed summary
3. A new node appears on the canvas with your idea
4. Ideas automatically connect in sequence as you add them

### Association Nodes

1. Click the menu icon on any idea node
2. Select "Create Association"
3. Enter a description of how concepts relate
4. Set the direction (angle) and distance for visual placement
5. Association appears connected to the parent node with a purple line

### Node Management

- **Drag nodes**: Click and drag any idea node to reposition
- **Delete node**: Open node menu and select delete
- **Clear all**: Use the global menu to remove all nodes and start fresh

## Database Schema

### Nodes Table
- Stores idea nodes with AI-generated titles and bodies
- Tracks position (x, y coordinates)
- Maintains connections (nextNodes, prevNodes)
- Stores original user input and timestamp

### Edges Table
- Defines connections between nodes
- Supports different edge types (default flow vs associations)
- Stores visual properties and labels

### Associations Table
- Special nodes that represent conceptual relationships
- Positioned relative to parent nodes using vector math
- Store angle (vectorDirection) and distance for placement
- Can connect to previous or next ideas in the flow

## Environment Variables

Required:
```bash
OPENAI_API_KEY=sk-...          # Your OpenAI API key
```

Optional:
```bash
DATABASE_URL=file:./local.db   # SQLite database path (default)
```

## Deployment

### Docker Deployment

Build and run with Docker:

```bash
docker build -t idea-flow .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key idea-flow
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your server

3. Start the production server:
```bash
npm run start
```

Deploy to any platform supporting Node.js applications:
- Railway
- Fly.io
- DigitalOcean App Platform
- AWS ECS
- Google Cloud Run

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

MIT

---

Built with React Router v7 and React Flow
