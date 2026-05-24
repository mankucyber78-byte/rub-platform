import OpenAI from "openai";
import { parseJsonFromAi } from "./parse-json";

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("AI service is not configured.");
  return new OpenAI({ apiKey: key });
}

export async function openaiJson<T>(
  system: string,
  user: string,
  model = "gpt-4o"
): Promise<T> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("AI returned an empty response.");
  return parseJsonFromAi<T>(text);
}

export async function openaiVisionJson<T>(
  system: string,
  userText: string,
  images: { base64: string; mimeType: string }[],
  model = "gpt-4o"
): Promise<T> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          ...images.map((img) => ({
            type: "image_url" as const,
            image_url: {
              url: `data:${img.mimeType};base64,${img.base64}`,
            },
          })),
        ],
      },
    ],
  });
  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("AI returned an empty response.");
  return parseJsonFromAi<T>(text);
}
