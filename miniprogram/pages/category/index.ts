import { categoryLinks, rootCategories } from "../../mock/category";
import { navigateToRoute } from "../../utils/navigate";

Page({
  data: {
    title: "选型与分类",
    summary: "当前脚手架先固化类目结构和典型跳转，后续接入左侧类目、右侧二级类目和商品宫格。",
    categories: rootCategories,
    links: categoryLinks,
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
});
