# Idea Flow

A visual idea mapping tool with AI assistance built with React Router v7, React Flow, and OpenAI.

## Features

- **Visual Idea Mapping**: Create and organize ideas on an interactive canvas using React Flow
- **AI-Powered Ideas**: Generate idea titles and summaries automatically with OpenAI (GPT-5 Mini)
- **Sequential Flow**: Ideas automatically connect in a chain as you create them
- **Smart Positioning**: Automatic vertical layout based on content height
- **Interactive Canvas**: Drag nodes, pan, zoom, and arrange your idea space
- **Persistent Storage**: SQLite database with Drizzle ORM for data persistence
- **Toast Notifications**: Real-time feedback for all actions
- **Clean UI**: Tailwind CSS v4 styling with a modern, minimalist design

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
│   │   ├── ChatPrompt.tsx          # AI chat interface
│   │   ├── Toast.tsx               # Toast notification component
│   │   ├── ToastContainer.tsx      # Toast container
│   │   ├── ConfirmModal.tsx        # Confirmation dialog
│   │   └── GlobalActionsMenu.tsx   # Global actions menu
│   ├── hooks/               # Custom React hooks
│   │   ├── useToast.ts             # Toast notifications
│   │   ├── useClearAll.ts          # Clear all functionality
│   │   ├── useNodeConnect.ts       # Node connections
│   │   ├── useNodeDelete.ts        # Node deletion
│   │   ├── useIdeaChat.ts          # AI chat integration
│   │   └── useConfirmModal.ts      # Confirmation modals
│   ├── db/                  # Database setup
│   │   ├── schema.ts        # Database schema definitions
│   │   ├── db.server.ts     # Database configuration
│   │   └── utils.server.ts  # Server-side database utilities
│   ├── utils/               # Utility functions
│   │   └── cn.ts            # Class name utility
│   ├── routes/              # Route modules
│   │   ├── home.tsx         # Main canvas page
│   │   ├── api.chat.ts      # AI chat API endpoint
│   │   ├── api.nodes.connect.ts  # Node connection
│   │   ├── api.nodes.delete.ts   # Node deletion
│   │   └── api.nodes.clear.ts    # Clear all nodes
│   ├── root.tsx             # Root layout
│   ├── routes.ts            # Route configuration
│   └── app.css              # Global styles
├── public/                  # Static assets
├── drizzle.config.ts        # Drizzle ORM configuration
├── react-router.config.ts   # React Router configuration
└── package.json
```

## How It Works

### Creating Ideas

1. **First Idea**: Type your idea into the chat prompt at the bottom
2. **AI Generation**: AI generates a concise title (1-7 words) and detailed summary (1-7 sentences)
3. **Node Creation**: A new node appears on the canvas
4. **Sequential Flow**: Select a node, then create the next idea to chain them together
5. **Automatic Positioning**: Nodes are automatically positioned in a vertical flow

### Node Management

- **Select Node**: Click on a node to select it (required for creating connected ideas)
- **Delete Node**: Click the menu icon on a node and select delete
  - Chain integrity is maintained - neighboring nodes reconnect automatically
- **Clear All**: Use the global menu (top-right) to remove all nodes and start fresh
- **Manual Connections**: Drag from a node's handle to another node to create custom connections

### Positioning System

- Nodes are positioned automatically based on their chain order
- The first node (head) starts at the top
- Each subsequent node is positioned below based on its predecessor's height
- 50px spacing between nodes for clarity

## Database Schema

### Nodes Table
- Stores idea nodes with AI-generated titles and bodies
- Maintains chain connections via `nextNode` and `prevNode` fields
- Stores original user input and timestamp
- **Note**: Positions are calculated dynamically, not stored

### Edges
- **Not stored in database**
- Generated dynamically from node relationships
- Created from `nextNode` references when page loads
- Green arrows showing sequential flow

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

## Recent Changes (v2.0)

- ✅ Simplified to single node type (removed association nodes)
- ✅ Removed edges database table (edges now generated dynamically)
- ✅ Added custom hooks for better code organization
- ✅ Fixed node deletion to maintain chain integrity
- ✅ Added toast notification system
- ✅ Updated AI model to GPT-5 Mini (2025-08-07)
- ✅ Improved TypeScript typing throughout

## Contributing

This is a personal project, but feedback and suggestions are welcome!

## License

MIT

---

Built with React Router v7, React Flow, and OpenAI GPT-5 Mini
