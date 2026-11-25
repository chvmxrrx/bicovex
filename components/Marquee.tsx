import { marqueeItems } from "@/content/services";

/** Full-width strip of service names scrolling continuously; pauses on hover. */
export function Marquee() {
  // The track is rendered twice so the -50% translate loops seamlessly.
  const items = [...marqueeItems, ...marqueeItems];

  return (
    <section
      aria-label="Servicios"
      className="marquee overflow-hidden border-y border-paper/8 py-[30px]"
    >
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap text-[clamp(36px,4.6vw,64px)] font-medium tracking-[-.035em]">
        {items.map((item, i) => (
          <span key={i} className="contents">
            <span className={i % 2 === 1 ? "text-outline" : undefined}>{item}</span>
            <span className="text-accent">✕</span>
          </span>
        ))}
      </div>
    </section>
  );
}
