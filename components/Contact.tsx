import { Eyebrow } from "@/components/Eyebrow";
import { LogoMark } from "@/components/Logo";
import { ContactStepper } from "@/components/ContactStepper";

/** Contact section: heading plus the four-step request form. */
export function Contact() {
  return (
    <section id="contacto" className="dots relative overflow-hidden bg-ink">
      <LogoMark
        size={720}
        fill="#F5F7FA"
        className="pointer-events-none absolute top-1/2 -right-[260px] -mt-[360px] opacity-[.06]"
      />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-8 py-32 max-[640px]:px-4">
        <div className="flex flex-col gap-10">
          <Eyebrow className="reveal">04 — Contacto</Eyebrow>
          <h2 className="reveal m-0 max-w-[960px] text-[clamp(42px,6vw,88px)] font-semibold leading-[.98] tracking-[-.045em] text-balance">
            ¿Qué necesitas <span className="text-accent">conectar</span>?
          </h2>
          <p className="reveal m-0 max-w-[560px] text-lg leading-[1.6] text-mist">
            Cuéntanos en cuatro pasos lo que tienes en mente. Te respondemos con una propuesta inicial y los siguientes
            pasos.
          </p>
        </div>

        {/* NEXT_SITE_KEY is public by design; it is read here at build time and handed to the form. */}
        <ContactStepper turnstileSiteKey={process.env.NEXT_SITE_KEY ?? ""} />
      </div>
    </section>
  );
}
