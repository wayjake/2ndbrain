import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const nodes = sqliteTable('nodes', {
  id: text('id').primaryKey(),
  rawInput: text('raw_input').notNull(), // User's original input
  title: text('title').notNull(), // AI-generated title
  body: text('body').notNull(), // AI-generated body/summary
  nextNode: text('next_node'), // ID of the next node (0-to-1 relationship)
  prevNode: text('prev_node'), // ID of the previous node (0-to-1 relationship)
  timestamp: integer('timestamp').notNull(),
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export const attributes = sqliteTable('attributes', {
  id: text('id').primaryKey(),
  nodeId: text('node_id').notNull(), // Parent idea node
  key: text('key').notNull(), // Attribute key/name
  value: text('value').notNull(), // Attribute value
  description: text('description'), // Optional description (not shown in UI)
  createdAt: integer('created_at').notNull().default(Date.now()),
});

export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;