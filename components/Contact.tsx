"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { buildContactLinks, plainMailHref, plainWaHref } from "@/lib/contact";
import { Eyebrow } from "@/components/Eyebrow";
import { ButtonLink } from "@/components/Button";
import { LogoMark } from "@/components/Logo";

/** Contact configurator: pick the modules of interest, then write by email or WhatsApp. */
export function Contact() {
  const [picked, setPicked] = useState<number[]>([]);
  const { ctaLabel, mailHref, waHref } = buildContactLinks(picked);

  const toggle = (i: number) =>
    setPicked((prev) => (prev.includes(i) ? prev.filter((k) => k !== i) : [...prev, i]));

  return (
    <section id="contacto" className="dots relative overflow-hidden bg-ink">
      <LogoMark
        size={720}
        fill="#F5F7FA"
        className="absolute top-1/2 -right-[260px] -mt-[360px] opacity-[.06]"
      />

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-10 px-8 py-32">
        <Eyebrow className="reveal">04 — Contacto</Eyebrow>
        <h2 className="reveal m-0 max-w-[960px] text-[clamp(42px,6vw,88px)] font-semibold leading-[.98] tracking-[-.045em] text-balance">
          ¿Qué necesitas <span className="text-accent">conectar</span>?
        </h2>
        <p className="reveal m-0 max-w-[560px] text-lg leading-[1.6] text-mist">
          Marca lo que tienes en mente. Te respondemos con una propuesta inicial y los siguientes pasos.
        </p>

        <div role="group" aria-label="Servicios de interés" className="reveal flex max-w-[900px] flex-wrap gap-2.5">
          {services.map((s, i) => {
            const on = picked.includes(i);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={on}
                className={[
                  "inline-flex min-h-[46px] cursor-pointer appearance-none items-center gap-2.5 rounded-full border px-[18px] text-[15px]",
                  "transition-[background-color,color,border-color] duration-300",
                  "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent",
                  on ? "border-paper bg-paper text-ink" : "border-paper/22 text-fog-3 hover:border-paper/55",
                ].join(" ")}
              >
                <span
                  className={`size-2.5 rounded-[2px] border transition-colors duration-300 ${
                    on ? "border-accent bg-accent" : "border-paper/50"
                  }`}
                />
                {s.name}
              </button>
            );
          })}
        </div>

        <div className="reveal flex flex-wrap items-center gap-6 pt-2">
          <ButtonLink href={mailHref} variant="light" arrow className="min-h-[58px] px-[30px] text-base">
            {ctaLabel}
          </ButtonLink>
          <ButtonLink
            href={waHref}
            variant="ghost"
            target="_blank"
            rel="noopener"
            className="min-h-[58px] px-[26px] text-base"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            Escríbenos por WhatsApp
          </ButtonLink>
        </div>

        <p className="reveal m-0 flex flex-wrap gap-7 font-mono text-[13px]">
          <a href={plainMailHref} className="text-mist no-underline transition-colors duration-[250ms] hover:text-paper">
            {site.email}
          </a>
          <a
            href={plainWaHref}
            target="_blank"
            rel="noopener"
            className="text-mist no-underline transition-colors duration-[250ms] hover:text-paper"
          >
            {site.phoneDisplay}
          </a>
        </p>
      </div>
    </section>
  );
}
