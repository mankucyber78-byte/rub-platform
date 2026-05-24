export const RUB_URL_KEY = "rub-website-url";
export const RUB_ANALYSIS_KEY = "rub-analysis-result";
export const RUB_USER_KEY = "rub-user";
export const RUB_PENDING_URL_KEY = "rub-pending-url";
export const RUB_VERIFIED_KEY = "rub-verified";
export const RUB_CONNECTED_KEY = "rub-connected";

export type RubUser = {
  email: string;
  name: string;
};

export function setStoredUrl(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_URL_KEY, url.trim());
}

export function getStoredUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(RUB_URL_KEY) ?? "";
}

export function setPendingUrl(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_PENDING_URL_KEY, url.trim());
}

export function getPendingUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(RUB_PENDING_URL_KEY) ?? "";
}

export function promotePendingUrl() {
  if (typeof window === "undefined") return;
  const pending = getPendingUrl();
  if (pending) {
    setStoredUrl(pending);
    localStorage.removeItem(RUB_PENDING_URL_KEY);
  }
}

export function getStoredUser(): RubUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(RUB_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RubUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: RubUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RUB_USER_KEY);
}

export function setVerified(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_VERIFIED_KEY, value ? "1" : "0");
}

export function isVerified(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(RUB_VERIFIED_KEY) === "1";
}

export function setConnected(value: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_CONNECTED_KEY, value ? "1" : "0");
}

export function isConnected(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(RUB_CONNECTED_KEY) === "1";
}

export function emailMatchesWebsite(email: string, websiteUrl: string): boolean {
  const domain = displayUrl(websiteUrl).toLowerCase();
  const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain || !emailDomain) return false;
  return emailDomain === domain || emailDomain.endsWith(`.${domain}`);
}

export function setStoredAnalysis<T>(data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RUB_ANALYSIS_KEY, JSON.stringify(data));
}

export function getStoredAnalysis<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(RUB_ANALYSIS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
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
