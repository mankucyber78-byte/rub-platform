import { orchestrateAnalysis } from "@/lib/agents/orchestrator";
import type { AnalyzeRequest } from "@/lib/agents/types";
import { normalizeUrl } from "@/lib/rub-storage";
import { createSSEStream, sseResponse } from "@/lib/sse/stream";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  let body: AnalyzeRequest;

  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return Response.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }

  const url = normalizeUrl(body.url ?? "");
  if (!url) {
    return Response.json(
      { error: "Please enter a valid website URL." },
      { status: 400 }
    );
  }

  const stream = createSSEStream(async (send) => {
    await orchestrateAnalysis({ ...body, url }, send);
  });

  return sseResponse(stream);
}
