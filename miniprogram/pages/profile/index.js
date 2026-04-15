"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const profile_1 = require("../../mock/profile");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const storage_1 = require("../../utils/storage");
function formatDefaultAddress(addresses) {
    const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
    if (!defaultAddress) {
        return "默认地址：暂未设置收货地址";
    }
    return `默认地址：${defaultAddress.city}${defaultAddress.district}${defaultAddress.detail}`;
}
Page({
    data: {
        status: "loading",
        mockState: "",
        profileInfoRoute: routes_1.ROUTES.profileInfo,
        userProfile: null,
        couponNote: "",
        defaultAddressText: "",
        assetStats: [],
        orderShortcuts: [],
        serviceSections: [],
    },
    onLoad(options) {
        const mockState = (0, page_1.getPageStatusOverride)(options.state);
        this.setData({
            mockState: mockState ?? "",
        });
        this.hydratePage(mockState);
    },
    onShow() {
        if (!this.data.mockState) {
            this.hydratePage();
        }
    },
    hydratePage(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                userProfile: null,
                couponNote: "",
                defaultAddressText: "",
                assetStats: [],
                orderShortcuts: [],
                serviceSections: [],
            });
            return;
        }
        try {
            const orders = (0, storage_1.getOrders)();
            const favoriteCount = (0, storage_1.getFavoriteIds)().length;
            const addresses = (0, storage_1.getAddresses)();
            const invoiceCount = (0, storage_1.getInvoiceRecords)().length;
            const pageData = (0, profile_1.getProfilePageData)({
                orders,
                favoriteCount,
                addressCount: addresses.length,
                invoiceCount,
                defaultAddressText: formatDefaultAddress(addresses),
                userProfile: (0, storage_1.getUserProfile)(),
            });
            this.setData({
                status: pageData.serviceSections.length ? "ready" : "empty",
                userProfile: pageData.userProfile,
                couponNote: pageData.couponNote,
                defaultAddressText: pageData.defaultAddressText,
                assetStats: pageData.assetStats,
                orderShortcuts: pageData.orderShortcuts,
                serviceSections: pageData.serviceSections,
            });
        }
        catch {
            this.setData({
                status: "error",
                userProfile: null,
                couponNote: "",
                defaultAddressText: "",
                assetStats: [],
                orderShortcuts: [],
                serviceSections: [],
            });
        }
    },
    handleRouteTap(event) {
        const { route } = event.currentTarget.dataset;
        if (!route)
            return;
        (0, navigate_1.navigateToRoute)(route);
    },
    handleViewAllOrders() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.orderList);
    },
    handleOrderTap(event) {
        const { filter } = event.currentTarget.dataset;
        if (!filter)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.orderList, {
            filter,
        });
    },
    handleRetry() {
        this.setData({
            mockState: "",
            status: "loading",
        });
        this.hydratePage();
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
});
