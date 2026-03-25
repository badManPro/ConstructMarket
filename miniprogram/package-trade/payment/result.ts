import { ROUTES } from "../../constants/routes";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";

Page({
  data: {
    status: "success",
    title: "支付成功",
    summary: "当前订单已写入本地状态，可继续进入订单详情查看后续流转。",
    orderNo: "",
    amount: "0",
    orderId: "",
  },
  onLoad(options: Record<string, string | undefined>) {
    const status = options.status === "failed" ? "failed" : "success";
    const title = status === "success" ? "支付成功" : "支付失败";
    const summary =
      status === "success"
        ? "本次提交已完成本地落单，相关商品已从购物车移除。"
        : "当前仍停留在 Mock 支付阶段，可返回结算页后重试。";

    this.setData({
      status,
      title,
      summary,
      orderNo: options.orderNo ?? "",
      amount: options.amount ?? "0",
      orderId: options.orderId ?? "",
    });
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleGoCart() {
    navigateToRoute(ROUTES.cart);
  },
  handleGoOrderList() {
    if (!this.data.orderId) {
      navigateToRoute(ROUTES.orderList);
      return;
    }

    navigateWithParams(ROUTES.orderDetail, {
      id: this.data.orderId,
    });
  },
  handleBackCheckout() {
    wx.navigateBack();
  },
});
