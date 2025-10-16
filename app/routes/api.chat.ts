import type { Route } from "./+types/api.chat";
import OpenAI from "openai";
import { z } from "zod";
import { saveNode } from "../db/utils.server";
import { data } from "react-router";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const IdeaResponse = z.object({
  title: z.string().describe("A short, catchy title for the idea (1-7 words)"),
  body: z.string().describe("A concise description of the idea (1-7 sentences)"),
});

type Idea = {
  title: string;
  body: string;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const lastNodeId = formData.get("lastNodeId") as string | null;

  if (!prompt) {
    return data({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const response = await openai.responses.parse({
      model: "gpt-5-mini-2025-08-07",
      input: [
        {
          role: "system",
          content: `You are a decision maker that helps users organize and connect their ideas.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      
      text: {
        format: {
          name: "idea_response",
          strict: true,
          type: "json_schema",
          schema: z.toJSONSchema(IdeaResponse)
        }
      },
    });

    const responseData: Idea | undefined = response.output_parsed as unknown as Idea;

    if (!responseData || !responseData.title || !responseData.body) {
      return data({ error: "Failed to process request" }, { status: 500 });
    }

    const nodeId = Date.now().toString();
    const timestamp = Date.now();

    console.log('[API CHAT] Creating node with:', {
      nodeId,
      lastNodeId,
      willSetPrevNode: !!lastNodeId
    });

    // Save node to database (position will be calculated on frontend)
    await saveNode({
      id: nodeId,
      rawInput: prompt,
      title: responseData.title,
      body: responseData.body,
      nextNode: null, // Will be set when nodes are connected
      prevNode: lastNodeId || null, // Set previous node if provided
      timestamp: timestamp
    });

    // If there's a previous node, update it to point to this new node
    if (lastNodeId) {
      const { db } = await import("../db/db.server");
      const { nodes } = await import("../db/schema");
      const { eq } = await import("drizzle-orm");

      await db.update(nodes)
        .set({ nextNode: nodeId })
        .where(eq(nodes.id, lastNodeId));
    }

    return data({
      success: true,
      id: nodeId,
      title: responseData.title,
      body: responseData.body,
      nextNode: null,
      prevNode: lastNodeId,
      timestamp
    });
  } catch (error) {
    return data(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}