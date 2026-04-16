import { ROUTES } from "../../constants/routes";
import { navigateToRoute } from "../../utils/navigate";
import type { PageStatus } from "../../utils/page";

function decodePageParam(value?: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return "";
  }

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isValidWebUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

Page({
  data: {
    status: "loading" as PageStatus,
    title: "活动详情",
    url: "",
    errorMessage: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    const title = decodePageParam(options.title) || "活动详情";
    const url = decodePageParam(options.url);

    wx.setNavigationBarTitle({
      title,
    });

    if (!isValidWebUrl(url)) {
      this.setData({
        status: "error",
        title,
        url: "",
        errorMessage: "链接无效，暂时无法打开外部页面。",
      });
      return;
    }

    this.setData({
      status: "ready",
      title,
      url,
      errorMessage: "",
    });
  },
  handleLoadError() {
    this.setData({
      status: "error",
      errorMessage: "页面加载失败，请确认业务域名已配置后再重试。",
    });
  },
  handleRetry() {
    if (!isValidWebUrl(this.data.url)) {
      return;
    }

    this.setData({
      status: "ready",
      errorMessage: "",
    });
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.home);
      },
    });
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
});
