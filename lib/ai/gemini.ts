import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseJsonFromAi } from "./parse-json";

function getModel(model = "gemini-2.0-flash") {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("AI service is not configured.");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model });
}

export async function geminiJson<T>(
  system: string,
  user: string,
  model?: string
): Promise<T> {
  const m = getModel(model);
  const result = await m.generateContent(
    `${system}\n\nRespond with valid JSON only.\n\n${user}`
  );
  const text = result.response.text();
  if (!text) throw new Error("AI returned an empty response.");
  return parseJsonFromAi<T>(text);
}
