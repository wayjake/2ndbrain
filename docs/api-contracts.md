# API Contracts & Endpoints

**Project:** idea-flow
**Framework:** React Router v7
**Base URL:** (Deployed application URL)

---

## Overview

The application exposes 1 API endpoint for AI-powered idea generation and 1 data-loading route for the main interface.

---

## API Endpoints

### `POST /api/chat`

**Purpose:** Generate AI-powered summaries and suggestions for user ideas using OpenAI GPT-3.5-turbo

**Location:** `app/routes/api.chat.ts`

**Method:** POST

**Content-Type:** `application/x-www-form-urlencoded` or `multipart/form-data`

#### Request Body (FormData)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✓ | User's idea or thought to process |
| `lastNodeId` | string | ✗ | ID of the previous node to create an edge connection |

#### Response (Success - 200)

```json
{
  "id": "1729012345678",
  "prompt": "Build a task management app",
  "summary": "A brief AI-generated summary of the idea (2-3 sentences)",
  "message": "AI assistant's helpful response to the user",
  "nextNodes": ["Feature 1", "Feature 2"],
  "prevNodes": ["Research phase", "Planning"],
  "timestamp": 1729012345678,
  "position": {
    "x": 300,
    "y": 280
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique node ID (timestamp-based) |
| `prompt` | string | Original user prompt |
| `summary` | string | AI-generated summary |
| `message` | string | AI assistant's response |
| `nextNodes` | string[] | Suggested ideas that could follow this one |
| `prevNodes` | string[] | Suggested ideas that could precede this one |
| `timestamp` | number | Creation timestamp (ms since epoch) |
| `position` | object | Canvas coordinates `{x, y}` |

#### Response (Error - 400)

```json
{
  "error": "Prompt is required"
}
```

#### Response (Error - 500)

```json
{
  "error": "Failed to process request"
}
```

#### Side Effects

1. **Creates Node** in database with AI-generated data
2. **Creates Edge** if `lastNodeId` is provided, connecting previous node to new node
3. **Calls OpenAI API** with GPT-3.5-turbo model

#### OpenAI Configuration

- **Model:** `gpt-3.5-turbo`
- **Temperature:** 0.7
- **Max Tokens:** 500
- **System Prompt:** Instructs AI to provide summaries and suggest next/previous nodes in JSON format

#### Example Request

```bash
curl -X POST https://your-app.com/api/chat \
  -d "prompt=Build a mobile app for tracking habits" \
  -d "lastNodeId=1729012000000"
```

---

## Page Routes (Data Loaders)

### `GET /` (Home Page)

**Purpose:** Main application interface with idea flow canvas

**Location:** `app/routes/home.tsx`

**Method:** GET

**Server-Side Loader:** Yes

#### Loader Response

```typescript
{
  nodes: IdeaNode[],
  edges: Edge[]
}
```

#### Node Shape

```typescript
{
  id: string;
  type: 'default';
  position: { x: number; y: number };
  data: {
    label: string;
    summary: string;
    nextNodes: string[];
    prevNodes: string[];
    timestamp: number;
  }
}
```

#### Edge Shape

```typescript
{
  id: string;
  source: string;
  target: string;
  type: string;
  label: string | null;
  markerEnd: {
    type: MarkerType.ArrowClosed;
    width: 20;
    height: 20;
  };
  style: { stroke: '#10b981'; strokeWidth: 2 }
}
```

#### Data Source

- Fetches all nodes from `nodes` table via `getAllNodes()`
- Fetches all edges from `edges` table via `getAllEdges()`
- Transforms database records to React Flow format

---

## Route Configuration

**File:** `app/routes.ts`

```typescript
export default [
  index("routes/home.tsx"),
  route("api/chat", "routes/api.chat.ts")
] satisfies RouteConfig;
```

---

## Authentication & Security

**Current State:** No authentication implemented

**API Key Management:**
- OpenAI API key stored in `process.env.OPENAI_API_KEY`
- Not exposed to client-side code

**Rate Limiting:** None (consider implementing for production)

**CORS:** Not configured (same-origin only)

---

## External API Dependencies

### OpenAI API

**Service:** OpenAI Chat Completions
**Endpoint:** `https://api.openai.com/v1/chat/completions`
**Model:** gpt-3.5-turbo
**Authentication:** API Key (Bearer token)

**Error Handling:**
- Catches OpenAI API errors and returns 500 response
- Logs errors to console

---

## Client-Side Integration

### Calling the Chat API

```typescript
const formData = new FormData();
formData.append('prompt', userInput);
formData.append('lastNodeId', previousNodeId);

const response = await fetch('/api/chat', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

### Using Loader Data

```typescript
import { useLoaderData } from 'react-router';

export default function Home() {
  const { nodes, edges } = useLoaderData<typeof loader>();
  // Use nodes and edges for React Flow canvas
}
```

---

## Performance Considerations

- **Database Queries:** O(n) scan of all nodes and edges on each page load
- **OpenAI API:** ~1-3 second response time per request
- **Position Calculation:** Simple linear offset based on node count
- **No Pagination:** All nodes loaded at once (may need optimization for large datasets)

---

## Future API Endpoints (Suggested)

- `PATCH /api/nodes/:id/position` - Update node position after drag/drop
- `DELETE /api/nodes/:id` - Delete a node
- `DELETE /api/edges/:id` - Delete an edge
- `GET /api/nodes/:id` - Get single node details
- `PUT /api/nodes/:id` - Update node label/summary

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing required fields)
- `500` - Server Error (OpenAI API failure, database error)
