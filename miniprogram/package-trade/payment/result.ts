import { ROUTES } from "../../constants/routes";
import type { PaymentResultStatus } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getOrderPaymentText } from "../../utils/order";
import { getOrderById, setOrderPaymentState } from "../../utils/storage";

function getResultCopy(status: PaymentResultStatus) {
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
    status: "processing" as PaymentResultStatus,
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
  onLoad(options: Record<string, string | undefined>) {
    this.setData({
      orderNo: options.orderNo ?? "",
      amount: options.amount ?? "0",
      orderId: options.orderId ?? "",
      paymentMethod: options.paymentMethod ?? "wechat",
    });

    const status: PaymentResultStatus =
      options.status === "failed" || options.status === "success" ? options.status : "processing";

    this.applyResult(status);
  },
  applyResult(status: PaymentResultStatus, showToast = false) {
    const updatedOrder = this.data.orderId ? setOrderPaymentState(this.data.orderId, status) : null;
    const order = updatedOrder ?? getOrderById(this.data.orderId);
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
      paymentMethodText: getOrderPaymentText(paymentMethod),
    });

    if (!showToast) return;

    wx.showToast({
      title: status === "success" ? "支付已更新为成功" : status === "failed" ? "已切换为支付失败" : "已进入支付处理中",
      icon: "none",
    });
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleGoOrder() {
    if (!this.data.orderId || this.data.status === "failed") {
      navigateToRoute(ROUTES.orderList);
      return;
    }

    navigateWithParams(ROUTES.orderDetail, {
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
  handleResultSwitch(event: WechatMiniprogram.Event) {
    const { status } = event.currentTarget.dataset as { status?: PaymentResultStatus };
    if (!status) return;

    this.applyResult(status, true);
  },
});
