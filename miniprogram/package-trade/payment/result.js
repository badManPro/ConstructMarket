"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("../../constants/routes");
const navigate_1 = require("../../utils/navigate");
const order_1 = require("../../utils/order");
const storage_1 = require("../../utils/storage");
function getResultCopy(status) {
    if (status === "success") {
        return {
            title: "支付成功",
            summary: "本次支付已完成，本地订单已进入待收货，可继续查看订单详情。",
            actionText: "查看订单",
            reasonText: "",
        };
    }
    if (status === "failed") {
        return {
            title: "支付失败",
            summary: "支付未完成，订单仍保留在待支付列表，可重新发起支付。",
            actionText: "重新支付",
            reasonText: "当前为 Mock 失败态，可继续重试或切换结果。",
        };
    }
    return {
        title: "支付处理中",
        summary: "支付结果确认中，订单仍保留在待支付列表，可稍后查看或手动切换结果。",
        actionText: "查看订单",
        reasonText: "当前为本地处理中态，用于联调支付结果回流。",
    };
}
Page({
    data: {
        status: "processing",
        title: "支付处理中",
        summary: "当前订单已写入本地状态，正在等待支付结果。",
        actionText: "查看订单",
        orderNo: "",
        amount: "0",
        orderId: "",
        paymentMethod: "wechat",
        paymentMethodText: "微信支付",
        reasonText: "",
    },
    onLoad(options) {
        this.setData({
            orderNo: options.orderNo ?? "",
            amount: options.amount ?? "0",
            orderId: options.orderId ?? "",
            paymentMethod: options.paymentMethod ?? "wechat",
        });
        const status = options.status === "failed" || options.status === "success" ? options.status : "processing";
        this.applyResult(status);
    },
    applyResult(status, showToast = false) {
        const updatedOrder = this.data.orderId ? (0, storage_1.setOrderPaymentState)(this.data.orderId, status) : null;
        const order = updatedOrder ?? (0, storage_1.getOrderById)(this.data.orderId);
        const resultCopy = getResultCopy(status);
        const paymentMethod = order?.paymentMethod ?? this.data.paymentMethod;
        this.setData({
            status,
            title: resultCopy.title,
            summary: resultCopy.summary,
            actionText: resultCopy.actionText,
            reasonText: resultCopy.reasonText,
            orderNo: order?.orderNo ?? this.data.orderNo,
            amount: order ? String(order.amount.payable) : this.data.amount,
            paymentMethod,
            paymentMethodText: (0, order_1.getOrderPaymentText)(paymentMethod),
        });
        if (!showToast)
            return;
        wx.showToast({
            title: status === "success" ? "支付已更新为成功" : status === "failed" ? "已切换为支付失败" : "已进入支付处理中",
            icon: "none",
        });
    },
    handleGoHome() {
        (0, navigate_1.navigateToRoute)(routes_1.ROUTES.home);
    },
    handleGoOrder() {
        if (!this.data.orderId || this.data.status === "failed") {
            (0, navigate_1.navigateToRoute)(routes_1.ROUTES.orderList);
            return;
        }
        (0, navigate_1.navigateWithParams)(routes_1.ROUTES.orderDetail, {
            id: this.data.orderId,
        });
    },
    handlePrimaryAction() {
        if (this.data.status === "failed") {
            this.applyResult("processing", true);
            return;
        }
        this.handleGoOrder();
    },
    handleResultSwitch(event) {
        const { status } = event.currentTarget.dataset;
        if (!status)
            return;
        this.applyResult(status, true);
    },
});
