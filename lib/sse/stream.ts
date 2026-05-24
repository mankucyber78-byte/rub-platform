import type { SSEEvent } from "@/lib/agents/types";

export function createSSEStream(
  handler: (send: (event: SSEEvent) => void) => Promise<void>
) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      try {
        await handler(send);
      } catch (error) {
        const message =
          error instanceof Error && error.message.includes("configured")
            ? "Our AI services are temporarily unavailable. Please try again shortly."
            : "Something went wrong during analysis. Your website is safe — please try again.";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });
}

export function sseResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
