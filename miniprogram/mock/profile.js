"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyerRoleOptions = exports.profileAvatarOptions = exports.seededUserProfile = void 0;
exports.buildProfileDraft = buildProfileDraft;
exports.isEnterpriseProfileComplete = isEnterpriseProfileComplete;
exports.getProfileCompletionTips = getProfileCompletionTips;
exports.getProfilePageData = getProfilePageData;
const routes_1 = require("../constants/routes");
exports.seededUserProfile = {
    id: "user-seed-001",
    avatar: "李",
    nickname: "李工",
    phone: "15000039331",
    companyName: "杭州城建华东项目部",
    buyerRole: "项目采购主管",
    couponCount: 9,
    defaultAddressId: "addr-001",
};
exports.profileAvatarOptions = [
    { value: "李", label: "李工" },
    { value: "王", label: "王工" },
    { value: "周", label: "周工" },
    { value: "赵", label: "赵工" },
    { value: "苏", label: "苏工" },
];
exports.buyerRoleOptions = [
    {
        value: "项目采购主管",
        label: "采购主管",
        description: "统筹项目材料采购计划与供应节奏。",
    },
    {
        value: "材料工程师",
        label: "材料工程师",
        description: "负责规格确认、选型与供应商比价。",
    },
    {
        value: "成本经理",
        label: "成本经理",
        description: "关注合同价格、费用归集和成本控制。",
    },
    {
        value: "仓配负责人",
        label: "仓配负责人",
        description: "负责到货验收、入库和现场调拨。",
    },
];
function buildProfileDraft(userProfile) {
    return {
        avatar: userProfile.avatar,
        nickname: userProfile.nickname,
        phone: userProfile.phone,
        companyName: userProfile.companyName,
        buyerRole: userProfile.buyerRole,
    };
}
function isEnterpriseProfileComplete(profileDraft) {
    return Boolean(profileDraft.companyName.trim() && profileDraft.buyerRole.trim());
}
function getProfileCompletionTips(profileDraft) {
    const tips = [];
    if (!profileDraft.companyName.trim()) {
        tips.push("补充企业名称后，我的页和订单场景可更清晰展示采购主体。");
    }
    if (!profileDraft.buyerRole.trim()) {
        tips.push("补充采购身份后，客服和售后场景可更准确识别你的角色。");
    }
    return tips;
}
function countOrdersByStatus(orders, status) {
    return orders.filter((item) => item.status === status).length;
}
function buildServiceSections(params) {
    const { favoriteCount, addressCount, invoiceCount, couponCount, buyerRole, afterSaleCount } = params;
    return [
        {
            title: "采购服务",
            items: [
                {
                    label: "发票中心",
                    description: "电子/纸质发票申请与记录管理。",
                    route: routes_1.ROUTES.invoice,
                    badge: invoiceCount ? `${invoiceCount} 条记录` : "待补充记录",
                },
                {
                    label: "收货地址",
                    description: "维护常用工地地址并支持结算回流。",
                    route: routes_1.ROUTES.addressList,
                    badge: addressCount ? `${addressCount} 个地址` : "去新增地址",
                },
                {
                    label: "收藏夹",
                    description: "回看已收藏商品并继续加购。",
                    route: routes_1.ROUTES.favorite,
                    badge: favoriteCount ? `${favoriteCount} 件收藏` : "暂无收藏",
                },
                {
                    label: "优惠券",
                    description: "查看可用券并在结算前完成选择。",
                    route: routes_1.ROUTES.coupon,
                    badge: couponCount ? `${couponCount} 张可用` : "暂无可用券",
                    emphasis: couponCount > 0,
                    developing: true,
                },
            ],
        },
        {
            title: "账号与售后",
            items: [
                {
                    label: "个人信息",
                    description: "维护手机号、企业名称和采购身份。",
                    route: routes_1.ROUTES.profileInfo,
                    badge: buyerRole,
                },
                {
                    label: "客服系统",
                    description: "在线咨询、常见问题和投诉建议入口。",
                    route: routes_1.ROUTES.supportIndex,
                    badge: afterSaleCount ? `${afterSaleCount} 笔售后跟进` : "在线咨询",
                    emphasis: afterSaleCount > 0,
                },
            ],
        },
    ];
}
function getProfilePageData(params) {
    const { orders, favoriteCount, addressCount, invoiceCount, defaultAddressText, userProfile } = params;
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
