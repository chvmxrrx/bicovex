type EyebrowProps = {
  children: React.ReactNode;
  /** `dark` sits on the dark background, `light` on the light one. */
  tone?: "dark" | "light";
  className?: string;
};

/** Small uppercase mono label that opens each section. */
export function Eyebrow({ children, tone = "dark", className = "" }: EyebrowProps) {
  const color = tone === "dark" ? "text-mist" : "text-slate";
  return (
    <p className={`m-0 font-mono text-xs uppercase tracking-[.14em] ${color} ${className}`}>{children}</p>
  );
}
