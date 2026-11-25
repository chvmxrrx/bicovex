import { processSteps } from "@/content/services";
import { Eyebrow } from "@/components/Eyebrow";

export function Process() {
  return (
    <section id="proceso" className="bg-ink">
      <div className="mx-auto max-w-[1280px] px-8 py-[120px]">
        <div className="reveal mb-16 flex max-w-[760px] flex-col gap-[18px]">
          <Eyebrow>02 — Proceso</Eyebrow>
          <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] font-semibold leading-[1.02] tracking-[-.04em] text-balance">
            Tres etapas, cero cajas negras.
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-10">
          {processSteps.map((step) => (
            <article key={step.num} className="group reveal flex flex-col gap-5">
              <div className="h-0.5 bg-paper/10">
                <div className="step-bar h-0.5 bg-accent" />
              </div>
              <p className="m-0 font-mono text-xs tracking-[.12em] text-mist">{step.num}</p>
              <p className="step-word m-0 text-[clamp(52px,6vw,88px)] font-semibold leading-[.95] tracking-[-.05em]">
                {step.word}
              </p>
              <h3 className="m-0 text-xl font-medium">{step.title}</h3>
              <p className="m-0 text-base leading-[1.6] text-mist">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
