import { ROUTES } from "../constants/routes";
import type { RouteLink } from "../types/models";

export const profileLinks: RouteLink[] = [
  { label: "订单管理", description: "历史订单状态与继续支付入口。", route: ROUTES.orderList },
  { label: "发票中心", description: "发票申请与记录管理。", route: ROUTES.invoice },
  { label: "收货地址", description: "默认地址和结算回流。", route: ROUTES.addressList },
  { label: "收藏夹", description: "收藏商品与加购。", route: ROUTES.favorite },
  { label: "优惠券", description: "展示可用与不可用优惠券。", route: ROUTES.coupon },
  { label: "个人信息", description: "用户基础资料与企业字段。", route: ROUTES.profileInfo },
  { label: "客服系统", description: "在线咨询、FAQ、投诉建议。", route: ROUTES.supportIndex },
];
