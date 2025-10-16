import type { Route } from "./+types/api.nodes.delete";
import { deleteNode } from "../db/utils.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const nodeId = formData.get("nodeId") as string;

  if (!nodeId) {
    return Response.json({ error: "Node ID is required" }, { status: 400 });
  }

  try {
    // Delete the node and all associated edges/associations
    await deleteNode(nodeId);

    return Response.json({ success: true, nodeId });
  } catch (error) {
    console.error("Error deleting node:", error);
    return Response.json(
      { error: "Failed to delete node" },
      { status: 500 }
    );
  }
}
