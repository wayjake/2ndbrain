import { db } from './db.server';
import { nodes, attributes, type NewNode, type NewAttribute } from './schema';
import { eq } from 'drizzle-orm';

export async function saveNode(nodeData: NewNode) {
  return await db.insert(nodes).values(nodeData).returning();
}

// Insert a node directly after `prevId`, splicing it in front of whatever
// followed so the rest of the chain stays connected. Runs in one transaction.
// Returns false if `prevId` no longer exists.
export function insertNodeAfter(
  nodeData: NewNode,
  prevId: string | null,
  nodeAttributes: NewAttribute[] = []
) {
  return db.transaction((tx) => {
    let nextId: string | null = null;

    if (prevId) {
      const prev = tx.select().from(nodes).where(eq(nodes.id, prevId)).get();
      if (!prev) return false;
      nextId = prev.nextNode;
    }

    tx.insert(nodes).values({ ...nodeData, prevNode: prevId, nextNode: nextId }).run();

    if (prevId) {
      tx.update(nodes).set({ nextNode: nodeData.id }).where(eq(nodes.id, prevId)).run();
    }
    if (nextId) {
      tx.update(nodes).set({ prevNode: nodeData.id }).where(eq(nodes.id, nextId)).run();
    }

    for (const attr of nodeAttributes) {
      tx.insert(attributes).values(attr).run();
    }

    return true;
  });
}

export async function getAllNodes() {
  return await db.select().from(nodes).orderBy(nodes.timestamp);
}

export function clearAllNodes() {
  db.transaction((tx) => {
    tx.delete(attributes).run();
    tx.delete(nodes).run();
  });
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

  // Delete associated attributes
  await db.delete(attributes).where(eq(attributes.nodeId, id));

  // Finally, delete the node
  return await db.delete(nodes).where(eq(nodes.id, id));
}

// Attribute operations
export async function getAllAttributes() {
  return await db.select().from(attributes).orderBy(attributes.createdAt);
}

export async function getAttributesByNodeId(nodeId: string) {
  return await db.select().from(attributes).where(eq(attributes.nodeId, nodeId));
}

export async function saveAttribute(attributeData: NewAttribute) {
  return await db.insert(attributes).values(attributeData).returning();
}

export async function updateAttribute(id: string, updates: Partial<NewAttribute>) {
  return await db.update(attributes)
    .set(updates)
    .where(eq(attributes.id, id))
    .returning();
}

export async function deleteAttribute(id: string) {
  return await db.delete(attributes).where(eq(attributes.id, id));
}