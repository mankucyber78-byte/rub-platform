import type { SSEEvent } from "@/lib/agents/types";

export async function consumeAnalyzeStream(
  url: string,
  onEvent: (event: SSEEvent) => void,
  signal?: AbortSignal
) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ??
        "Something went wrong during analysis."
    );
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Unable to read analysis stream.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6)) as SSEEvent;
        onEvent(event);
      } catch {
        /* ignore malformed chunks */
      }
    }
  }
}
