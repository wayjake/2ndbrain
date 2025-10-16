import type { Route } from "./+types/api.nodes.connect";
import { data } from "react-router";
import { db } from "../db/db.server";
import { nodes } from "../db/schema";
import { eq } from "drizzle-orm";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { sourceId, targetId } = body;

    if (!sourceId || !targetId) {
      return data({ error: "Source and target IDs are required" }, { status: 400 });
    }

    // Get both nodes to validate
    const [sourceNode] = await db.select().from(nodes).where(eq(nodes.id, sourceId));
    const [targetNode] = await db.select().from(nodes).where(eq(nodes.id, targetId));

    if (!sourceNode || !targetNode) {
      return data({ error: "Node not found" }, { status: 404 });
    }

    // Check if source already has a nextNode
    if (sourceNode.nextNode) {
      return data({ error: "Source node already has a next connection" }, { status: 400 });
    }

    // Check if target already has a prevNode
    if (targetNode.prevNode) {
      return data({ error: "Target node already has a previous connection" }, { status: 400 });
    }

    // Update both nodes
    await db.update(nodes)
      .set({ nextNode: targetId })
      .where(eq(nodes.id, sourceId));

    await db.update(nodes)
      .set({ prevNode: sourceId })
      .where(eq(nodes.id, targetId));

    return data({ success: true, sourceId, targetId });
  } catch (error) {
    console.error("Error connecting nodes:", error);
    return data({ error: "Failed to connect nodes" }, { status: 500 });
  }
}
