"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seededInvoiceRecords = exports.tradeRegionOptions = exports.defaultInvoiceDraft = exports.tradePaymentMethods = exports.tradeCoupons = exports.tradeAddresses = void 0;
exports.getDefaultAddress = getDefaultAddress;
exports.getAddressById = getAddressById;
exports.getCouponById = getCouponById;
exports.getRecommendedCoupon = getRecommendedCoupon;
exports.tradeAddresses = [
    {
        id: "addr-sh-001",
        receiver: "王工",
        phone: "13800138000",
        province: "上海市",
        city: "上海市",
        district: "浦东新区",
        detail: "张江建材产业园 8 号仓 2 楼",
        tag: "项目部",
        isDefault: true,
    },
    {
        id: "addr-js-002",
        receiver: "李经理",
        phone: "13900139000",
        province: "江苏省",
        city: "苏州市",
        district: "工业园区",
        detail: "金鸡湖大道 188 号总包临建仓",
        tag: "工地",
        isDefault: false,
    },
];
exports.tradeCoupons = [
    {
        id: "coupon-300",
        name: "满 5000 减 300 采购券",
        type: "cash",
        amount: 300,
        threshold: 5000,
        status: "available",
        validFrom: "2026-03-01",
        validTo: "2026-04-30",
        scopeDesc: "适用于主材、辅材现货商品",
    },
    {
        id: "coupon-800",
        name: "满 10000 减 800 大单券",
        type: "cash",
        amount: 800,
        threshold: 10000,
        status: "available",
        validFrom: "2026-03-01",
        validTo: "2026-04-30",
        scopeDesc: "适用于企业采购大单",
    },
    {
        id: "coupon-expired",
        name: "已过期运费补贴券",
        type: "cash",
        amount: 50,
        threshold: 1000,
        status: "expired",
        validFrom: "2026-01-01",
        validTo: "2026-02-01",
        scopeDesc: "已失效，仅用于展示不可用态",
    },
];
exports.tradePaymentMethods = [
    {
        code: "wechat",
        name: "微信支付",
        enabled: true,
        desc: "默认推荐，适合快速完成小额和中额采购。",
    },
    {
        code: "alipay",
        name: "支付宝",
        enabled: true,
        desc: "便于跨项目团队使用统一支付账户。",
    },
    {
        code: "unionpay",
        name: "银联转账",
        enabled: true,
        desc: "适合企业财务统一走对公结算流程。",
    },
];
exports.defaultInvoiceDraft = {
    type: "electronic",
    title: "上海构市建材工程有限公司",
    taxNo: "91310120MA1K000000",
    email: "finance@constructmarket.local",
};
exports.tradeRegionOptions = [
    {
        value: "sh-pudong",
        label: "上海市 上海市 浦东新区",
        province: "上海市",
        city: "上海市",
        district: "浦东新区",
    },
    {
        value: "js-suzhou",
        label: "江苏省 苏州市 工业园区",
        province: "江苏省",
        city: "苏州市",
        district: "工业园区",
    },
    {
        value: "zj-hangzhou",
        label: "浙江省 杭州市 余杭区",
        province: "浙江省",
        city: "杭州市",
        district: "余杭区",
    },
];
exports.seededInvoiceRecords = [
    {
        id: "invoice-record-001",
        orderNo: "CM2603231003",
        type: "electronic",
        status: "issued",
        title: "上海构市建材工程有限公司",
        taxNo: "91310120MA1K000000",
        email: "finance@constructmarket.local",
        receiverName: "王工",
        receiverPhone: "13800138000",
        receiverAddress: "上海市 上海市 浦东新区 张江建材产业园 8 号仓 2 楼",
        applyAt: "2026-03-24 09:20",
    },
    {
        id: "invoice-record-002",
        orderNo: "CM2603251002",
        type: "paper",
        status: "applying",
        title: "苏州项目临建总包部",
        taxNo: "91320500MA10000000",
        email: "procurement@constructmarket.local",
        receiverName: "李经理",
        receiverPhone: "13900139000",
        receiverAddress: "江苏省 苏州市 工业园区 金鸡湖大道 188 号总包临建仓",
        applyAt: "2026-03-25 16:10",
    },
];
function getDefaultAddress() {
    return exports.tradeAddresses.find((item) => item.isDefault) ?? exports.tradeAddresses[0] ?? null;
}
function getAddressById(addressId) {
    if (!addressId)
        return null;
    return exports.tradeAddresses.find((item) => item.id === addressId) ?? null;
}
function getCouponById(couponId) {
    if (!couponId)
        return null;
    return exports.tradeCoupons.find((item) => item.id === couponId) ?? null;
}
function getRecommendedCoupon(subtotal) {
    return (exports.tradeCoupons
        .filter((item) => item.status === "available" && subtotal >= item.threshold)
        .sort((left, right) => right.amount - left.amount)[0] ?? null);
}
