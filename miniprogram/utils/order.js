"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderFilterOptions = void 0;
exports.filterOrdersByStatus = filterOrdersByStatus;
exports.getOrderStatusText = getOrderStatusText;
exports.getOrderStatusDesc = getOrderStatusDesc;
exports.getOrderPaymentText = getOrderPaymentText;
exports.getOrderPaymentStatusText = getOrderPaymentStatusText;
exports.getPaymentResultStatusFromOrder = getPaymentResultStatusFromOrder;
exports.getOrderTotalQuantity = getOrderTotalQuantity;
exports.getOrderPrimaryActionText = getOrderPrimaryActionText;
exports.orderFilterOptions = [
    { value: "all", label: "全部" },
    { value: "pending_payment", label: "待支付" },
    { value: "pending_shipment", label: "待发货" },
    { value: "pending_receipt", label: "待收货" },
    { value: "completed", label: "已完成" },
    { value: "after_sale", label: "售后中" },
];
const ORDER_STATUS_TEXT_MAP = {
    pending_payment: "待支付",
    pending_shipment: "待发货",
    pending_receipt: "待收货",
    completed: "已完成",
    after_sale: "售后中",
    cancelled: "已取消",
};
const PAYMENT_METHOD_TEXT_MAP = {
    wechat: "微信支付",
    alipay: "支付宝",
    unionpay: "银联转账",
};
const PAYMENT_STATUS_TEXT_MAP = {
    unpaid: "待支付",
    paying: "支付处理中",
    success: "已支付",
    failed: "支付失败",
};
function filterOrdersByStatus(orders, filter) {
    if (filter === "all")
        return orders;
    return orders.filter((item) => item.status === filter);
}
function getOrderStatusText(status) {
    return ORDER_STATUS_TEXT_MAP[status] ?? "处理中";
}
function getOrderStatusDesc(order) {
    switch (order.status) {
        case "pending_payment":
            if (order.payStatus === "failed") {
                return "支付未完成，可重新发起支付";
            }
            if (order.payStatus === "paying") {
                return "支付结果确认中，可稍后刷新或继续查看";
            }
            return "订单已创建，请尽快完成支付";
        case "pending_shipment":
            return "商家已确认，等待安排发货";
        case "pending_receipt":
            return "订单已支付成功，等待收货";
        case "completed":
            return "交易已完成，可发起售后";
        case "after_sale":
            return "售后处理中，可联系客服跟进";
        case "cancelled":
            return "订单已取消";
        default:
            return "订单状态处理中";
    }
}
function getOrderPaymentText(code) {
    return PAYMENT_METHOD_TEXT_MAP[code] ?? code;
}
function getOrderPaymentStatusText(payStatus) {
    return PAYMENT_STATUS_TEXT_MAP[payStatus] ?? "支付处理中";
}
function getPaymentResultStatusFromOrder(order) {
    if (order.payStatus === "success") {
        return "success";
    }
    if (order.payStatus === "failed") {
        return "failed";
    }
    return "processing";
}
function getOrderTotalQuantity(order) {
    return order.items.reduce((total, item) => total + item.quantity, 0);
}
function getOrderPrimaryActionText(order) {
    switch (order.status) {
        case "pending_payment":
            return "继续支付";
        case "pending_shipment":
            return "联系客服";
        case "pending_receipt":
            return "确认收货";
        case "completed":
            return "申请售后";
        case "after_sale":
            return "联系客服";
        case "cancelled":
            return "返回订单";
        default:
            return "查看订单";
    }
}
