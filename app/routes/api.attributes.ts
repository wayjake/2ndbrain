import type { Route } from "./+types/api.attributes";
import { saveAttribute, deleteAttribute } from "../db/utils.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const method = request.method;

  if (method === 'POST') {
    // Create new attribute
    const parentNodeId = formData.get("parentNodeId") as string;
    const key = formData.get("key") as string;
    const value = formData.get("value") as string;
    const description = formData.get("description") as string | null;

    if (!parentNodeId || !key || !value) {
      return Response.json(
        { error: "Parent node ID, key, and value are required" },
        { status: 400 }
      );
    }

    try {
      const attributeId = Date.now().toString();

      await saveAttribute({
        id: attributeId,
        nodeId: parentNodeId,
        key,
        value,
        description: description || null,
        createdAt: Date.now()
      });

      return Response.json({
        success: true,
        attributeId
      });
    } catch (error) {
      console.error("Error creating attribute:", error);
      return Response.json(
        { error: "Failed to create attribute" },
        { status: 500 }
      );
    }
  }

  if (method === 'DELETE') {
    // Delete attribute
    const attributeId = formData.get("attributeId") as string;

    if (!attributeId) {
      return Response.json(
        { error: "Attribute ID is required" },
        { status: 400 }
      );
    }

    try {
      await deleteAttribute(attributeId);

      return Response.json({
        success: true,
        attributeId
      });
    } catch (error) {
      console.error("Error deleting attribute:", error);
      return Response.json(
        { error: "Failed to delete attribute" },
        { status: 500 }
      );
    }
  }

  return Response.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
