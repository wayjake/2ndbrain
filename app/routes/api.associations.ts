import type { Route } from "./+types/api.associations";
import { saveAssociation, saveEdge } from "../db/utils.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const parentNodeId = formData.get("parentNodeId") as string;
  const parentNodeX = Number(formData.get("parentNodeX"));
  const parentNodeY = Number(formData.get("parentNodeY"));
  const description = formData.get("description") as string;
  const vectorDirection = Number(formData.get("vectorDirection"));
  const distance = Number(formData.get("distance"));

  if (!parentNodeId || !description) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const associationId = `assoc-${Date.now()}`;

    // Calculate position based on vector and distance
    const angleRad = (vectorDirection * Math.PI) / 180;
    const positionX = parentNodeX + Math.cos(angleRad) * distance;
    const positionY = parentNodeY + Math.sin(angleRad) * distance;

    // Save association to database
    await saveAssociation({
      id: associationId,
      parentNodeId,
      description,
      vectorDirection,
      distance,
      prevNodeData: null,
      nextNodeData: null,
    });

    // Create edge from parent to association (without arrow marker)
    await saveEdge({
      id: `${parentNodeId}-${associationId}`,
      source: parentNodeId,
      target: associationId,
      label: '',
      type: 'association', // Special type for association edges
    });

    return Response.json({
      id: associationId,
      parentNodeId,
      description,
      vectorDirection,
      distance,
      position: {
        x: positionX,
        y: positionY
      },
      edgeId: `${parentNodeId}-${associationId}`,
    });
  } catch (error) {
    console.error("Error creating association:", error);
    return Response.json(
      { error: "Failed to create association" },
      { status: 500 }
    );
  }
}
