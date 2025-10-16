import { db } from './db.server';
import { nodes, type NewNode } from './schema';
import { eq } from 'drizzle-orm';

export async function saveNode(nodeData: NewNode) {
  return await db.insert(nodes).values(nodeData).returning();
}

export async function getAllNodes() {
  return await db.select().from(nodes).orderBy(nodes.createdAt);
}

export async function getNodeById(id: string) {
  const result = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);
  return result[0] || null;
}

export async function deleteNode(id: string) {
  // First, get the node to find its prev/next relationships
  const nodeToDelete = await getNodeById(id);

  if (!nodeToDelete) {
    return; // Node doesn't exist
  }

  // Update neighboring nodes to maintain the chain
  if (nodeToDelete.prevNode) {
    // Update the previous node's nextNode to point to this node's nextNode
    await db.update(nodes)
      .set({ nextNode: nodeToDelete.nextNode })
      .where(eq(nodes.id, nodeToDelete.prevNode));
  }

  if (nodeToDelete.nextNode) {
    // Update the next node's prevNode to point to this node's prevNode
    await db.update(nodes)
      .set({ prevNode: nodeToDelete.prevNode })
      .where(eq(nodes.id, nodeToDelete.nextNode));
  }

  // Finally, delete the node
  return await db.delete(nodes).where(eq(nodes.id, id));
}