import { NextResponse } from "next/server";
import { draftError, parseDraft } from "@/lib/contact-form";
import { buildRequestEmail } from "@/lib/contact-email";

/**
 * Receives contact requests and forwards them by email through Resend.
 * The destination address only exists in the server environment (CONTACT_TO),
 * so it never reaches the browser.
 *
 * Spam defences, cheapest first:
 *  1. Honeypot: a hidden "website" field only bots fill in.
 *  2. Minimum time: nobody completes four steps in under MIN_ELAPSED_MS.
 *  3. Same-origin check on the Origin header.
 *  4. Full validation with the same rules as the form.
 *  5. Per-IP rate limit. It lives in memory, so it resets when Vercel starts a new
 *     instance; it slows down floods but is not a hard guarantee.
 * Bots caught by 1 and 2 get a fake success so they don't learn to adapt.
 */

const MIN_ELAPSED_MS = 4000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

const ok = () => NextResponse.json({ ok: true });
const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return fail(403, "Solicitud no permitida.");
    } catch {
      return fail(403, "Solicitud no permitida.");
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, "No pudimos leer la solicitud. Recarga la página e intenta de nuevo.");
  }

  if (typeof body.website === "string" && body.website.trim() !== "") return ok();
  if (typeof body.elapsedMs !== "number" || body.elapsedMs < MIN_ELAPSED_MS) return ok();

  const draft = parseDraft(body);
  if (!draft) return fail(400, "Faltan datos en la solicitud. Revisa los pasos e intenta de nuevo.");
  const invalid = draftError(draft);
  if (invalid) return fail(400, invalid.message);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";
  if (rateLimited(ip)) {
    return fail(429, "Recibimos varias solicitudes seguidas desde tu conexión. Espera unos minutos e intenta de nuevo.");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || "BICOVEX <onboarding@resend.dev>";

  const email = buildRequestEmail(draft);

  if (!apiKey || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contacto] Resend no está configurado; solicitud recibida en desarrollo:\n" + email.text);
      return ok();
    }
    console.error("[contacto] Faltan RESEND_API_KEY o CONTACT_TO en el entorno.");
    return fail(500, "El formulario no está disponible en este momento. Intenta de nuevo más tarde.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: email.subject,
      text: email.text,
      html: email.html,
      ...(email.replyTo ? { reply_to: email.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[contacto] Resend respondió", res.status, await res.text().catch(() => ""));
    return fail(502, "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.");
  }

  return ok();
}
