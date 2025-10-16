# Data Models & Database Schema

**Project:** idea-flow
**Database:** SQLite
**ORM:** Drizzle ORM v0.44.6
**Driver:** better-sqlite3 v12.4.1

---

## Overview

The application uses a graph-based data model to store nodes and edges, representing an idea flow visualization system. The database consists of 2 main tables with a one-to-many relationship structure.

---

## Tables

### `nodes`

Stores individual nodes in the idea flow graph.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | TEXT | PRIMARY KEY | - | Unique identifier for the node |
| `label` | TEXT | NOT NULL | - | Display label/title of the node |
| `summary` | TEXT | NULLABLE | - | Optional summary or description |
| `position_x` | REAL | NOT NULL | 0 | X-coordinate for canvas positioning |
| `position_y` | REAL | NOT NULL | 0 | Y-coordinate for canvas positioning |
| `next_nodes` | TEXT | NULLABLE | - | JSON array of next node IDs (stored as text) |
| `prev_nodes` | TEXT | NULLABLE | - | JSON array of previous node IDs (stored as text) |
| `timestamp` | INTEGER | NOT NULL | - | Custom timestamp value |
| `created_at` | INTEGER | NOT NULL | `Date.now()` | Creation timestamp in milliseconds |

**TypeScript Types:**
```typescript
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
```

---

### `edges`

Stores connections between nodes in the flow graph.

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| `id` | TEXT | PRIMARY KEY | - | Unique identifier for the edge |
| `source` | TEXT | NOT NULL | - | Source node ID |
| `target` | TEXT | NOT NULL | - | Target node ID |
| `label` | TEXT | NULLABLE | - | Optional edge label |
| `type` | TEXT | NULLABLE | 'default' | Edge type/style |
| `created_at` | INTEGER | NOT NULL | `Date.now()` | Creation timestamp in milliseconds |

**TypeScript Types:**
```typescript
export type Edge = typeof edges.$inferSelect;
export type NewEdge = typeof edges.$inferInsert;
```

---

## Relationships

```
nodes (1) ──< edges (N) [source]
nodes (1) ──< edges (N) [target]
```

- Each edge has one source node and one target node
- Nodes can have multiple incoming and outgoing edges
- `next_nodes` and `prev_nodes` fields store denormalized relationship data as JSON arrays

---

## Database Operations

**Location:** `app/db/utils.server.ts`

### Node Operations

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `saveNode()` | `nodeData: NewNode` | `Promise<Node[]>` | Insert a new node |
| `getAllNodes()` | - | `Promise<Node[]>` | Fetch all nodes ordered by creation |
| `updateNodePosition()` | `id: string, x: number, y: number` | `Promise<...>` | Update node canvas position |
| `deleteNode()` | `id: string` | `Promise<...>` | Delete node and cascade delete associated edges |

### Edge Operations

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `saveEdge()` | `edgeData: NewEdge` | `Promise<Edge[]>` | Insert a new edge |
| `getAllEdges()` | - | `Promise<Edge[]>` | Fetch all edges ordered by creation |
| `deleteEdge()` | `id: string` | `Promise<...>` | Delete a single edge |

---

## Database Configuration

**Config File:** `drizzle.config.ts`

```typescript
{
  schema: './app/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./local.db'
  }
}
```

**Database Location:**
- Production: `process.env.DATABASE_URL`
- Development: `./local.db`

---

## Schema Management

**Commands:**
- `npm run db:generate` - Generate migration files from schema
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio GUI

**Initialization:**
Tables are created automatically on application startup via raw SQL in `db.server.ts` using `sqlite.exec()`.

---

## Data Flow Pattern

1. **Create Node** → Insert into `nodes` table → Return node data
2. **Create Edge** → Insert into `edges` table with source/target IDs
3. **Update Position** → Update `position_x` and `position_y` for drag/drop canvas interactions
4. **Delete Node** → Cascade delete all edges where node is source or target → Delete node record
5. **Delete Edge** → Remove edge connection

---

## JSON Field Storage

The `next_nodes` and `prev_nodes` fields store array data as JSON strings in SQLite TEXT fields. This denormalization strategy allows quick access to node relationships without joining the edges table.

**Example:**
```json
{
  "next_nodes": "[\"node-abc\", \"node-def\"]",
  "prev_nodes": "[\"node-xyz\"]"
}
```

---

## Notes

- **No foreign key constraints** are enforced at the database level
- **Cascade deletion** is handled at the application level in `deleteNode()`
- **Timestamps** are stored as integer milliseconds since epoch
- **Schema is version-controlled** in TypeScript using Drizzle ORM's type-safe schema definition
