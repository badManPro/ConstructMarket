import { ROUTES } from "../constants/routes";
import type { RouteLink } from "../types/models";

export const homeHighlights = [
  { label: "主包页面", value: "4" },
  { label: "分包页面", value: "18" },
  { label: "核心链路", value: "5" },
];

export const homeSections: Array<{ title: string; links: RouteLink[] }> = [
  {
    title: "浏览与选型",
    links: [
      { label: "搜索结果", description: "关键词、排序、筛选和结果容器。", route: ROUTES.searchResult },
      { label: "商品详情", description: "规格、价格、客服与购买动作。", route: ROUTES.productDetail },
      { label: "建材资讯", description: "资讯列表和详情内容。", route: ROUTES.articleList },
    ],
  },
  {
    title: "交易闭环",
    links: [
      { label: "结算页", description: "地址、发票、优惠券和支付方式。", route: ROUTES.checkout },
      { label: "支付结果", description: "支付成功与失败回流。", route: ROUTES.paymentResult },
      { label: "订单列表", description: "按状态查看订单。", route: ROUTES.orderList },
    ],
  },
  {
    title: "个人中心与服务",
    links: [
      { label: "发票中心", description: "电子发票、纸质发票和管理。", route: ROUTES.invoice },
      { label: "地址管理", description: "地址列表和编辑回流。", route: ROUTES.addressList },
      { label: "客服系统", description: "在线咨询、FAQ、投诉建议。", route: ROUTES.supportIndex },
    ],
  },
];
