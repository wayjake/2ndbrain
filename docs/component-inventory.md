# Component Inventory

**Project:** idea-flow
**UI Library:** React 19.1.1
**Flow Library:** @xyflow/react 12.8.6
**Styling:** Tailwind CSS 4.1.13

---

## Overview

The application consists of 2 custom React components that work together to create an interactive idea flow visualization interface.

---

## Component Hierarchy

```
Home (Page)
├── Header (inline)
├── IdeaFlowCanvas
│   ├── ReactFlow (external)
│   │   ├── Controls
│   │   ├── MiniMap
│   │   └── Background
│   └── Custom Node Rendering
└── ChatPrompt
    └── Form (input + button)
```

---

## Components

### 1. **IdeaFlowCanvas**

**Location:** `app/components/IdeaFlowCanvas.tsx`

**Purpose:** Interactive canvas for visualizing and manipulating idea nodes and connections using React Flow

**Category:** Layout / Visualization

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `nodes` | `IdeaNode[]` | ✗ | `[]` | Array of nodes to display |
| `edges` | `Edge[]` | ✗ | `[]` | Array of edges connecting nodes |
| `onNodesChange` | `(nodes: IdeaNode[]) => void` | ✗ | - | Callback when nodes are modified |
| `onEdgesChange` | `(edges: Edge[]) => void` | ✗ | - | Callback when edges are modified |

**IdeaNode Interface:**

```typescript
interface IdeaNode extends Node {
  data: {
    label: string;          // Main idea text
    summary: string;        // AI-generated summary
    nextNodes?: string[];   // Suggested follow-up ideas
    prevNodes?: string[];   // Suggested prerequisite ideas
    timestamp: number;      // Creation time
  };
}
```

**Features:**
- Drag-and-drop node repositioning
- Zoom and pan canvas controls
- Mini-map navigation
- Dotted background grid
- Arrow markers on edges
- Connection creation between nodes
- Bi-directional data binding

**External Dependencies:**
- `@xyflow/react` - Core React Flow library
- `ReactFlow` - Main canvas component
- `Controls` - Zoom/fit controls
- `MiniMap` - Overview mini-map
- `Background` - Dotted grid background

**State Management:**
- Uses React Flow's `useNodesState` and `useEdgesState` hooks
- Maintains internal state while syncing with parent via callbacks

**Styling:**
- Full width and height container
- Imports `@xyflow/react/dist/style.css`
- Background variant: Dots (gap: 12, size: 1)

---

### 2. **ChatPrompt**

**Location:** `app/components/ChatPrompt.tsx`

**Purpose:** Fixed bottom input form for submitting ideas to the AI chat API

**Category:** Form / Input

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onResponse` | `(response: any) => void` | ✓ | - | Callback when AI response is received |
| `disabled` | `boolean` | ✗ | `false` | Disable input and submission |
| `lastNodeId` | `string` | ✗ | - | ID of previous node for edge creation |

**Features:**
- Fixed positioning at bottom of viewport
- Auto-submits to `/api/chat` endpoint
- Loading state during submission ("Sending...")
- Clears input after successful submission
- Disabled state when submitting
- Calls `onResponse` callback when data returns
- Prevents empty submissions

**Form Fields:**
- **Input:** Text field for user's idea/question
- **Button:** Submit button with loading state

**State Management:**
- Uses `useFetcher` hook from React Router for form submission
- Local state for input value (`prompt`)
- Monitors `fetcher.state` for loading indication

**Styling (Tailwind CSS):**
- **Container:** `fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50`
- **Form:** `max-w-4xl mx-auto flex gap-3`
- **Input:** `flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500`
- **Button:** `px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700`

**Accessibility:**
- Disabled states for both input and button
- Focus rings on interactive elements
- Placeholder text for guidance

---

## Page Components

### Home Page

**Location:** `app/routes/home.tsx`

**Type:** Route Component

**Components Used:**
- `IdeaFlowCanvas` - Main visualization canvas
- `ChatPrompt` - Bottom input form

**Additional UI Elements:**
- **Header** (inline) - Title and description banner
- **Node Counter** - Displays count of ideas (top-right corner)

**Layout Structure:**

```tsx
<div className="relative w-screen h-screen">
  {/* Header - Fixed top */}
  <div className="absolute top-0 ...">
    <h1>Idea Flow</h1>
    <p>Connect and organize your ideas visually</p>
  </div>

  {/* Canvas - Full screen minus header/footer */}
  <div className="absolute inset-0 pt-16 pb-20">
    <IdeaFlowCanvas />
  </div>

  {/* Chat Input - Fixed bottom */}
  <ChatPrompt />

  {/* Node Count - Fixed top-right */}
  <div className="absolute top-20 right-4">
    {nodes.length} ideas
  </div>
</div>
```

**State Management:**
- Local state for `nodes` and `edges` arrays
- Initialized from loader data
- Updated via `ChatPrompt` callback

---

## Third-Party Components

### React Flow Components

**Package:** `@xyflow/react@12.8.6`

**Used Components:**
- `ReactFlow` - Main canvas component
- `Controls` - Zoom in/out, fit view controls
- `MiniMap` - Small overview map
- `Background` - Grid/dots background layer

**Hooks:**
- `useNodesState` - Manage nodes with React Flow
- `useEdgesState` - Manage edges with React Flow
- `addEdge` - Helper for creating edges

**Types:**
- `Node` - Base node type
- `Edge` - Edge connection type
- `Connection` - Connection event type
- `BackgroundVariant` - Background pattern enum
- `MarkerType` - Arrow marker types

---

## Component Patterns

### Data Flow

1. **Initial Load:**
   - `loader()` fetches nodes and edges from database
   - Data passed to `Home` component via `useLoaderData()`
   - `Home` initializes local state with loader data
   - State passed as props to `IdeaFlowCanvas`

2. **Adding New Idea:**
   - User types in `ChatPrompt`
   - Form submits to `/api/chat`
   - `ChatPrompt` receives response via `useFetcher`
   - Calls `onResponse` callback with data
   - `Home` creates new node and edge
   - Updates `nodes` and `edges` state
   - `IdeaFlowCanvas` re-renders with new data

### Event Handlers

**Canvas Events:**
- `onNodesChange` - Node moved, selected, or modified
- `onEdgesChange` - Edge added, removed, or modified
- `onConnect` - User manually connects two nodes

**Form Events:**
- `onSubmit` - User submits chat prompt
- `onChange` - Input value changes

---

## Styling System

**Framework:** Tailwind CSS 4.1.13

**Color Palette:**
- Primary: Blue (`bg-blue-600`, `text-blue-600`)
- Success: Green (`#10b981` for edges)
- Neutral: Gray scale (`gray-50` to `gray-800`)

**Spacing:**
- Fixed header: `py-3 px-4`
- Fixed footer: `p-4`
- Canvas padding: `pt-16 pb-20`

**Z-Index Layers:**
- Header: `z-40`
- Node counter: `z-40`
- Chat prompt: `z-50` (topmost)

---

## State Management

**Pattern:** Component State (useState)

**No global state library** (Redux, Zustand, etc.) currently used.

**State Location:**
- `Home` component holds master state for nodes and edges
- Child components use props and callbacks
- React Flow manages internal canvas state

---

## Future Component Needs

Based on the application structure, consider adding:

- **NodeCard** - Custom node component with better styling
- **EdgeLabel** - Custom edge label component
- **Sidebar** - Panel for node details and metadata
- **Toolbar** - Quick actions (delete, export, clear)
- **Loading** - Loading skeleton for initial data fetch
- **ErrorBoundary** - Error handling UI
- **Toast** - Notification system for user feedback
- **Modal** - Dialogs for confirmations

---

## Performance Considerations

- React Flow handles virtualization for large graphs
- No memoization currently used (`useMemo`, `useCallback` in `IdeaFlowCanvas` only)
- State updates trigger full re-renders of `Home` component
- Consider `React.memo()` for components if performance degrades with many nodes

---

## Accessibility Notes

- Focus states present on interactive elements
- No ARIA labels currently implemented
- Keyboard navigation limited to form inputs
- Consider adding keyboard shortcuts for canvas operations

---

## Component Dependencies Graph

```
ChatPrompt
└── react-router (useFetcher)

IdeaFlowCanvas
└── @xyflow/react (ReactFlow, hooks, utilities)

Home
├── react-router (useLoaderData)
├── IdeaFlowCanvas
└── ChatPrompt
```

---

## Reusability Assessment

**Highly Reusable:**
- `ChatPrompt` - Generic AI chat input (can be used elsewhere)

**Domain-Specific:**
- `IdeaFlowCanvas` - Tied to idea flow domain but could be abstracted

**Not Reusable:**
- `Home` page component (specific to this app)
