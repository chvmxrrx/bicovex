import { Eyebrow } from "@/components/Eyebrow";
import { LogoMark } from "@/components/Logo";
import { ContactStepper, PrivacyNote } from "@/components/ContactStepper";

const NEXT_STEPS = ["Revisamos tu solicitud", "Te enviamos una propuesta inicial", "Conversamos los siguientes pasos"];

/**
 * Contact section, sized to fit one screen:
 *  - Desktop: text left, form right, the section is one viewport tall.
 *  - Tablet: heading and intro in two columns, form below.
 *  - Phone: the form is a full-screen sheet and links to #contacto land on it.
 */
export function Contact() {
  return (
    <section aria-labelledby="contacto-title" className="dots relative overflow-hidden bg-ink">
      <LogoMark
        size={620}
        fill="#F5F7FA"
        className="pointer-events-none absolute -right-[220px] -bottom-[180px] opacity-[.05]"
      />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 gap-7 px-4 py-10 sm:gap-8 sm:px-8 sm:py-14 lg:min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16 lg:py-12">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:items-end sm:gap-x-8 sm:gap-y-3.5 lg:flex lg:flex-col lg:items-stretch lg:gap-[18px]">
          <Eyebrow className="reveal sm:col-span-2">04 — Contacto</Eyebrow>
          <h2
            id="contacto-title"
            className="reveal m-0 text-[40px] font-semibold leading-none tracking-[-.045em] text-balance sm:text-[46px] lg:text-[60px]"
          >
            ¿Qué necesitas <span className="text-accent">conectar</span>?
          </h2>
          <p className="reveal m-0 max-w-[44ch] text-base leading-[1.6] text-mist lg:text-[17px]">
            Cuéntanos en cuatro pasos lo que tienes en mente. Te respondemos con una propuesta inicial y los siguientes
            pasos.
          </p>
          <ol aria-label="Qué pasa después de enviar" className="reveal m-0 mt-2 hidden list-none border-t border-paper/12 p-0 lg:block">
            {NEXT_STEPS.map((text, i) => (
              <li key={text} className="flex items-baseline gap-3.5 border-b border-paper/12 py-3 text-[15px] text-fog-3">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                {text}
              </li>
            ))}
          </ol>
          <PrivacyNote className="reveal mt-1 hidden text-sm lg:flex" />
        </div>

        <div className="min-w-0">
          {/*
            Target for every "#contacto" link. From tablet up it sits at the top of the section;
            on phones it sits right above the form, so the form fills the screen on arrival.
          */}
          <span id="contacto" aria-hidden="true" className="block scroll-mt-3 sm:absolute sm:top-0 sm:left-0 sm:scroll-mt-0" />
          {/* NEXT_SITE_KEY is public by design; it is read here at build time and handed to the form. */}
          <ContactStepper turnstileSiteKey={process.env.NEXT_SITE_KEY ?? ""} />
        </div>
      </div>
    </section>
  );
}
