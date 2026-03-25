import { cartLinks, cartSnapshot } from "../../mock/cart";
import { navigateToRoute } from "../../utils/navigate";

Page({
  data: {
    title: "购物车与待下单容器",
    summary: "当前先固定购物车主状态、金额摘要和结算入口，后续接入数量步进器和失效商品区。",
    snapshot: cartSnapshot,
    links: cartLinks,
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
});
