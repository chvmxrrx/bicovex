/**
 * Cloudflare Turnstile, browser side. The widget runs on the review step and hands
 * back a one-time token that the API route verifies with Cloudflare before sending.
 * The site key comes from NEXT_SITE_KEY, read on the server and passed to the form as a prop.
 * With no site key configured (local development) the widget is skipped entirely.
 */

type TurnstileApi = {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<TurnstileApi> | null = null;

/** Loads the Turnstile script once and resolves with its API. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile")));
      s.onerror = () => {
        loading = null;
        s.remove();
        reject(new Error("turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}
