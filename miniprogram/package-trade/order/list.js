"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const order_1 = require("../../utils/order");
const storage_1 = require("../../utils/storage");
Page({
    data: {
        status: "loading",
        mockState: null,
        currentFilter: "all",
        tabs: [],
        orders: [],
        filteredOrders: [],
    },
    onLoad(options) {
        const filter = options.filter;
        this.setData({
            mockState: (0, page_1.getPageStatusOverride)(options.state),
            currentFilter: filter && order_1.orderFilterOptions.some((item) => item.value === filter) ? filter : "all",
        });
    },
    onShow() {
        this.hydrateOrders(this.data.mockState);
    },
    hydrateOrders(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
                tabs: [],
                orders: [],
                filteredOrders: [],
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                tabs: [],
                orders: [],
                filteredOrders: [],
            });
            return;
        }
        try {
            const orders = (0, storage_1.getOrders)().map((order) => ({
                ...order,
                statusText: (0, order_1.getOrderStatusText)(order.status),
                statusDesc: (0, order_1.getOrderStatusDesc)(order),
                totalQuantity: (0, order_1.getOrderTotalQuantity)(order),
                itemCount: order.items.length,
                primaryItem: order.items[0] ?? null,
            }));
            const tabs = order_1.orderFilterOptions.map((item) => ({
                ...item,
                count: (0, order_1.filterOrdersByStatus)(orders, item.value).length,
            }));
            const filteredOrders = (0, order_1.filterOrdersByStatus)(orders, this.data.currentFilter);
            this.setData({
                status: orders.length ? "ready" : "empty",
                tabs,
                orders,
                filteredOrders,
            });
        }
        catch {
            this.setData({
                status: "error",
            });
        }
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.profile);
            },
        });
    },
    handleFilterTap(event) {
        const { value } = event.currentTarget.dataset;
        if (!value)
            return;
        this.setData({
            currentFilter: value,
            filteredOrders: (0, order_1.filterOrdersByStatus)(this.data.orders, value),
        });
    },
    handleOpenDetail(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.orderDetail, {
            id,
        });
    },
    handleContinuePay(event) {
        const { id } = event.currentTarget.dataset;
        if (!id)
            return;
        const order = this.data.orders.find((item) => item.id === id);
        if (!order) {
            return;
        }
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.paymentResult, {
            status: (0, order_1.getPaymentResultStatusFromOrder)(order),
            orderNo: order.orderNo,
            amount: order.amount.payable,
            orderId: order.id,
            paymentMethod: order.paymentMethod,
        });
    },
    handleViewAll() {
        this.setData({
            currentFilter: "all",
            filteredOrders: (0, order_1.filterOrdersByStatus)(this.data.orders, "all"),
        });
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    handleRetry() {
        this.setData({
            status: "loading",
            mockState: null,
        });
        this.hydrateOrders();
    },
});
