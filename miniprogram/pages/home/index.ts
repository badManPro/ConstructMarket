import { homeHighlights, homeSections } from "../../mock/home";
import { navigateToRoute } from "../../utils/navigate";

Page({
  data: {
    title: "建材采购首页",
    summary: "承接搜索、分类、活动商品、热门商品和资讯导流，当前为脚手架阶段的主入口。",
    highlights: homeHighlights,
    sections: homeSections,
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
});
