import { nav } from "@/content/site";
import { LogoMark, LogoWordmark } from "@/components/Logo";
import { ButtonLink } from "@/components/Button";

export function Nav() {
  return (
    <header className="dots relative border-b border-paper/8">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-8 py-[22px]"
      >
        <a href="#inicio" aria-label="BICOVEX inicio" className="flex items-center gap-3 text-paper no-underline">
          <LogoMark size={30} />
          <LogoWordmark width={114} />
        </a>
        <div className="flex flex-wrap items-center gap-7">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-mist no-underline transition-colors duration-[250ms] hover:text-paper max-[760px]:hidden"
            >
              {item.label}
            </a>
          ))}
          <ButtonLink href="#contacto" variant="ghost" arrow className="min-h-[44px] px-[18px] text-sm">
            Iniciar proyecto
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
