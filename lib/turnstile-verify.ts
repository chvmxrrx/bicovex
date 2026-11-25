/**
 * Cloudflare Turnstile, server side.
 * Returns true or false once SECRET_KEY is set, and null while it isn't,
 * so the site keeps working before Turnstile is configured.
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean | null> {
  const secret = process.env.SECRET_KEY;
  if (!secret) return null;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("[contacto] Turnstile rechazó el token:", data["error-codes"]);
    return data.success === true;
  } catch (err) {
    console.error("[contacto] No se pudo contactar a Turnstile:", err);
    return false;
  }
}
