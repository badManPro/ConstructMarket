"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartLinks = exports.cartSnapshot = void 0;
const routes_1 = require("../constants/routes");
exports.cartSnapshot = [
    { label: "待结算商品", value: "3" },
    { label: "失效商品", value: "1" },
    { label: "Mock 合计", value: "¥8,420" },
];
exports.cartLinks = [
    { label: "去结算", description: "验证地址、发票、优惠券和支付方式。", route: routes_1.ROUTES.checkout },
    { label: "订单列表", description: "查看本地状态机流转后的订单。", route: routes_1.ROUTES.orderList },
    { label: "优惠券页", description: "检查可用和不可用券展示。", route: routes_1.ROUTES.coupon },
];
