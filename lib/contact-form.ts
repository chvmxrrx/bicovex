import { services } from "@/content/services";

/**
 * Shared rules for the contact stepper. The browser uses them to guide the visitor,
 * and the API route runs them again, so a request that skips the UI is held to the same rules.
 */

export const CHANNELS = [
  { id: "email", label: "Correo" },
  { id: "telefono", label: "Teléfono" },
] as const;

export type Channel = (typeof CHANNELS)[number]["id"];

export type ContactDraft = {
  services: number[];
  details: string;
  name: string;
  company: string;
  channel: Channel;
  email: string;
  /** National number, digits only, without the +56 prefix. */
  phone: string;
};

export const emptyDraft = (): ContactDraft => ({
  services: [],
  details: "",
  name: "",
  company: "",
  channel: "email",
  email: "",
  phone: "",
});

export const LIMITS = { details: 600, name: 80, company: 80, email: 120 } as const;

export type FieldError = { field: "services" | "name" | "email" | "phone"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The first problem that keeps the visitor from leaving `step`, or null when the step is complete. */
export function stepError(step: number, d: ContactDraft): FieldError | null {
  if (step === 0 && d.services.length === 0) {
    return { field: "services", message: "Elige al menos un servicio para continuar." };
  }
  if (step === 1 && d.name.trim().length < 2) {
    return { field: "name", message: "Escribe tu nombre para saber cómo dirigirnos a ti." };
  }
  if (step === 2) {
    if (d.channel === "email" && !EMAIL_RE.test(d.email.trim())) {
      return {
        field: "email",
        message: d.email.trim()
          ? "Revisa el correo. Debe tener el formato nombre@dominio.cl."
          : "Escribe tu correo para poder responderte.",
      };
    }
    if (d.channel === "telefono" && d.phone.length !== 9) {
      return {
        field: "phone",
        message: d.phone
          ? "El número debe tener 9 dígitos, por ejemplo 9 1234 5678."
          : "Escribe tu número para poder contactarte.",
      };
    }
  }
  return null;
}

/** The first problem anywhere in the draft. */
export function draftError(d: ContactDraft): FieldError | null {
  for (let s = 0; s <= 2; s++) {
    const err = stepError(s, d);
    if (err) return err;
  }
  return null;
}

/** "912345678" → "9 1234 5678", formatting as the visitor types. */
export function formatPhone(digits: string): string {
  if (digits.length > 5) return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
  if (digits.length > 1) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
  return digits;
}

export const channelLabel = (c: Channel) => CHANNELS.find((x) => x.id === c)?.label ?? c;

/** The visitor's contact detail as it should be shown, e.g. "+56 9 1234 5678". */
export function contactValue(d: ContactDraft): string {
  return d.channel === "email" ? d.email.trim() : `+56 ${formatPhone(d.phone)}`;
}

/** Coerces an untrusted request body into a draft. Returns null when its shape is wrong. */
export function parseDraft(input: unknown): ContactDraft | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const channel = CHANNELS.find((c) => c.id === o.channel)?.id;
  if (!channel) return null;

  const picked = Array.isArray(o.services)
    ? o.services.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < services.length)
    : [];

  return {
    services: [...new Set(picked)].sort((a, b) => a - b),
    details: str(o.details, LIMITS.details),
    name: str(o.name, LIMITS.name),
    company: str(o.company, LIMITS.company),
    channel,
    email: str(o.email, LIMITS.email),
    phone: str(o.phone, 20).replace(/\D/g, ""),
  };
}
