import { MARK_PATH, WORDMARK_PATH } from "@/lib/logo-paths";

type MarkProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Fill colour. Defaults to the current text colour. */
  fill?: string;
};

/** The geometric BICOVEX mark (square 364×364 viewBox). */
export function LogoMark({ size = 30, className, style, fill = "currentColor" }: MarkProps) {
  return (
    <svg
      viewBox="0 0 364 364"
      width={size}
      height={size}
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path fill={fill} d={MARK_PATH} />
    </svg>
  );
}

type WordmarkProps = {
  /** Rendered width in px; height follows the 936:156 ratio. */
  width?: number;
  className?: string;
  fill?: string;
  /** When set, the wordmark is announced as an image with this label. */
  label?: string;
};

/** The "BICOVEX" wordmark. */
export function LogoWordmark({ width = 114, className, fill = "currentColor", label }: WordmarkProps) {
  const height = Math.round((width * 156) / 936);
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <svg viewBox="0 0 936 156" width={width} height={height} className={className} {...a11y}>
      <path fill={fill} fillRule="evenodd" d={WORDMARK_PATH} />
    </svg>
  );
}
