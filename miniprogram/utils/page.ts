export type PageStatus = "loading" | "ready" | "empty" | "error" | "offline";

const PAGE_STATUS_SET = new Set<PageStatus>(["loading", "ready", "empty", "error", "offline"]);

export function getPageStatusOverride(state?: string) {
  if (!state) return null;
  return PAGE_STATUS_SET.has(state as PageStatus) ? (state as PageStatus) : null;
}
