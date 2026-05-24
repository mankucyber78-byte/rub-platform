import type { AgentName, AnalyzeRequest, AnalysisResult, SSEEvent } from "./types";
import { runScout } from "./scout";
import { runEinstein } from "./einstein";
import { runCritic } from "./critic";
import { runSeoGuy } from "./seo-guy";
import { runWriter } from "./writer";
import { runPicasso } from "./picasso";
import { runAnsel } from "./ansel";
import { runSpielberg } from "./spielberg";
import { runRex } from "./rex";
import { runPublisher } from "./publisher";
import {
  computeImprovedScores,
  computeRevenueEstimate,
  computeScores,
} from "./scores";

async function runAgent<T>(
  name: AgentName,
  message: string,
  send: (event: SSEEvent) => void,
  fn: () => Promise<T>
): Promise<T> {
  send({ type: "agent_start", agent: name, message });
  send({ type: "agent_progress", agent: name, progress: 25 });
  try {
    const result = await fn();
    send({ type: "agent_progress", agent: name, progress: 100 });
    send({ type: "agent_complete", agent: name, message: `${name} complete` });
    return result;
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : "Agent failed unexpectedly";
    send({ type: "agent_error", agent: name, message: msg });
    throw error;
  }
}

export async function orchestrateAnalysis(
  request: AnalyzeRequest,
  send: (event: SSEEvent) => void
): Promise<AnalysisResult> {
  const url = request.url;

  const scout = await runAgent("scout", "Scanning your website...", send, () =>
    runScout(url)
  );

  const [einstein, critic, seoGuy] = await Promise.all([
    runAgent("einstein", "Understanding your business...", send, () =>
      runEinstein(scout)
    ),
    runAgent("critic", "Grading design quality...", send, () =>
      runCritic(scout)
    ),
    runAgent("seoGuy", "Checking Google ranking...", send, () =>
      runSeoGuy(scout)
    ),
  ]);

  const [writer, picasso] = await Promise.all([
    runAgent("writer", "Rewriting your content...", send, () =>
      runWriter(scout, einstein)
    ),
    runAgent("picasso", "Generating unique design...", send, () =>
      runPicasso(scout, einstein, request.photos)
    ),
  ]);

  const [ansel, spielberg] = await Promise.all([
    runAgent("ansel", "Enhancing photos...", send, () =>
      runAnsel(request.photos)
    ),
    runAgent("spielberg", "Optimizing videos...", send, () =>
      runSpielberg(request.videos)
    ),
  ]);

  const rex = await runAgent("rex", "Quality checking...", send, () =>
    runRex({
      profile: einstein,
      critic,
      seo: seoGuy,
      writer,
      design: picasso,
    })
  );

  const publisher = await runAgent(
    "publisher",
    "Generating production CSS...",
    send,
    () => runPublisher(picasso, writer, einstein)
  );

  const scores = computeScores(scout, critic, seoGuy);
  const improvedScores = computeImprovedScores(scores);
  const revenueEstimate = computeRevenueEstimate(scores);

  const result: AnalysisResult = {
    url,
    completedAt: new Date().toISOString(),
    scout,
    einstein,
    critic,
    seoGuy,
    writer,
    picasso,
    ansel,
    spielberg,
    rex,
    publisher,
    scores,
    improvedScores,
    revenueEstimate,
  };

  send({ type: "complete", result });
  return result;
}
