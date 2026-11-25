import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { heroNodes } from "@/content/services";
import { MARK_QUADRANTS } from "@/lib/logo-paths";
import { ButtonLink } from "@/components/Button";
import { PreselectLink } from "@/components/PreselectLink";

export function Hero() {
  return (
    <section id="inicio" className="dots relative overflow-hidden">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(520px,100%),1fr))] items-center gap-12 px-8 pb-24 pt-[72px]">
        <div className="flex flex-col gap-8">
          <p
            className="anim-fade m-0 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[.14em] text-mist"
            style={{ animationDelay: ".1s" }}
          >
            <span className="h-px w-7 bg-accent" />
            Estudio de desarrollo de software
          </p>

          <h1 className="m-0 text-[clamp(46px,6.6vw,96px)] font-semibold leading-[.98] tracking-[-.045em]">
            <span className="line-wrap">
              <span className="line-rise" style={{ animationDelay: ".15s" }}>
                Construimos
              </span>
            </span>
            <span className="line-wrap">
              <span className="line-rise" style={{ animationDelay: ".27s" }}>
                el <span className="text-accent">núcleo</span> digital
              </span>
            </span>
            <span className="line-wrap">
              <span className="line-rise" style={{ animationDelay: ".39s" }}>
                de tu negocio.
              </span>
            </span>
          </h1>

          <p
            className="anim-fade m-0 max-w-[520px] text-lg leading-[1.6] text-mist text-pretty"
            style={{ animationDelay: ".7s" }}
          >
            {site.description}
          </p>

          <div className="anim-fade flex flex-wrap gap-3" style={{ animationDelay: ".85s" }}>
            <ButtonLink href="#contacto" variant="light" arrow>
              Iniciar un proyecto
            </ButtonLink>
            <ButtonLink href="#servicios" variant="ghost">
              Explorar servicios
            </ButtonLink>
          </div>

          <p
            className="anim-fade m-0 flex flex-wrap gap-[18px] pt-2 font-mono text-xs tracking-[.16em] text-dim"
            style={{ animationDelay: "1s" }}
          >
            <span>CONNECT</span>
            <span className="text-accent">/</span>
            <span>BUILD</span>
            <span className="text-accent">/</span>
            <span>SCALE</span>
          </p>
        </div>

        <ConnectedCore />
      </div>
    </section>
  );
}

/** Offsets each quadrant of the mark slides in from, matching its corner. */
const QUADRANT_MOTION: ReadonlyArray<{ dx: string; dy: string; delay: string }> = [
  { dx: "-40px", dy: "-40px", delay: ".35s" },
  { dx: "40px", dy: "-40px", delay: ".5s" },
  { dx: "40px", dy: "40px", delay: ".65s" },
  { dx: "-40px", dy: "40px", delay: ".8s" },
];

/** Dashed connector lines from the ring to the core, one per node. */
const FLOW_LINES = [
  { x1: 280, y1: 50, x2: 280, y2: 170 },
  { x1: 479, y1: 165, x2: 375, y2: 225 },
  { x1: 479, y1: 395, x2: 375, y2: 335 },
  { x1: 280, y1: 510, x2: 280, y2: 390 },
  { x1: 81, y1: 395, x2: 185, y2: 335 },
  { x1: 81, y1: 165, x2: 185, y2: 225 },
] as const;

/** The animated "connected core" illustration: the mark at the centre of a ring of services. */
function ConnectedCore() {
  return (
    <div className="flex justify-center">
      <div className="relative aspect-square w-[min(560px,100%)]">
        <svg viewBox="0 0 560 560" width="100%" height="100%" aria-hidden="true" className="absolute inset-0">
          <g className="anim-spin">
            <circle cx="280" cy="280" r="230" fill="none" stroke="rgba(245,247,250,.14)" strokeWidth="1" strokeDasharray="2 8" />
          </g>
          <circle cx="280" cy="280" r="150" fill="none" stroke="rgba(245,247,250,.07)" strokeWidth="1" />

          <g stroke="var(--color-accent)" strokeWidth="1.2" fill="none" opacity=".55">
            {FLOW_LINES.map((l, i) => (
              <line key={i} className="anim-flow" {...l} strokeDasharray="4 8" />
            ))}
          </g>

          <g className="anim-breathe">
            <g transform="translate(167 167) scale(.62)" fill="#F5F7FA">
              {MARK_QUADRANTS.map((d, i) => (
                <g
                  key={i}
                  className="anim-mod"
                  style={
                    {
                      "--dx": QUADRANT_MOTION[i].dx,
                      "--dy": QUADRANT_MOTION[i].dy,
                      animationDelay: QUADRANT_MOTION[i].delay,
                    } as CSSProperties
                  }
                >
                  <path d={d} />
                </g>
              ))}
            </g>
          </g>

          <circle className="anim-pulse-ring" cx="280" cy="280" r="5" fill="var(--color-accent)" />
          <circle cx="280" cy="280" r="4" fill="var(--color-accent)" />
        </svg>

        {heroNodes.map((node, i) => (
          <PreselectLink
            key={node.label}
            service={node.service}
            aria-label={`Cotizar ${node.label}`}
            className={[
              "anim-fade absolute top-(--y) left-(--x) flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-paper/14 bg-ink-2 px-3.5 py-2 font-mono text-xs text-fog-2 no-underline transition-colors duration-300 hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              // Phones: smaller pills, side labels pinned to the ring's edge so they stay on screen.
              "max-[760px]:top-(--y-sm) max-[760px]:gap-1.5 max-[760px]:px-2 max-[760px]:py-1.5 max-[760px]:text-[11px]",
              node.side === "left" ? "max-[760px]:left-0 max-[760px]:translate-x-0" : "",
              node.side === "right" ? "max-[760px]:right-0 max-[760px]:left-auto max-[760px]:translate-x-0" : "",
            ].join(" ")}
            style={
              {
                "--x": node.left,
                "--y": node.top,
                "--y-sm": node.topSm,
                animationDelay: `${1.1 + i * 0.1}s`,
              } as CSSProperties
            }
          >
            <i className="block size-1.5 rounded-full bg-accent" />
            <span>{node.label}</span>
          </PreselectLink>
        ))}
      </div>
    </div>
  );
}
