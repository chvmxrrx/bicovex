import { services } from "@/content/services";
import { channelLabel, contactValue, type ContactDraft } from "@/lib/contact-form";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Builds the notification email BICOVEX receives for a new request. */
export function buildRequestEmail(d: ContactDraft) {
  const serviceNames = d.services.map((i) => services[i].name);
  const who = d.company ? `${d.name} (${d.company})` : d.name;

  const rows: [string, string][] = [
    ["Servicios", serviceNames.join(", ")],
    ["Nombre", d.name],
    ["Empresa", d.company || "No indicada"],
    ["Prefiere", channelLabel(d.channel)],
    ["Contacto", contactValue(d)],
    ["Detalles", d.details || "Sin detalles"],
  ];

  const subject = `Nueva solicitud: ${serviceNames.join(", ")} · ${who}`;

  const text = [
    "Nueva solicitud desde bicovex",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#F5F7FA;font-family:Arial,Helvetica,sans-serif;color:#0B0F14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E3E7EC;border-radius:16px">
<tr><td style="padding:28px 28px 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#4B5563">Nueva solicitud</td></tr>
<tr><td style="padding:0 28px 20px;font-size:24px;font-weight:bold">${escapeHtml(who)}</td></tr>
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:12px 28px;border-top:1px solid #E3E7EC"><div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#4B5563">${k}</div><div style="margin-top:4px;font-size:15px;line-height:1.5;white-space:pre-wrap">${escapeHtml(v)}</div></td></tr>`,
  )
  .join("")}
<tr><td style="padding:16px 28px 24px;border-top:1px solid #E3E7EC;font-size:12px;color:#4B5563">${
    d.channel === "email" ? "Responde este correo para contestarle directamente." : "Contacta a esta persona por teléfono."
  }</td></tr>
</table></body></html>`;

  return { subject, text, html, replyTo: d.channel === "email" ? d.email : undefined };
}
