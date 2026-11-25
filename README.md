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

## Formulario de contacto

El formulario de cuatro pasos envía a `app/api/contacto/route.ts`, que reenvía cada solicitud por correo con [Resend](https://resend.com). El correo de destino vive solo en las variables de entorno del servidor y nunca llega al navegador.

Variables (ver `.env.example`):

| Variable | Para qué sirve |
| --- | --- |
| `RESEND_API_KEY` | Clave de API de Resend. |
| `CONTACT_TO` | Correo que recibe las solicitudes. |
| `CONTACT_FROM` | Remitente. Vacío usa `onboarding@resend.dev`, que solo puede enviar al correo con el que creaste la cuenta de Resend. |

En local, sin `RESEND_API_KEY`, la ruta imprime la solicitud en la consola en vez de enviarla.

Protección contra spam: campo trampa oculto, tiempo mínimo de llenado, verificación de origen, validación en el servidor y límite de 5 solicitudes cada 10 minutos por IP. Los bots detectados reciben una respuesta de éxito falsa.
