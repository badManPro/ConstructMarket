import { ROUTES } from "../constants/routes";
import type { Order, RouteLink, UserProfile } from "../types/models";
import type { OrderFilterValue } from "../utils/order";

export type ProfileOrderFilter = Extract<OrderFilterValue, "pending_payment" | "pending_receipt" | "completed" | "after_sale">;

export type ProfileOrderShortcut = {
  filter: ProfileOrderFilter;
  label: string;
  count: number;
  hint: string;
};

export type ProfileServiceItem = RouteLink & {
  badge: string;
  emphasis?: boolean;
};

export type ProfileServiceSection = {
  title: string;
  items: ProfileServiceItem[];
};

export type ProfileAssetStat = {
  label: string;
  value: string;
};

export type ProfilePageData = {
  userProfile: UserProfile;
  couponNote: string;
  defaultAddressText: string;
  assetStats: ProfileAssetStat[];
  orderShortcuts: ProfileOrderShortcut[];
  serviceSections: ProfileServiceSection[];
};

export const seededUserProfile: UserProfile = {
  id: "user-seed-001",
  avatar: "李",
  nickname: "李工",
  phone: "15000039331",
  companyName: "杭州城建华东项目部",
  buyerRole: "项目采购主管",
  couponCount: 9,
  defaultAddressId: "addr-001",
};

function countOrdersByStatus(orders: Order[], status: string) {
  return orders.filter((item) => item.status === status).length;
}

function buildServiceSections(params: {
  favoriteCount: number;
  addressCount: number;
  invoiceCount: number;
  couponCount: number;
  buyerRole: string;
  afterSaleCount: number;
}): ProfileServiceSection[] {
  const { favoriteCount, addressCount, invoiceCount, couponCount, buyerRole, afterSaleCount } = params;

  return [
    {
      title: "采购服务",
      items: [
        {
          label: "发票中心",
          description: "电子/纸质发票申请与记录管理。",
          route: ROUTES.invoice,
          badge: invoiceCount ? `${invoiceCount} 条记录` : "待补充记录",
        },
        {
          label: "收货地址",
          description: "维护常用工地地址并支持结算回流。",
          route: ROUTES.addressList,
          badge: addressCount ? `${addressCount} 个地址` : "去新增地址",
        },
        {
          label: "收藏夹",
          description: "回看已收藏商品并继续加购。",
          route: ROUTES.favorite,
          badge: favoriteCount ? `${favoriteCount} 件收藏` : "暂无收藏",
        },
        {
          label: "优惠券",
          description: "查看可用券并在结算前完成选择。",
          route: ROUTES.coupon,
          badge: couponCount ? `${couponCount} 张可用` : "暂无可用券",
          emphasis: couponCount > 0,
        },
      ],
    },
    {
      title: "账号与售后",
      items: [
        {
          label: "个人信息",
          description: "维护手机号、企业名称和采购身份。",
          route: ROUTES.profileInfo,
          badge: buyerRole,
        },
        {
          label: "客服系统",
          description: "在线咨询、常见问题和投诉建议入口。",
          route: ROUTES.supportIndex,
          badge: afterSaleCount ? `${afterSaleCount} 笔售后跟进` : "在线咨询",
          emphasis: afterSaleCount > 0,
        },
      ],
    },
  ];
}

export function getProfilePageData(params: {
  orders: Order[];
  favoriteCount: number;
  addressCount: number;
  invoiceCount: number;
  defaultAddressText: string;
}): ProfilePageData {
  const { orders, favoriteCount, addressCount, invoiceCount, defaultAddressText } = params;
  const userProfile = {
    ...seededUserProfile,
  };
  const afterSaleCount = countOrdersByStatus(orders, "after_sale");

  return {
    userProfile,
    couponNote: `优惠券：${userProfile.couponCount} 张未使用`,
    defaultAddressText,
    assetStats: [
      { label: "采购订单", value: `${orders.length} 笔` },
      { label: "收藏商品", value: `${favoriteCount} 件` },
      { label: "收货地址", value: `${addressCount} 个` },
    ],
    orderShortcuts: [
      {
        filter: "pending_payment",
        label: "待付款",
        count: countOrdersByStatus(orders, "pending_payment"),
        hint: "尽快支付",
      },
      {
        filter: "pending_receipt",
        label: "待收货",
        count: countOrdersByStatus(orders, "pending_receipt"),
        hint: "跟进到货",
      },
      {
        filter: "completed",
        label: "已完成",
        count: countOrdersByStatus(orders, "completed"),
        hint: "查看归档",
      },
      {
        filter: "after_sale",
        label: "售后",
        count: afterSaleCount,
        hint: "继续跟进",
      },
    ],
    serviceSections: buildServiceSections({
      favoriteCount,
      addressCount,
      invoiceCount,
      couponCount: userProfile.couponCount,
      buyerRole: userProfile.buyerRole,
      afterSaleCount,
    }),
  };
}
