"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { services } from "@/content/services";
import {
  CHANNELS,
  LIMITS,
  contactValue,
  emptyDraft,
  formatPhone,
  stepError,
  type ContactDraft,
  type FieldError,
} from "@/lib/contact-form";
import { PRESELECT_EVENT } from "@/lib/preselect";
import { MARK_QUADRANTS } from "@/lib/logo-paths";
import { loadTurnstile } from "@/lib/turnstile";

const STEPS = ["Servicio", "Datos", "Contacto", "Enviar"] as const;
const DONE = 4;
const STORAGE_KEY = "bicovex-contacto-borrador";

type Anim = "" | "leave-l" | "leave-r" | "enter-l" | "enter-r";
type Saved = { draft: ContactDraft; step: number; maxStep: number; startedAt: number };

const QUADRANT_MOTION = [
  { dx: "-40px", dy: "-40px", delay: ".05s" },
  { dx: "40px", dy: "-40px", delay: ".2s" },
  { dx: "40px", dy: "40px", delay: ".35s" },
  { dx: "-40px", dy: "40px", delay: ".5s" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Phones show the card as a full-screen sheet, so every step change re-aligns it to the top. */
const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;

/**
 * Four-step contact form: services, name, contact detail, review and send.
 * Phones: the card fills the visible screen and the buttons sit at the bottom.
 * Tablet and up: the card sizes to its content with a steady minimum height.
 */
export function ContactStepper({ turnstileSiteKey = "" }: { turnstileSiteKey?: string }) {
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft);
  /** The step the progress bar and buttons reflect. */
  const [step, setStep] = useState(0);
  /** The panel on screen. It trails `step` while the leave animation plays. */
  const [shown, setShown] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [anim, setAnim] = useState<Anim>("");
  const [error, setError] = useState<FieldError | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState<ContactDraft | null>(null);
  const [live, setLive] = useState("");
  /** Cloudflare Turnstile token for the review step; single use, expires after 5 minutes. */
  const [humanToken, setHumanToken] = useState("");
  const [humanCheckFailed, setHumanCheckFailed] = useState(false);
  const turnstileBoxRef = useRef<HTMLDivElement>(null);
  const turnstileIdRef = useRef<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const detailsRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const stepRef = useRef(0);
  const draftRef = useRef(draft);
  const busy = useRef(false);
  const entering = useRef(false);
  const arrived = useRef(false);
  const startedAt = useRef(0);
  const restored = useRef(false);

  draftRef.current = draft;
  stepRef.current = step;

  /* ---------- draft persistence (per tab, survives a reload) ---------- */
  useEffect(() => {
    startedAt.current = Date.now();
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null") as Saved | null;
      if (saved?.draft) {
        const s = Math.min(Math.max(saved.step, 0), 3);
        setDraft({ ...emptyDraft(), ...saved.draft });
        setStep(s);
        setShown(s);
        setMaxStep(Math.min(Math.max(saved.maxStep, s), 3));
        setDetailsOpen(Boolean(saved.draft.details));
        if (saved.startedAt) startedAt.current = saved.startedAt;
      }
    } catch {}
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current || step === DONE) return;
    try {
      const saved: Saved = { draft, step, maxStep, startedAt: startedAt.current };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {}
  }, [draft, step, maxStep]);

  const update = (patch: Partial<ContactDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  };

  /* ---------- navigation with a slide between steps ---------- */
  const goTo = useCallback((n: number) => {
    const from = stepRef.current;
    if (busy.current || n === from) return;
    setError(null);
    setSendError("");
    setStep(n);
    setMaxStep((m) => Math.max(m, Math.min(n, 3)));

    if (prefersReducedMotion()) {
      arrived.current = true;
      setShown(n);
      return;
    }
    busy.current = true;
    const forward = n > from;
    setAnim(forward ? "leave-l" : "leave-r");
    window.setTimeout(() => {
      entering.current = true;
      setShown(n);
      setAnim(forward ? "enter-r" : "enter-l");
    }, 180);
  }, []);

  const onArrive = useCallback((n: number) => {
    const d = draftRef.current;
    let target: HTMLElement | null = headingRef.current;
    if (n === 1 && !d.name) target = nameRef.current;
    if (n === 2 && d.channel === "email" && !d.email) target = emailRef.current;
    if (n === 2 && d.channel === "telefono" && !d.phone) target = phoneRef.current;
    target?.focus({ preventScroll: true });
    setLive(n === DONE ? "Solicitud enviada." : `Paso ${n + 1} de 4: ${STEPS[n]}`);

    const form = formRef.current;
    if (!form) return;
    const top = form.getBoundingClientRect().top;
    if (top < 0 || (isPhone() && Math.abs(top - 12) > 4)) {
      form.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }, []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (entering.current) {
      entering.current = false;
      void panel.offsetWidth;
      requestAnimationFrame(() => {
        setAnim("");
        busy.current = false;
        onArrive(shown);
      });
    } else if (arrived.current) {
      arrived.current = false;
      onArrive(shown);
    }
  }, [shown, onArrive]);

  /* ---------- other sections can mark a service ("Cotizar …") ---------- */
  useEffect(() => {
    const onPreselect = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      if (!Number.isInteger(i) || !services[i]) return;
      if (stepRef.current === DONE) {
        setSent(null);
        setMaxStep(0);
        startedAt.current = Date.now();
        setDraft({ ...emptyDraft(), services: [i] });
        setDetailsOpen(false);
      } else {
        setDraft((d) =>
          d.services.includes(i) ? d : { ...d, services: [...d.services, i].sort((a, b) => a - b) },
        );
      }
      setError(null);
      goTo(0);
    };
    window.addEventListener(PRESELECT_EVENT, onPreselect);
    return () => window.removeEventListener(PRESELECT_EVENT, onPreselect);
  }, [goTo]);

  /* ---------- Cloudflare Turnstile on the review step ---------- */
  useEffect(() => {
    if (shown !== 3 || !turnstileSiteKey) return;
    let cancelled = false;
    setHumanToken("");
    setHumanCheckFailed(false);
    loadTurnstile()
      .then((ts) => {
        const box = turnstileBoxRef.current;
        if (cancelled || !box) return;
        turnstileIdRef.current = ts.render(box, {
          sitekey: turnstileSiteKey,
          action: "contacto",
          theme: "dark",
          language: "es",
          // Stays invisible unless Cloudflare needs the visitor to tick a box.
          appearance: "interaction-only",
          callback: (token: string) => {
            setHumanToken(token);
            setHumanCheckFailed(false);
          },
          "expired-callback": () => setHumanToken(""),
          "error-callback": () => {
            setHumanToken("");
            setHumanCheckFailed(true);
          },
        });
      })
      .catch(() => !cancelled && setHumanCheckFailed(true));
    return () => {
      cancelled = true;
      if (turnstileIdRef.current) window.turnstile?.remove(turnstileIdRef.current);
      turnstileIdRef.current = null;
    };
  }, [shown, turnstileSiteKey]);

  const resetTurnstile = () => {
    if (turnstileIdRef.current) window.turnstile?.reset(turnstileIdRef.current);
    setHumanToken("");
  };

  /* ---------- submit: validate the step, advance, or send ---------- */
  const focusError = (err: FieldError) => {
    const el =
      err.field === "name"
        ? nameRef.current
        : err.field === "email"
          ? emailRef.current
          : err.field === "phone"
            ? phoneRef.current
            : null;
    el?.focus();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy.current || sending || step === DONE) return;

    if (step < 3) {
      const err = stepError(step, draft);
      if (err) {
        setError(err);
        focusError(err);
        return;
      }
      goTo(step + 1);
      return;
    }

    if (turnstileSiteKey && !humanToken) {
      setSendError(
        humanCheckFailed
          ? "No pudimos cargar la verificación de seguridad. Recarga la página e intenta de nuevo."
          : "Estamos verificando la conexión. Intenta de nuevo en unos segundos.",
      );
      return;
    }

    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          website: honeypotRef.current?.value ?? "",
          elapsedMs: Date.now() - startedAt.current,
          turnstileToken: humanToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.");
      setSent(draft);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      goTo(DONE);
    } catch (err) {
      resetTurnstile();
      setSendError(
        err instanceof TypeError
          ? "No hay conexión. Revisa tu internet e intenta de nuevo."
          : (err as Error).message,
      );
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    setSent(null);
    setDraft(emptyDraft());
    setMaxStep(0);
    setDetailsOpen(false);
    startedAt.current = Date.now();
    goTo(0);
  };

  /* ---------- derived UI ---------- */
  const verifying = step === 3 && Boolean(turnstileSiteKey) && !humanToken && !humanCheckFailed;
  const stepInvalid = (step < 3 && stepError(step, draft) !== null) || verifying;
  const n = draft.services.length;
  const nextLabel =
    step === 0
      ? n === 0
        ? "Elige un servicio"
        : n === 1
          ? `Continuar con ${services[draft.services[0]].short}`
          : `Continuar con ${n} módulos`
      : step === 3
        ? sending
          ? "Enviando…"
          : verifying
            ? "Verificando…"
            : "Enviar solicitud"
        : "Continuar";

  const isStepDone = (i: number) =>
    step === DONE || (i < 3 && i !== step && i <= maxStep && stepError(i, draft) === null);

  const toggleService = (i: number) =>
    update({
      services: draft.services.includes(i)
        ? draft.services.filter((k) => k !== i)
        : [...draft.services, i].sort((a, b) => a - b),
    });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={[
        "relative flex w-full scroll-mt-3 flex-col overflow-hidden border border-paper/12 bg-ink-2",
        // Phone: a sheet as tall as the visible screen. Tablet and up: sized by content.
        "min-h-[calc(100svh-24px)] gap-5 rounded-3xl p-5",
        "sm:min-h-0 sm:gap-[26px] sm:rounded-[28px] sm:p-8 lg:p-9",
      ].join(" ")}
    >
      {/* Honeypot: hidden from people and screen readers, bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Sitio web</label>
        <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Progress */}
      <div className={step === DONE ? "invisible h-0 overflow-hidden" : ""}>
        <p aria-hidden="true" className="mb-2.5 font-mono text-xs uppercase tracking-[.12em] text-mist sm:hidden">
          Paso <b className="font-medium text-paper">{Math.min(step, 3) + 1}</b> de 4 · {STEPS[Math.min(step, 3)]}
        </p>
        <ol aria-label="Progreso del formulario" className="m-0 grid list-none grid-cols-4 gap-2 p-0 sm:gap-2.5">
          {STEPS.map((label, i) => {
            const current = i === step;
            const done = !current && isStepDone(i);
            const reachable = i <= maxStep && step !== DONE;
            return (
              <li key={label} className="min-w-0">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goTo(i)}
                  aria-current={current ? "step" : undefined}
                  aria-label={`Paso ${i + 1}: ${label}${current ? ", actual" : done ? ", completado" : ""}`}
                  className="group/p flex w-full cursor-pointer flex-col gap-2.5 text-left focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-accent disabled:cursor-default"
                >
                  <span
                    className={`flex items-center gap-2 overflow-hidden whitespace-nowrap font-mono text-xs uppercase tracking-[.12em] transition-colors duration-300 max-sm:hidden ${
                      current ? "text-paper" : done ? "text-mist group-hover/p:text-paper" : "text-dim"
                    }`}
                  >
                    <span
                      className={`inline-flex size-[22px] flex-none items-center justify-center rounded-full border text-[11px] tracking-normal transition-colors duration-300 ${
                        done ? "border-accent bg-accent text-paper" : current ? "border-accent" : "border-paper/22"
                      }`}
                    >
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="block h-[3px] overflow-hidden rounded-sm bg-paper/10 sm:h-0.5">
                    <span
                      className={`block h-full origin-left bg-accent transition-transform duration-700 ease-out-soft ${
                        current || done ? "scale-x-100" : "scale-x-0"
                      } ${done ? "opacity-55" : ""}`}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Steps. The stage keeps a steady height on larger screens so the buttons don't jump. */}
      <div className="relative flex flex-1 flex-col sm:min-h-[340px]">
        <div ref={panelRef} className={`step-panel flex flex-1 flex-col gap-[18px] sm:gap-6 ${anim}`}>
          {shown === 0 && (
            <>
              <StepTitle ref={headingRef} title="¿Qué necesitas?">
                Marca uno o varios. Si no lo tienes claro, elige lo más cercano.
              </StepTitle>
              <div role="group" aria-label="Servicios de interés" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                {services.map((s, i) => {
                  const on = draft.services.includes(i);
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => toggleService(i)}
                      aria-pressed={on}
                      className={[
                        "flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-[14px] border px-3.5 text-left text-[15px] sm:rounded-full sm:px-[18px]",
                        "transition-[background-color,color,border-color,transform] duration-300 active:scale-[.97]",
                        "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent",
                        on ? "border-paper bg-paper text-ink" : "border-paper/22 text-fog-3 hover:border-paper/55",
                      ].join(" ")}
                    >
                      <span
                        className={`size-2.5 flex-none rounded-[2px] border transition-colors duration-300 ${
                          on ? "border-accent bg-accent" : "border-paper/50"
                        }`}
                      />
                      <span className="sm:hidden">{s.short}</span>
                      <span className="hidden sm:inline">{s.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  aria-expanded={detailsOpen}
                  aria-controls="details-box"
                  onClick={() => {
                    setDetailsOpen((o) => !o);
                    if (!detailsOpen) requestAnimationFrame(() => detailsRef.current?.focus({ preventScroll: true }));
                  }}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 self-start text-sm text-mist transition-colors hover:text-paper focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span aria-hidden="true" className={`inline-block transition-transform duration-300 ${detailsOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                  Agregar detalles
                  <OptionalTag />
                </button>
                <div id="details-box" hidden={!detailsOpen}>
                  <label htmlFor="details" className="sr-only">
                    Detalles del proyecto
                  </label>
                  <textarea
                    ref={detailsRef}
                    id="details"
                    value={draft.details}
                    maxLength={LIMITS.details}
                    onChange={(e) => update({ details: e.target.value })}
                    placeholder="Por ejemplo: tengo una clínica con 3 sedes y quiero reservas y pagos online."
                    className="h-[88px] w-full resize-none rounded-[14px] border border-paper/12 bg-ink px-3.5 py-3 text-[15px] leading-normal text-paper outline-none placeholder:text-[#5E6878] focus:border-accent sm:h-[104px]"
                  />
                </div>
              </div>
              <FieldErrorText id="err-services" message={error?.field === "services" ? error.message : ""} />
            </>
          )}

          {shown === 1 && (
            <>
              <StepTitle ref={headingRef} title="¿Con quién hablamos?">
                Así sabremos a quién dirigir la propuesta.
              </StepTitle>
              <div className="flex flex-col gap-3.5">
                <LineField id="name" label="Tu nombre" error={error?.field === "name" ? error.message : ""}>
                  <input
                    ref={nameRef}
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Nombre y apellido"
                    maxLength={LIMITS.name}
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                    aria-invalid={error?.field === "name"}
                    aria-describedby="name-error"
                    className={lineInput}
                  />
                </LineField>
                <LineField id="company" label="Empresa" optional>
                  <input
                    id="company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Tu empresa o proyecto"
                    maxLength={LIMITS.company}
                    value={draft.company}
                    onChange={(e) => update({ company: e.target.value })}
                    className={lineInput}
                  />
                </LineField>
              </div>
            </>
          )}

          {shown === 2 && (
            <>
              <StepTitle ref={headingRef} title="¿Cómo te contactamos?">
                Lo usamos solo para responder esta solicitud.
              </StepTitle>
              <div
                role="radiogroup"
                aria-label="Canal de contacto"
                className="grid grid-cols-2 gap-1 rounded-full border border-paper/22 p-1 sm:inline-grid sm:self-start"
              >
                {CHANNELS.map((c) => (
                  <span key={c.id} className="flex">
                    <input
                      type="radio"
                      name="channel"
                      id={`ch-${c.id}`}
                      value={c.id}
                      checked={draft.channel === c.id}
                      onChange={() => {
                        update({ channel: c.id });
                        requestAnimationFrame(() =>
                          (c.id === "email" ? emailRef : phoneRef).current?.focus({ preventScroll: true }),
                        );
                      }}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor={`ch-${c.id}`}
                      className="inline-flex min-h-[42px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-[15px] text-fog-3 transition-colors duration-300 hover:text-paper peer-checked:bg-paper peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
                    >
                      {c.id === "email" ? <MailIcon /> : <PhoneIcon />}
                      {c.label}
                    </label>
                  </span>
                ))}
              </div>
              {draft.channel === "email" ? (
                <LineField id="email" label="Correo electrónico" error={error?.field === "email" ? error.message : ""}>
                  <input
                    ref={emailRef}
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nombre@empresa.cl"
                    maxLength={LIMITS.email}
                    value={draft.email}
                    onChange={(e) => update({ email: e.target.value })}
                    aria-invalid={error?.field === "email"}
                    aria-describedby="email-error"
                    className={lineInput}
                  />
                </LineField>
              ) : (
                <LineField id="phone" label="Teléfono" prefix="+56" error={error?.field === "phone" ? error.message : ""}>
                  <input
                    ref={phoneRef}
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="9 1234 5678"
                    value={formatPhone(draft.phone)}
                    onChange={(e) => update({ phone: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                    aria-invalid={error?.field === "phone"}
                    aria-describedby="phone-error"
                    className={lineInput}
                  />
                </LineField>
              )}
              {/* On desktop this note sits in the text column instead. */}
              <PrivacyNote className="text-[13px] lg:hidden" />
            </>
          )}

          {shown === 3 && (
            <>
              {/* No subtitle here: the "Editar" links explain themselves and the step needs the room. */}
              <StepTitle ref={headingRef} title="Revisa y envía" />
              <dl className="m-0 grid grid-cols-1 border-t border-paper/12 sm:grid-cols-2 sm:gap-x-6">
                <SummaryCell label="Servicios" onEdit={() => goTo(0)} wide>
                  <span className="flex flex-wrap gap-1.5">
                    {draft.services.map((i) => (
                      <span
                        key={i}
                        title={services[i].name}
                        className="rounded-full border border-paper/22 px-2.5 py-1 font-mono text-xs text-fog-3"
                      >
                        {services[i].short}
                      </span>
                    ))}
                  </span>
                </SummaryCell>
                <SummaryCell label="Nombre" onEdit={() => goTo(1)}>
                  {draft.name.trim()}
                  {draft.company.trim() && <span className="block text-[13px] text-mist">{draft.company.trim()}</span>}
                </SummaryCell>
                <SummaryCell label="Contacto" onEdit={() => goTo(2)}>
                  {contactValue(draft)}
                  <span className="block text-[13px] text-mist">
                    Prefiere {draft.channel === "email" ? "correo" : "teléfono"}
                  </span>
                </SummaryCell>
                {draft.details.trim() && (
                  <SummaryCell label="Detalles" onEdit={() => goTo(0)} wide>
                    <span className="line-clamp-1 text-sm text-fog-4 sm:line-clamp-2">{draft.details.trim()}</span>
                  </SummaryCell>
                )}
              </dl>
              {turnstileSiteKey && <div ref={turnstileBoxRef} />}
              {sendError && (
                <p role="alert" className="m-0 text-sm leading-snug text-[#F98B8B]">
                  {sendError}
                </p>
              )}
            </>
          )}

          {shown === DONE && (
            <div className="flex flex-1 flex-col items-start justify-center gap-5 py-2">
              <svg viewBox="0 0 364 364" width="72" height="72" aria-hidden="true">
                <g fill="#F5F7FA">
                  {MARK_QUADRANTS.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      className="done-quadrant"
                      style={
                        {
                          "--dx": QUADRANT_MOTION[i].dx,
                          "--dy": QUADRANT_MOTION[i].dy,
                          animationDelay: QUADRANT_MOTION[i].delay,
                        } as CSSProperties
                      }
                    />
                  ))}
                </g>
                <circle className="anim-pulse-ring" cx="182" cy="182" r="9" fill="var(--color-accent)" />
                <circle cx="182" cy="182" r="7" fill="var(--color-accent)" />
              </svg>
              <h3
                ref={headingRef}
                tabIndex={-1}
                className="m-0 text-[28px] font-semibold leading-[1.08] tracking-[-.03em] outline-none sm:text-[36px]"
              >
                Gracias, {sent?.name.trim().split(/\s+/)[0]}. Recibimos tu solicitud.
              </h3>
              <p className="m-0 max-w-[54ch] text-base leading-[1.6] text-mist sm:text-[17px]">
                Te contactaremos {sent?.channel === "email" ? "por correo a " : "por teléfono al "}
                <b className="font-medium text-paper">{sent ? contactValue(sent) : ""}</b> con una propuesta inicial y los
                siguientes pasos.
              </p>
              <button
                type="button"
                onClick={restart}
                className="inline-flex min-h-[46px] cursor-pointer items-center rounded-full border border-paper/22 px-5 text-[15px] text-paper transition-colors duration-300 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
              >
                Enviar otra solicitud
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer navigation: thumb-reach bar on phones, split layout from tablet up. */}
      {step !== DONE && (
        <div className="mt-auto flex items-center gap-2.5 sm:justify-between">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              aria-label="Atrás"
              className={[
                "inline-flex size-[52px] flex-none cursor-pointer items-center justify-center gap-2.5 rounded-full border border-paper/22 text-lg text-mist transition-colors hover:border-paper/55 hover:text-paper",
                "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent",
                "sm:size-auto sm:min-h-11 sm:border-0 sm:px-1 sm:text-[15px]",
              ].join(" ")}
            >
              <span aria-hidden="true">←</span>
              <span className="hidden sm:inline">Atrás</span>
            </button>
          )}
          <div className="flex flex-1 items-center justify-end gap-[18px] sm:ml-auto sm:flex-none">
            {(step === 1 || step === 2) && (
              <span className="font-mono text-xs text-dim max-sm:hidden">
                <kbd className="rounded-[5px] border border-paper/22 px-1.5 py-0.5 font-mono text-[11px] text-mist">Enter</kbd> para
                continuar
              </span>
            )}
            <button
              type="submit"
              aria-disabled={stepInvalid || sending}
              className={[
                "group inline-flex min-h-[52px] flex-1 cursor-pointer items-center justify-center gap-3 rounded-full bg-paper px-[22px] text-base font-medium tracking-[-.005em] text-ink sm:flex-none sm:px-[26px]",
                "transition-[background-color,opacity,transform] duration-300 hover:bg-white active:scale-[.98]",
                "focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent",
                stepInvalid ? "opacity-40" : "",
                sending ? "cursor-wait" : "",
              ].join(" ")}
            >
              {sending && (
                <span aria-hidden="true" className="spinner size-4 rounded-full border-2 border-ink/25 border-t-ink" />
              )}
              {nextLabel}
              {!sending && (
                <span
                  aria-hidden="true"
                  className={`transition-transform duration-[350ms] ease-out-soft ${stepInvalid ? "" : "group-hover:translate-x-[5px]"}`}
                >
                  →
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {live}
      </p>
    </form>
  );
}

/* ---------------------------------------------------------------------------
   Small building blocks
   --------------------------------------------------------------------------- */

const lineInput =
  "min-w-0 flex-1 border-0 bg-transparent pt-1.5 pb-2.5 text-[22px] font-medium tracking-[-.02em] text-paper outline-none placeholder:text-[#5E6878] sm:text-[26px]";

/** "Tus datos llegan directo…" note. Shown in step 3 below desktop, and in the text column on desktop. */
export function PrivacyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`m-0 flex items-start gap-2.5 leading-[1.55] text-dim ${className}`}>
      <LockIcon />
      Tus datos llegan directo al equipo de BICOVEX y no se comparten con nadie más.
    </p>
  );
}

function OptionalTag() {
  return (
    <span className="rounded-full border border-paper/12 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[.1em] text-dim">
      Opcional
    </span>
  );
}

function StepTitle({ title, children, ref }: { title: string; children?: React.ReactNode; ref: React.Ref<HTMLHeadingElement> }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3
        ref={ref}
        tabIndex={-1}
        className="m-0 text-[26px] font-semibold leading-[1.08] tracking-[-.03em] outline-none sm:text-[32px]"
      >
        {title}
      </h3>
      {children && <p className="m-0 text-[15px] leading-normal text-mist">{children}</p>}
    </div>
  );
}

function LineField({
  id,
  label,
  optional,
  prefix,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  prefix?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-center justify-between font-mono text-xs uppercase tracking-[.12em] text-mist">
        {label}
        {optional && <OptionalTag />}
      </label>
      <div
        className={`flex items-baseline gap-2.5 border-b transition-[border-color,box-shadow] duration-300 ${
          error
            ? "border-[#F98B8B] shadow-[0_1px_0_0_#F98B8B]"
            : "border-paper/22 focus-within:border-accent focus-within:shadow-[0_1px_0_0_var(--color-accent)]"
        }`}
      >
        {prefix && (
          <span aria-hidden="true" className="font-mono text-base text-mist">
            {prefix}
          </span>
        )}
        {children}
      </div>
      {error !== undefined && <FieldErrorText id={`${id}-error`} message={error} />}
    </div>
  );
}

function FieldErrorText({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} aria-live="polite" className="m-0 min-h-[18px] text-[13px] leading-snug text-[#F98B8B]">
      {message}
    </p>
  );
}

function SummaryCell({
  label,
  onEdit,
  wide,
  children,
}: {
  label: string;
  onEdit: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 border-b border-paper/12 py-2.5 sm:gap-1.5 sm:py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <dt className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[.12em] text-mist">
        {label}
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${label.toLowerCase()}`}
          className="cursor-pointer py-0.5 font-sans text-[13px] tracking-normal normal-case text-mist underline-offset-[3px] transition-colors hover:text-paper hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          Editar
        </button>
      </dt>
      <dd className="m-0 text-base leading-[1.45] break-words text-paper">{children}</dd>
    </div>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  "aria-hidden": true,
} as const;

function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg {...iconProps} strokeLinejoin="round">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg {...iconProps} className="mt-0.5 flex-none">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
