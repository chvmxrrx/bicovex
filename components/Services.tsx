"use client";

import { useState } from "react";
import { services } from "@/content/services";
import { Eyebrow } from "@/components/Eyebrow";
import { LogoMark } from "@/components/Logo";

const pad2 = (n: number) => String(n + 1).padStart(2, "0");

/** Service list on the left; the selected module's details in a sticky dark panel on the right. */
export function Services() {
  const [active, setActive] = useState(0);
  const current = services[active];

  return (
    <section id="servicios" className="dots-light bg-paper text-ink">
      <div className="mx-auto max-w-[1280px] px-8 py-[120px]">
        <div className="reveal mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[720px] flex-col gap-[18px]">
            <Eyebrow tone="light">01 — Servicios</Eyebrow>
            <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] font-semibold leading-[1.02] tracking-[-.04em] text-balance">
              Seis módulos. Un mismo núcleo.
            </h2>
          </div>
          <p className="m-0 max-w-[380px] text-base leading-[1.6] text-slate">
            Cada solución funciona sola, pero rinde más conectada: tu tienda alimenta tu agenda, tu chatbot agenda
            por ti, tu app habla con tu sistema.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(460px,100%),1fr))] items-start gap-12">
          <div className="flex flex-col border-b border-ink/14">
            {services.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={[
                    "grid w-full cursor-pointer appearance-none grid-cols-[52px_minmax(0,1fr)_28px] items-center gap-4 border-t px-1.5 py-6 text-left",
                    "transition-[padding,background-color,color,border-color] duration-[450ms] ease-out-soft",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                    on
                      ? "border-t-ink bg-ink pl-[18px] text-paper"
                      : "border-t-ink/14 text-ink hover:bg-ink/3 hover:pl-[18px]",
                  ].join(" ")}
                >
                  <span className={`font-mono text-[13px] ${on ? "text-mist" : "text-slate-2"}`}>{pad2(i)}</span>
                  <span className="text-[clamp(24px,2.7vw,38px)] font-medium leading-[1.1] tracking-[-.03em]">
                    {s.name}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    aria-hidden="true"
                    className={`transition-[transform,opacity] duration-[450ms] ease-out-soft ${on ? "-rotate-45 opacity-100" : "opacity-30"}`}
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="sticky top-6 flex min-h-[520px] flex-col gap-7 overflow-hidden rounded-[28px] bg-ink p-[clamp(28px,4vw,48px)] text-paper">
            <LogoMark
              size={360}
              fill="#F5F7FA"
              className="absolute -right-[110px] -bottom-[110px] opacity-10 transition-transform duration-[1100ms] ease-in-out-firm"
              style={{ transform: `rotate(${active * 45}deg)` }}
            />

            <div className="relative flex justify-between font-mono text-xs tracking-[.14em] text-mist">
              <span>MÓDULO {pad2(active)}</span>
              <span>/ {pad2(services.length - 1)}</span>
            </div>

            <div className="relative flex flex-col gap-4">
              <h3 className="m-0 text-[clamp(32px,3.4vw,48px)] font-semibold leading-[1.05] tracking-[-.035em]">
                {current.name}
              </h3>
              <p className="m-0 max-w-[460px] text-[17px] leading-[1.6] text-fog text-pretty">{current.desc}</p>
            </div>

            <ul className="relative m-0 flex list-none flex-col border-t border-paper/12 p-0">
              {current.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3.5 border-b border-paper/12 py-3.5 text-[15px] text-fog-4"
                >
                  <span className="size-1.5 flex-none bg-accent" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative mt-auto flex flex-wrap gap-2">
              {current.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-paper/18 px-3 py-[7px] font-mono text-xs text-fog"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
