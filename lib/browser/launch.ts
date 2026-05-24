import type { Browser } from "puppeteer-core";

export async function launchBrowser(): Promise<Browser> {
  const isServerless =
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.NETLIFY ||
    !!process.env.VERCEL;

  if (isServerless) {
    const chromium = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }) as Promise<Browser>;
}
