import type { Route } from "./+types/api.chat";
import OpenAI from "openai";
import { z } from "zod";
import { insertNodeAfter } from "../db/utils.server";
import { data } from "react-router";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ConsciousScale = z.object({
  value: z.number().min(0).max(1000).describe("A numeric value from 0 to 1000 representing the conscious scale rating"),
  level: z.string().describe("A one or two word code representing the emotional/conscious level (e.g., love, joy, anger)"),
  description: z.string().describe("A short description explaining how this rating was received")
});

const IdeaResponse = z.object({
  title: z.string().describe("A short, catchy title for the idea (1-7 words)"),
  body: z.string().describe("A concise description of the idea (1-7 sentences)"),
  consciousScale: ConsciousScale.describe("The conscious scale rating for this idea based on David R. Hawkins’ Scale of Consciousness")
});

type Idea = {
  title: string;
  body: string;
  consciousScale: {
    value: number;
    level: string;
    description: string;
  };
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
          content: `You are a decision maker that helps users organize and connect their ideas. 
                    You will rate this user's thought or ideas conscious scale based on David R. Hawkins’ Scale of Consciousness.
                    `
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

    if (!responseData || !responseData.title || !responseData.body || !responseData.consciousScale) {
      return data({ error: "Failed to process request" }, { status: 500 });
    }

    const nodeId = Date.now().toString();
    const timestamp = Date.now();

    console.log('[API CHAT] Creating node with:', {
      nodeId,
      lastNodeId,
      willSetPrevNode: !!lastNodeId
    });

    // Save node and its consciousScale attribute, splicing the node into the
    // chain after the selected node (position will be calculated on frontend)
    const inserted = insertNodeAfter(
      {
        id: nodeId,
        rawInput: prompt,
        title: responseData.title,
        body: responseData.body,
        timestamp: timestamp
      },
      lastNodeId || null,
      [{
        id: `${nodeId}-consciousScale`,
        nodeId: nodeId,
        key: "consciousScale",
        value: `${responseData.consciousScale.level} (${responseData.consciousScale.value})`,
        description: responseData.consciousScale.description,
        createdAt: timestamp
      }]
    );

    if (!inserted) {
      return data({ error: "The selected idea no longer exists" }, { status: 404 });
    }

    return data({
      success: true,
      id: nodeId,
      title: responseData.title,
      body: responseData.body,
      prevNode: lastNodeId,
      timestamp
    });
  } catch (error) {
    console.error("Error creating idea:", error);
    return data(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}