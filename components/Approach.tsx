import { principles, type PrincipleIcon } from "@/content/services";
import { Eyebrow } from "@/components/Eyebrow";

const ICONS: Record<PrincipleIcon, React.ReactNode> = {
  plus: <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />,
  square: <rect x="4" y="4" width="16" height="16" />,
  link: (
    <>
      <circle cx="7" cy="12" r="4" />
      <circle cx="17" cy="12" r="4" />
    </>
  ),
  arrow: <path d="M5 19L19 5M11 5h8v8" />,
};

/** "Enfoque": the four principles behind every project. */
export function Approach() {
  return (
    <section id="enfoque" className="bg-paper text-ink">
      <div className="mx-auto max-w-[1280px] px-8 py-[120px]">
        <div className="reveal mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-[720px] flex-col gap-[18px]">
            <Eyebrow tone="light">03 — Enfoque</Eyebrow>
            <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] font-semibold leading-[1.02] tracking-[-.04em] text-balance">
              Cómo pensamos cada línea de código.
            </h2>
          </div>
        </div>

        <div className="reveal grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-px overflow-hidden rounded-3xl border border-ink/14 bg-ink/14">
          {principles.map((p) => (
            <div
              key={p.title}
              className="group flex min-h-[280px] flex-col gap-14 bg-paper px-8 py-9 transition-colors duration-[400ms] hover:bg-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                aria-hidden="true"
                fill="none"
                stroke="#0B0F14"
                strokeWidth="1.6"
                className="transition-transform duration-500 ease-out-soft group-hover:rotate-90"
              >
                {ICONS[p.icon]}
              </svg>
              <div className="flex flex-col gap-2.5">
                <h3 className="m-0 text-2xl font-semibold tracking-[-.02em]">{p.title}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-slate">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
