import { ROUTES } from "../constants/routes";
import type { RouteLink } from "../types/models";

export const cartSnapshot = [
  { label: "待结算商品", value: "3" },
  { label: "失效商品", value: "1" },
  { label: "Mock 合计", value: "¥8,420" },
];

export const cartLinks: RouteLink[] = [
  { label: "去结算", description: "验证地址、发票、优惠券和支付方式。", route: ROUTES.checkout },
  { label: "订单列表", description: "查看本地状态机流转后的订单。", route: ROUTES.orderList },
  { label: "优惠券页", description: "检查可用和不可用券展示。", route: ROUTES.coupon },
];
