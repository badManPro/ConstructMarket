"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAB_ROUTES = exports.ROUTES = void 0;
exports.ROUTES = {
    home: "/pages/home/index",
    category: "/pages/category/index",
    cart: "/pages/cart/index",
    profile: "/pages/profile/index",
    searchResult: "/package-catalog/search/result",
    productDetail: "/package-catalog/product/detail",
    articleList: "/package-content/article/list",
    articleDetail: "/package-content/article/detail",
    webview: "/package-content/webview/index",
    checkout: "/package-trade/checkout/index",
    paymentResult: "/package-trade/payment/result",
    orderList: "/package-trade/order/list",
    orderDetail: "/package-trade/order/detail",
    invoice: "/package-profile/profile/invoice",
    addressList: "/package-profile/profile/address/list",
    addressEdit: "/package-profile/profile/address/edit",
    favorite: "/package-profile/profile/favorite",
    coupon: "/package-profile/profile/coupon",
    profileInfo: "/package-profile/profile/info",
    supportIndex: "/package-support/support/index",
    supportChat: "/package-support/support/chat",
    supportFaq: "/package-support/support/faq",
    supportComplaint: "/package-support/support/complaint",
};
exports.TAB_ROUTES = new Set([
    "pages/home/index",
    "pages/category/index",
    "pages/cart/index",
    "pages/profile/index",
]);
