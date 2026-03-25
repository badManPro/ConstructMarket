import { ROUTES } from "../../constants/routes";
import { supportCards, supportServiceTime } from "../../mock/support";
import type { SupportCard } from "../../types/models";
import { navigateToRoute } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";

Page({
  data: {
    status: "loading" as PageStatus,
    cards: [] as SupportCard[],
    serviceTime: supportServiceTime,
    serviceNote: "商品详情页和订单详情页都可以直接带上下文进入在线咨询。",
  },
  onLoad(options: Record<string, string | undefined>) {
    this.hydratePage(getPageStatusOverride(options.state));
  },
  hydratePage(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        cards: supportCards,
      });
      return;
    }

    this.setData({
      status: "ready",
      cards: supportCards,
    });
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.profile);
      },
    });
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
  handleGoFaq() {
    navigateToRoute(ROUTES.supportFaq);
  },
  handleGoComplaint() {
    navigateToRoute(ROUTES.supportComplaint);
  },
  handleRetry() {
    this.setData({
      status: "loading",
    });
    this.hydratePage();
  },
});
