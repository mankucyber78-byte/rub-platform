import { launchBrowser } from "@/lib/browser/launch";
import type { ScoutResult } from "./types";

const PHONE_RE =
  /(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
const ADDRESS_RE =
  /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|suite|ste|floor|fl)[\w\s,]*/i;

export async function runScout(url: string): Promise<ScoutResult> {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  const start = Date.now();

  try {
    await page.setViewport({ width: 1280, height: 800 });
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    const pageLoadTimeMs = Date.now() - start;
    const html = await page.content();
    const css = await page.evaluate(() => {
      const styles: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules ?? [])) {
            styles.push(rule.cssText);
          }
        } catch {
          /* cross-origin stylesheet */
        }
      }
      for (const el of document.querySelectorAll("style")) {
        styles.push(el.textContent ?? "");
      }
      return styles.join("\n").slice(0, 50000);
    });

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 72,
      fullPage: false,
    });
    const screenshot = `data:image/jpeg;base64,${Buffer.from(screenshotBuffer).toString("base64")}`;

    const meta = await page.evaluate(() => {
      const getMeta = (name: string) =>
        document
          .querySelector(`meta[name="${name}"], meta[property="${name}"]`)
          ?.getAttribute("content") ?? null;

      const imagesWithoutAlt = Array.from(document.images).filter(
        (img) => !img.alt?.trim()
      ).length;

      const links = Array.from(document.querySelectorAll("a[href]")).map(
        (a) => (a as HTMLAnchorElement).href
      );

      const bodyText = document.body?.innerText ?? "";
      const h1 = document.querySelector("h1");

      const colors = new Set<string>();
      document.querySelectorAll("*").forEach((el) => {
        const style = getComputedStyle(el);
        if (style.color && style.color !== "rgb(0, 0, 0)")
          colors.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)")
          colors.add(style.backgroundColor);
      });

      const html = document.documentElement.outerHTML;
      const year = new Date().getFullYear();
      const copyrightCurrent = new RegExp(String(year)).test(bodyText);

      return {
        title: document.title,
        h1Text: h1?.textContent?.trim() ?? "",
        metaDescription: getMeta("description") ?? getMeta("og:description") ?? "",
        hasMetaDescription: !!(
          getMeta("description") || getMeta("og:description")
        ),
        hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
        hasH1: !!h1,
        imagesWithoutAlt,
        links,
        bodyText: bodyText.slice(0, 15000),
        hasGoogleAnalytics:
          html.includes("google-analytics.com") ||
          html.includes("googletagmanager.com") ||
          html.includes("gtag(") ||
          /G-[A-Z0-9]+/.test(html) ||
          /UA-\d+-\d+/.test(html),
        hasSchemaMarkup: !!document.querySelector(
          'script[type="application/ld+json"]'
        ),
        brandColors: Array.from(colors).slice(0, 12),
        copyrightCurrent,
      };
    });

    let brokenLinks = 0;
    const linkSample = meta.links.slice(0, 15);
    await Promise.all(
      linkSample.map(async (link) => {
        try {
          const res = await fetch(link, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });
          if (!res.ok) brokenLinks += 1;
        } catch {
          brokenLinks += 1;
        }
      })
    );

    const hasSsl = url.startsWith("https://") && !!response;
    const phoneVisible = PHONE_RE.test(meta.bodyText);
    const addressVisible = ADDRESS_RE.test(meta.bodyText);

    return {
      url,
      screenshot,
      html: html.slice(0, 80000),
      css,
      hasSsl,
      hasMetaDescription: meta.hasMetaDescription,
      hasMetaViewport: meta.hasMetaViewport,
      hasH1: meta.hasH1,
      imagesWithoutAlt: meta.imagesWithoutAlt,
      brokenLinks,
      phoneVisible,
      addressVisible,
      hasGoogleAnalytics: meta.hasGoogleAnalytics,
      hasSchemaMarkup: meta.hasSchemaMarkup,
      copyrightYearCurrent: meta.copyrightCurrent,
      pageLoadTimeMs,
      title: meta.title,
      h1Text: meta.h1Text,
      metaDescription: meta.metaDescription,
      brandColors: meta.brandColors,
      textContent: meta.bodyText,
    };
  } finally {
    await browser.close();
  }
}
