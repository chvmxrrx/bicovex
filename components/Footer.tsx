import { footerNav, site } from "@/content/site";
import { LogoMark, LogoWordmark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-paper/8 bg-ink">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-8 py-10">
        <div className="flex items-center gap-3">
          <LogoMark size={24} fill="#F5F7FA" />
          <LogoWordmark width={90} fill="#F5F7FA" label={site.name} />
          <span className="ml-3 font-mono text-xs text-dim">{site.tagline}</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          {footerNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-mist no-underline transition-colors duration-[250ms] hover:text-paper"
            >
              {item.label}
            </a>
          ))}
          <span className="font-mono text-xs text-dim">
            © {site.year} {site.name}
          </span>
        </div>
      </div>
    </footer>
  );
}
