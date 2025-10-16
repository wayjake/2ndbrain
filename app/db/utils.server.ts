import { db } from './db.server';
import { nodes, edges, associations, type NewNode, type NewEdge, type NewAssociation } from './schema';
import { eq } from 'drizzle-orm';

export async function saveNode(nodeData: NewNode) {
  return await db.insert(nodes).values(nodeData).returning();
}

export async function saveEdge(edgeData: NewEdge) {
  return await db.insert(edges).values(edgeData).returning();
}

export async function saveAssociation(associationData: NewAssociation) {
  return await db.insert(associations).values(associationData).returning();
}

export async function getAllNodes() {
  return await db.select().from(nodes).orderBy(nodes.createdAt);
}

export async function getAllEdges() {
  return await db.select().from(edges).orderBy(edges.createdAt);
}

export async function getAllAssociations() {
  return await db.select().from(associations).orderBy(associations.createdAt);
}

export async function getNodeById(id: string) {
  const result = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);
  return result[0] || null;
}

export async function updateNodePosition(id: string, x: number, y: number) {
  return await db.update(nodes)
    .set({ positionX: x, positionY: y })
    .where(eq(nodes.id, id));
}

export async function deleteNode(id: string) {
  // Delete associated edges first
  await db.delete(edges).where(eq(edges.source, id));
  await db.delete(edges).where(eq(edges.target, id));

  // Delete associated associations
  await db.delete(associations).where(eq(associations.parentNodeId, id));

  // Then delete the node
  return await db.delete(nodes).where(eq(nodes.id, id));
}

export async function deleteEdge(id: string) {
  return await db.delete(edges).where(eq(edges.id, id));
}

export async function deleteAssociation(id: string) {
  return await db.delete(associations).where(eq(associations.id, id));
}