import type { Route } from "./+types/api.nodes.clear";
import { clearAllNodes } from "../db/utils.server";

export async function action({ request }: Route.ActionArgs) {
  try {
    // Delete all nodes and their attributes
    clearAllNodes();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error clearing all nodes:", error);
    return Response.json(
      { error: "Failed to clear all nodes" },
      { status: 500 }
    );
  }
}
