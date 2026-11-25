# BICOVEX — Landing

Landing page de BICOVEX, estudio de desarrollo de software. Una sola página en español con hero animado, marquee de servicios, panel interactivo de módulos, proceso, enfoque y configurador de contacto (correo / WhatsApp).

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Tipografía Geist / Geist Mono vía `next/font/google`

## Desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

## Estructura

- `app/` — layout raíz, página principal, estilos globales y favicon.
- `components/` — secciones de la landing (`Nav`, `Hero`, `Marquee`, `Services`, `Process`, `Approach`, `Contact`, `Footer`) y piezas compartidas (`Logo`, `Button`, `Eyebrow`).
- `content/` — textos y datos de la página (`site.ts`, `services.ts`). Edita aquí los servicios, los pasos del proceso y los datos de contacto.
- `lib/` — trazados vectoriales del logo y helpers para los enlaces de contacto.

Los tokens de color y las animaciones viven en `app/globals.css` (bloque `@theme`).
