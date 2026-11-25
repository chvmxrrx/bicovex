export type Service = {
  name: string;
  short: string;
  desc: string;
  items: readonly string[];
  tags: readonly string[];
};

export const services: readonly Service[] = [
  {
    name: "Páginas web",
    short: "Página web",
    desc: "Sitios corporativos rápidos, a medida de tu marca y fáciles de administrar. Pensados para posicionar en buscadores y convertir visitas en contactos.",
    items: ["Diseño UI exclusivo, sin plantillas", "Administrador de contenidos", "SEO técnico y analítica"],
    tags: ["Next.js", "Angular", "CMS"],
  },
  {
    name: "E-commerce",
    short: "E-commerce",
    desc: "Tiendas online con catálogo, inventario, despacho y pagos integrados. Una experiencia de compra fluida desde el celular hasta el checkout.",
    items: ["Pasarelas de pago integradas", "Gestión de stock y pedidos", "Cupones, promociones y reportes"],
    tags: ["Pagos", "Inventario", "Logística"],
  },
  {
    name: "Aplicaciones web a medida",
    short: "App web",
    desc: "Plataformas internas, backoffice y dashboards construidos para tu proceso exacto. Reemplaza planillas sueltas por un sistema único.",
    items: ["Roles, permisos y auditoría", "Integración con ERP y APIs", "Dashboards en tiempo real"],
    tags: ["Node.js", "Python", "APIs"],
  },
  {
    name: "Agenda virtual",
    short: "Agenda",
    desc: "Reservas online 24/7 con pago anticipado, recordatorios automáticos y calendario sincronizado. Menos inasistencias, cero coordinación manual.",
    items: ["Reserva y pago en un paso", "Recordatorios por correo y WhatsApp", "Calendario por profesional o sede"],
    tags: ["Reservas", "Pagos", "Calendario"],
  },
  {
    name: "Chatbots automatizados",
    short: "Chatbot",
    desc: "Asistentes en WhatsApp y web que responden, califican y agendan por ti, y derivan a una persona cuando hace falta.",
    items: ["WhatsApp Business y web", "Conexión con agenda y CRM", "Derivación a atención humana"],
    tags: ["WhatsApp", "IA", "CRM"],
  },
  {
    name: "Aplicaciones móviles",
    short: "App móvil",
    desc: "Apps para iOS y Android con una sola base de código, notificaciones push y conexión directa a tus sistemas.",
    items: ["iOS y Android multiplataforma", "Notificaciones push", "Publicación en tiendas"],
    tags: ["iOS", "Android", "Push"],
  },
];

/** Labels around the connected-core visual in the hero, clockwise from the top. */
export const heroNodes = [
  { label: "Páginas web", left: "50%", top: "8.9%" },
  { label: "E-commerce", left: "85.5%", top: "29.5%" },
  { label: "Apps web", left: "85.5%", top: "70.5%" },
  { label: "Apps móviles", left: "50%", top: "91.1%" },
  { label: "Chatbots", left: "14.5%", top: "70.5%" },
  { label: "Agenda virtual", left: "14.5%", top: "29.5%" },
] as const;

/** Items that scroll in the marquee strip. Alternating items render as outlined text. */
export const marqueeItems = [
  "Páginas web",
  "E-commerce",
  "Aplicaciones web a medida",
  "Agenda virtual",
  "Chatbots automatizados",
  "Apps móviles",
] as const;

export const processSteps = [
  {
    num: "01",
    word: "Connect.",
    title: "Entendemos tu operación",
    desc: "Levantamos procesos, usuarios y herramientas actuales. Sales con un alcance claro, un mapa de la solución y un presupuesto cerrado.",
  },
  {
    num: "02",
    word: "Build.",
    title: "Diseñamos y desarrollamos",
    desc: "Trabajamos en ciclos cortos con demos reales. Ves avances funcionando, opinas a tiempo y nada llega como sorpresa al final.",
  },
  {
    num: "03",
    word: "Scale.",
    title: "Lanzamos y acompañamos",
    desc: "Publicamos, monitoreamos y seguimos mejorando. Tu software queda documentado y listo para sumar nuevos módulos.",
  },
] as const;

export type PrincipleIcon = "plus" | "square" | "link" | "arrow";

export const principles: readonly { icon: PrincipleIcon; title: string; desc: string }[] = [
  { icon: "plus", title: "Precisión", desc: "Código revisado, probado y documentado. Sin atajos que después cuesten caro." },
  { icon: "square", title: "Simplicidad", desc: "Interfaces claras que tu equipo y tus clientes entienden sin manual." },
  { icon: "link", title: "Conexión", desc: "Integramos pagos, calendarios, WhatsApp, ERP y las herramientas que ya usas." },
  { icon: "arrow", title: "Escalabilidad", desc: "Arquitectura pensada para crecer: hoy un sitio, mañana una plataforma." },
];
