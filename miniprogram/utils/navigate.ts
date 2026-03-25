import { TAB_ROUTES } from "../constants/routes";

export function navigateToRoute(route: string) {
  const normalized = route.startsWith("/") ? route : `/${route}`;
  const routeKey = normalized.slice(1);

  if (TAB_ROUTES.has(routeKey)) {
    wx.switchTab({ url: normalized });
    return;
  }

  wx.navigateTo({ url: normalized });
}

export function navigateWithParams(
  route: string,
  params: Record<string, string | number | boolean | undefined> = {},
) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  const target = query ? `${route}?${query}` : route;
  navigateToRoute(target);
}
