import { profileLinks } from "../../mock/profile";
import { navigateToRoute } from "../../utils/navigate";

Page({
  data: {
    title: "个人中心与服务入口",
    summary: "当前集中承载订单、发票、地址、收藏、优惠券、资料和客服入口，后续接入用户信息卡和订单摘要。",
    links: profileLinks,
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
});
