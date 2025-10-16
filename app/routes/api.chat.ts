import type { Route } from "./+types/api.chat";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { saveNode, saveEdge, getAllNodes } from "../db/utils.server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const IdeaResponseSchema = z.object({
  title: z.string().describe("A short, catchy title for the idea (3-6 words)"),
  body: z.string().describe("A concise description of the idea (2-3 sentences)"),
  nextNodes: z.array(z.string()).describe("Ideas that could logically follow or build upon this one"),
  prevNodes: z.array(z.string()).describe("Ideas that could logically precede or lead to this one"),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const lastNodeId = formData.get("lastNodeId") as string | null;

  if (!prompt) {
    return Response.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const response = await openai.responses.parse({
      model: "gpt-5-mini-2025-08-07",
      input: [
        {
          role: "system",
          content: `You are a helpful assistant that helps users organize and connect their ideas.
          When a user provides an idea, create:
          1. A short, catchy title (3-6 words) that captures the essence
          2. A concise description of the idea (2-3 sentences) that expands on it
          3. Suggestions for NEXT nodes - ideas that could logically follow or build upon this one
          4. Suggestions for PREV nodes - ideas that could logically precede or lead to this one`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      text: {
        format: zodTextFormat(IdeaResponseSchema, "idea_response"),
      },
    });

    const responseData = response.output_parsed;

    const nodeId = Date.now().toString();
    const timestamp = Date.now();

    // Get existing nodes to calculate position
    const existingNodes = await getAllNodes();
    const nodeCount = existingNodes.length;

    // Save node to database
    await saveNode({
      id: nodeId,
      rawInput: prompt,
      title: responseData.title,
      body: responseData.body,
      positionX: 250 + (nodeCount * 50),
      positionY: 250 + (nodeCount * 30),
      nextNodes: JSON.stringify(responseData.nextNodes || []),
      prevNodes: JSON.stringify(responseData.prevNodes || []),
      timestamp: timestamp
    });
    
    // If there's a previous node, create an edge
    let edgeCreated = false;
    if (lastNodeId) {
      await saveEdge({
        id: `${lastNodeId}-${nodeId}`,
        source: lastNodeId,
        target: nodeId,
        label: 'follows',
        type: 'default'
      });
      edgeCreated = true;
    }

    return Response.json({
      id: nodeId,
      rawInput: prompt,
      title: responseData.title,
      body: responseData.body,
      nextNodes: responseData.nextNodes,
      prevNodes: responseData.prevNodes,
      timestamp,
      position: {
        x: 250 + (nodeCount * 50),
        y: 250 + (nodeCount * 30)
      },
      edgeCreated
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}