import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 30;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConnectRequest {
  url: string;
  username: string;
  password: string;
  userId?: string;
}

interface WordPressUserResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface WordPressInfoResponse {
  name: string;
  gmt_offset?: number;
  timezone_string?: string;
  generator?: string;
}

// ─── Encryption helpers (AES-256-GCM) ────────────────────────────────────────
// Key must be 32-byte hex string in ENCRYPTION_KEY env var.
// Falls back to a deterministic dev key if not set (never use in production).

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey && envKey.length === 64) {
    return Buffer.from(envKey, "hex");
  }
  // Dev fallback — NOT secure for production
  return Buffer.from("0".repeat(64), "hex");
}

export function encryptPassword(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv(hex):tag(hex):ciphertext(hex)
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPassword(ciphertext: string): string {
  const [ivHex, tagHex, encHex] = ciphertext.split(":");
  if (!ivHex || !tagHex || !encHex) throw new Error("Invalid ciphertext format");
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString("utf8") + decipher.final("utf8");
}

// ─── Supabase helper (optional — silently skipped if not configured) ──────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function storeConnection(data: {
  userId: string;
  websiteUrl: string;
  username: string;
  encryptedPassword: string;
  websiteTitle: string;
  wordpressVersion: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return; // Supabase not configured yet — skip silently

  const { error } = await supabase.from("wp_connections").upsert(
    {
      user_id: data.userId,
      website_url: data.websiteUrl,
      username: data.username,
      encrypted_password: data.encryptedPassword,
      website_title: data.websiteTitle,
      wordpress_version: data.wordpressVersion,
      is_connected: true,
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,website_url" }
  );

  if (error) {
    console.error("[connect] Supabase upsert error:", error.message);
    // Don't throw — let the flow continue even if DB write fails
  }
}

// ─── WordPress connection tester ──────────────────────────────────────────────

async function testWordPressConnection(
  siteUrl: string,
  username: string,
  password: string
): Promise<{
  ok: boolean;
  status?: number;
  websiteTitle?: string;
  wordpressVersion?: string;
  friendlyError?: string;
}> {
  const base = siteUrl.replace(/\/$/, "");
  const token = Buffer.from(`${username}:${password}`).toString("base64");
  const headers = {
    Authorization: `Basic ${token}`,
    "User-Agent": "RUB-Platform/1.0",
    Accept: "application/json",
  };

  // Test 1 — authenticate as current user
  let userRes: Response;
  try {
    userRes = await fetch(`${base}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort") || msg.includes("ETIMEDOUT")) {
      return {
        ok: false,
        friendlyError:
          "Could not reach your website. Please check the URL is correct and your site is online.",
      };
    }
    if (msg.includes("ENOTFOUND") || msg.includes("getaddrinfo")) {
      return {
        ok: false,
        friendlyError:
          "Your website domain could not be found. Please double-check the URL.",
      };
    }
    return {
      ok: false,
      friendlyError:
        "Could not connect to your website. Please check the URL and try again.",
    };
  }

  if (userRes.status === 401) {
    return {
      ok: false,
      status: 401,
      friendlyError:
        "Password is incorrect. Please check your Application Password and try again.",
    };
  }

  if (userRes.status === 403) {
    return {
      ok: false,
      status: 403,
      friendlyError:
        "Access denied. Make sure your WordPress user has Administrator privileges.",
    };
  }

  if (userRes.status === 404) {
    return {
      ok: false,
      status: 404,
      friendlyError:
        "Could not find WordPress on this URL. Make sure you entered the correct website address.",
    };
  }

  if (!userRes.ok) {
    return {
      ok: false,
      status: userRes.status,
      friendlyError: `WordPress returned an unexpected response (${userRes.status}). Please try again.`,
    };
  }

  // Verify we actually got a valid WP user back
  let _user: WordPressUserResponse | null = null;
  try {
    _user = (await userRes.json()) as WordPressUserResponse;
    if (!_user?.id) throw new Error("No user id in response");
  } catch {
    return {
      ok: false,
      friendlyError:
        "WordPress connected but returned an unexpected response. Please try again.",
    };
  }

  // Test 2 — fetch site info for title and version
  let siteTitle = base;
  let wpVersion = "unknown";
  try {
    const infoRes = await fetch(`${base}/wp-json`, {
      headers: { "User-Agent": "RUB-Platform/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (infoRes.ok) {
      const info = (await infoRes.json()) as WordPressInfoResponse;
      siteTitle = info.name ?? base;
      // Generator looks like "https://wordpress.org/?v=6.5.3"
      const match = /v=([\d.]+)/.exec(info.generator ?? "");
      if (match?.[1]) wpVersion = match[1];
    }
  } catch {
    // Non-fatal — title & version are nice-to-have
  }

  return { ok: true, websiteTitle: siteTitle, wordpressVersion: wpVersion };
}

// ─── Input validation ─────────────────────────────────────────────────────────

function normalizeUrl(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t.replace(/\/$/, "");
  return `https://${t}`.replace(/\/$/, "");
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  // Parse body
  let body: ConnectRequest;
  try {
    body = (await request.json()) as ConnectRequest;
  } catch {
    return Response.json(
      { success: false, error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }

  // Validate inputs
  const url = normalizeUrl(body.url ?? "");
  const username = (body.username ?? "").trim();
  const password = (body.password ?? "").trim();

  if (!url || !isValidUrl(url)) {
    return Response.json(
      { success: false, error: "Please enter a valid website URL." },
      { status: 400 }
    );
  }

  if (!username) {
    return Response.json(
      { success: false, error: "Please enter your WordPress username." },
      { status: 400 }
    );
  }

  if (!password) {
    return Response.json(
      { success: false, error: "Please enter your Application Password." },
      { status: 400 }
    );
  }

  // Test the WordPress connection
  const result = await testWordPressConnection(url, username, password);

  if (!result.ok) {
    return Response.json(
      { success: false, error: result.friendlyError },
      { status: result.status === 401 || result.status === 403 ? 401 : 400 }
    );
  }

  // Store credentials (Supabase + encrypted password)
  const encryptedPassword = encryptPassword(password);
  const userId = body.userId ?? `anon-${Date.now()}`;

  await storeConnection({
    userId,
    websiteUrl: url,
    username,
    encryptedPassword,
    websiteTitle: result.websiteTitle ?? url,
    wordpressVersion: result.wordpressVersion ?? "unknown",
  });

  return Response.json({
    success: true,
    message: "Connected successfully",
    websiteTitle: result.websiteTitle,
    wordpressVersion: result.wordpressVersion,
  });
}
