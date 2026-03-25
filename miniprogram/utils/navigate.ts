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
