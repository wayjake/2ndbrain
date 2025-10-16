import type { Route } from "./+types/api.nodes.clear";
import { db } from "../db/db.server";
import { nodes } from "../db/schema";

export async function action({ request }: Route.ActionArgs) {
  try {
    // Delete all nodes
    await db.delete(nodes);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error clearing all nodes:", error);
    return Response.json(
      { error: "Failed to clear all nodes" },
      { status: 500 }
    );
  }
}
