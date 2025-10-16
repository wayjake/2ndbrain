import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const nodes = sqliteTable('nodes', {
  id: text('id').primaryKey(),
  rawInput: text('raw_input').notNull(), // User's original input
  title: text('title').notNull(), // AI-generated title
  body: text('body').notNull(), // AI-generated body/summary
  positionX: real('position_x').notNull().default(0),
  positionY: real('position_y').notNull().default(0),
  nextNodes: text('next_nodes'), // JSON array stored as text
  prevNodes: text('prev_nodes'), // JSON array stored as text
  timestamp: integer('timestamp').notNull(),
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export const edges = sqliteTable('edges', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  target: text('target').notNull(),
  label: text('label'),
  type: text('type').default('default'),
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export const associations = sqliteTable('associations', {
  id: text('id').primaryKey(),
  parentNodeId: text('parent_node_id').notNull(),
  description: text('description').notNull(),
  vectorDirection: real('vector_direction').notNull(), // Angle in degrees (0-360)
  distance: real('distance').notNull(), // Distance from parent in pixels
  prevNodeData: text('prev_node_data'), // JSON of prev node data
  nextNodeData: text('next_node_data'), // JSON of next node data
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Edge = typeof edges.$inferSelect;
export type NewEdge = typeof edges.$inferInsert;
export type Association = typeof associations.$inferSelect;
export type NewAssociation = typeof associations.$inferInsert;