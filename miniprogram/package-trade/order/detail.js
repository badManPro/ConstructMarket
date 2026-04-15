"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const navigate_1 = require("../../utils/navigate");
const page_1 = require("../../utils/page");
const order_1 = require("../../utils/order");
const storage_1 = require("../../utils/storage");
const trade_1 = require("../../utils/trade");
Page({
    data: {
        status: "loading",
        mockState: null,
        orderId: "",
        orderNo: "",
        order: null,
        statusText: "",
        statusDesc: "",
        addressText: "",
        paymentText: "",
        paymentStatusText: "",
        invoiceText: "",
        primaryActionText: "",
    },
    onLoad(options) {
        this.setData({
            orderId: options.id ?? "",
            orderNo: options.orderNo ?? "",
            mockState: (0, page_1.getPageStatusOverride)(options.state),
        });
    },
    onShow() {
        this.hydrateOrder(this.data.mockState);
    },
    handleGoBack() {
        wx.navigateBack({
            fail: () => {
                (0, navigate_1.navigateToRoute)(routes_1.ROUTES.orderList);
            },
        });
    },
    hydrateOrder(override = null) {
        if (override === "loading") {
            this.setData({
                status: "loading",
                order: null,
            });
            return;
        }
        if (override && override !== "ready") {
            this.setData({
                status: override,
                order: null,
            });
            return;
        }
        try {
            const order = (0, storage_1.getOrderById)(this.data.orderId) ?? (0, storage_1.getOrderByNo)(this.data.orderNo);
            if (!order) {
                this.setData({
                    status: "empty",
                    order: null,
                });
                return;
            }
            this.setData({
                status: "ready",
                orderId: order.id,
                orderNo: order.orderNo,
                order,
                statusText: (0, order_1.getOrderStatusText)(order.status),
                statusDesc: (0, order_1.getOrderStatusDesc)(order),
                addressText: (0, trade_1.formatAddressText)(order.address),
                paymentText: (0, order_1.getOrderPaymentText)(order.paymentMethod),
                paymentStatusText: (0, order_1.getOrderPaymentStatusText)(order.payStatus),
                invoiceText: (0, trade_1.formatInvoiceText)(order.invoiceInfo),
                primaryActionText: (0, order_1.getOrderPrimaryActionText)(order),
            });
        }
        catch {
            this.setData({
                status: "error",
            });
        }
    },
    handlePrimaryAction() {
        const order = this.data.order;
        if (!order)
            return;
        if (order.status === "pending_payment") {
            (0, navigate_1.navigateWithParams)(routes_1.ROUTES.paymentResult, {
                status: (0, order_1.getPaymentResultStatusFromOrder)(order),
                orderNo: order.orderNo,
                amount: order.amount.payable,
                orderId: order.id,
                paymentMethod: order.paymentMethod,
            });
            return;
        }
        if (order.status === "pending_receipt") {
            (0, storage_1.markOrderReceived)(order.id);
            wx.showToast({
                title: "已确认收货",
                icon: "success",
            });
            this.hydrateOrder();
            return;
        }
        if (order.status === "completed") {
            (0, storage_1.markOrderAfterSale)(order.id);
            wx.showToast({
                title: "已提交售后申请",
                icon: "success",
            });
            this.hydrateOrder();
            return;
        }
        if (order.status === "cancelled") {
            (0, navigate_1.navigateToRoute)(routes_1.ROUTES.orderList);
            return;
        }
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.supportChat, {
            source: "order",
            orderId: order.id,
            orderNo: order.orderNo,
        });
    },
    handleContactService() {
        const order = this.data.order;
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.supportChat, {
            source: "order",
            orderId: order?.id ?? this.data.orderId,
            orderNo: order?.orderNo ?? this.data.orderNo,
        });
    },
    handleGoOrderList() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.orderList);
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    handleRetry() {
        this.setData({
            status: "loading",
            mockState: null,
        });
        this.hydrateOrder();
    },
});
