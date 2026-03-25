import { ROUTES } from "../../constants/routes";
import type { Order } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import {
  getOrderPaymentStatusText,
  getOrderPaymentText,
  getOrderPrimaryActionText,
  getOrderStatusDesc,
  getOrderStatusText,
  getPaymentResultStatusFromOrder,
} from "../../utils/order";
import { getOrderById, getOrderByNo, markOrderAfterSale, markOrderReceived } from "../../utils/storage";
import { formatAddressText, formatInvoiceText } from "../../utils/trade";

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: null as PageStatus | null,
    orderId: "",
    orderNo: "",
    order: null as Order | null,
    statusText: "",
    statusDesc: "",
    addressText: "",
    paymentText: "",
    paymentStatusText: "",
    invoiceText: "",
    primaryActionText: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      orderId: options.id ?? "",
      orderNo: options.orderNo ?? "",
      mockState: getPageStatusOverride(options.state),
    });
  },
  onShow() {
    this.hydrateOrder(this.data.mockState);
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.orderList);
      },
    });
  },
  hydrateOrder(override: PageStatus | null = null) {
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
        paymentStatusText: getOrderPaymentStatusText(order.payStatus),
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
      navigateWithParams(ROUTES.paymentResult, {
        status: getPaymentResultStatusFromOrder(order),
        orderNo: order.orderNo,
        amount: order.amount.payable,
        orderId: order.id,
        paymentMethod: order.paymentMethod,
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

    navigateWithParams(ROUTES.supportChat, {
      source: "order",
      orderId: order.id,
      orderNo: order.orderNo,
    });
  },
  handleContactService() {
    const order = this.data.order;

    navigateWithParams(ROUTES.supportChat, {
      source: "order",
      orderId: order?.id ?? this.data.orderId,
      orderNo: order?.orderNo ?? this.data.orderNo,
    });
  },
  handleGoOrderList() {
    navigateToRoute(ROUTES.orderList);
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleRetry() {
    this.setData({
      status: "loading",
      mockState: null,
    });
    this.hydrateOrder();
  },
});
