"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appStore = void 0;
exports.appStore = {
    authState: {
        isLoggedIn: false,
        authPlaceholderResult: "unknown",
    },
    cartState: {
        items: [],
        selectedItemIds: [],
        invalidItems: [],
        totalAmount: 0,
    },
    searchState: {
        keyword: "",
        currentCategoryId: "",
        sortOption: "default",
        filters: {},
        recentKeywords: [],
    },
    checkoutState: {
        selectedAddress: null,
        selectedCoupon: null,
        invoiceDraft: {},
        remark: "",
        paymentMethod: "wechat",
    },
    orderState: {
        items: [],
        currentFilter: "all",
    },
    supportState: {
        faqItems: [],
        chatMessages: [],
        draftComplaint: {},
    },
    userProfile: null,
};
