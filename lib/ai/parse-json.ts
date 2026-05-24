export function parseJsonFromAi<T>(text: string): T {
  const trimmed = text.trim();
  const fenced =
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? trimmed;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  const arrayStart = fenced.indexOf("[");
  const arrayEnd = fenced.lastIndexOf("]");

  let jsonStr = fenced;
  if (start !== -1 && end !== -1 && end > start) {
    jsonStr = fenced.slice(start, end + 1);
  } else if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    jsonStr = fenced.slice(arrayStart, arrayEnd + 1);
  }

  return JSON.parse(jsonStr) as T;
}
