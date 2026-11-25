/** Fired when another section asks the contact form to mark a service. `detail` is the service index. */
export const PRESELECT_EVENT = "bicovex:preselect";

export function preselectService(index: number) {
  window.dispatchEvent(new CustomEvent<number>(PRESELECT_EVENT, { detail: index }));
}
