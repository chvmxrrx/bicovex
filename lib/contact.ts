import { site } from "@/content/site";
import { services } from "@/content/services";

/** Builds the mailto: and WhatsApp links for a set of selected service indexes. */
export function buildContactLinks(picked: readonly number[]) {
  const names = picked.map((i) => services[i].name).join(", ");
  const n = picked.length;

  const subject = n === 0 ? "Nuevo proyecto" : `Cotización: ${names}`;
  const waText =
    n === 0
      ? "Hola BICOVEX, quiero conversar sobre un proyecto."
      : `Hola BICOVEX, me interesa cotizar: ${names}.`;

  const ctaLabel =
    n === 0
      ? "Cuéntanos tu proyecto"
      : n === 1
        ? `Cotizar ${services[picked[0]].short}`
        : `Cotizar ${n} módulos conectados`;

  return {
    ctaLabel,
    mailHref: `mailto:${site.email}?subject=${encodeURIComponent(subject)}`,
    waHref: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waText)}`,
  };
}

export const plainWaHref = `https://wa.me/${site.whatsapp}`;
export const plainMailHref = `mailto:${site.email}`;
