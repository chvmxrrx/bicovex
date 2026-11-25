import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "light" | "ghost";
  /** Show the trailing arrow that slides on hover. */
  arrow?: boolean;
  children: ReactNode;
};

const base =
  "group inline-flex items-center gap-3 min-h-[50px] px-6 rounded-full no-underline text-[15px] font-medium tracking-[-.005em] " +
  "transition-[background-color,color,border-color] duration-300";

const variants = {
  light: "bg-paper text-ink hover:bg-white hover:text-ink",
  ghost: "border border-paper/24 text-paper hover:border-accent hover:text-white",
};

/** Pill-shaped call-to-action rendered as a link. */
export function ButtonLink({ variant = "light", arrow = false, className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-[350ms] ease-out-soft group-hover:translate-x-[5px]"
        >
          →
        </span>
      )}
    </a>
  );
}
