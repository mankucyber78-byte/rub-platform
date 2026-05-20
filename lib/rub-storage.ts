export const RUB_URL_KEY = "rub-website-url";

export function setStoredUrl(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_URL_KEY, url.trim());
}

export function getStoredUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(RUB_URL_KEY) ?? "";
}

export function displayUrl(url: string): string {
  if (!url) return "yourwebsite.com";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
