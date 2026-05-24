import Anthropic from "@anthropic-ai/sdk";
import { parseJsonFromAi } from "./parse-json";

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("AI service is not configured.");
  return new Anthropic({ apiKey: key });
}

export async function claudeJson<T>(
  system: string,
  user: string,
  model = "claude-sonnet-4-20250514"
): Promise<T> {
  const client = getClient();
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const block = response.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("AI returned an empty response.");
  }
  return parseJsonFromAi<T>(block.text);
}

export async function claudeText(
  system: string,
  user: string,
  model = "claude-sonnet-4-20250514"
): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = response.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("AI returned an empty response.");
  }
  return block.text.trim();
}
