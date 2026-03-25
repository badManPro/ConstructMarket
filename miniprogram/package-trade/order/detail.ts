import { ROUTES } from "../../constants/routes";
import type { Order } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getOrderPaymentText, getOrderPrimaryActionText, getOrderStatusDesc, getOrderStatusText } from "../../utils/order";
import { getOrderById, getOrderByNo, markOrderAfterSale, markOrderPaid, markOrderReceived } from "../../utils/storage";
import { formatAddressText, formatInvoiceText } from "../../utils/trade";

type PageStatus = "loading" | "ready" | "empty" | "error";

Page({
  data: {
    status: "loading" as PageStatus,
    orderId: "",
    orderNo: "",
    order: null as Order | null,
    statusText: "",
    statusDesc: "",
    addressText: "",
    paymentText: "",
    invoiceText: "",
    primaryActionText: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      orderId: options.id ?? "",
      orderNo: options.orderNo ?? "",
    });
  },
  onShow() {
    this.hydrateOrder();
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.orderList);
      },
    });
  },
  hydrateOrder() {
    try {
      const order = getOrderById(this.data.orderId) ?? getOrderByNo(this.data.orderNo);

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
        statusText: getOrderStatusText(order.status),
        statusDesc: getOrderStatusDesc(order),
        addressText: formatAddressText(order.address),
        paymentText: getOrderPaymentText(order.paymentMethod),
        invoiceText: formatInvoiceText(order.invoiceInfo),
        primaryActionText: getOrderPrimaryActionText(order),
      });
    } catch {
      this.setData({
        status: "error",
      });
    }
  },
  handlePrimaryAction() {
    const order = this.data.order;
    if (!order) return;

    if (order.status === "pending_payment") {
      const updatedOrder = markOrderPaid(order.id);
      if (!updatedOrder) return;
      navigateWithParams(ROUTES.paymentResult, {
        status: "success",
        orderNo: updatedOrder.orderNo,
        amount: updatedOrder.amount.payable,
        orderId: updatedOrder.id,
      });
      return;
    }

    if (order.status === "pending_receipt") {
      markOrderReceived(order.id);
      wx.showToast({
        title: "已确认收货",
        icon: "success",
      });
      this.hydrateOrder();
      return;
    }

    if (order.status === "completed") {
      markOrderAfterSale(order.id);
      wx.showToast({
        title: "已提交售后申请",
        icon: "success",
      });
      this.hydrateOrder();
      return;
    }

    if (order.status === "cancelled") {
      navigateToRoute(ROUTES.orderList);
      return;
    }

    navigateToRoute(ROUTES.supportChat);
  },
  handleContactService() {
    navigateToRoute(ROUTES.supportChat);
  },
  handleGoOrderList() {
    navigateToRoute(ROUTES.orderList);
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleRetry() {
    this.hydrateOrder();
  },
});
