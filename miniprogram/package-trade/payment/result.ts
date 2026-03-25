import { ROUTES } from "../../constants/routes";
import { navigateToRoute } from "../../utils/navigate";

Page({
  data: {
    status: "success",
    title: "支付成功",
    summary: "当前以本地 Mock 订单提交为准，后续会继续补订单列表和详情页的完整状态流转。",
    orderNo: "",
    amount: "0",
  },
  onLoad(options: Record<string, string | undefined>) {
    const status = options.status === "failed" ? "failed" : "success";
    const title = status === "success" ? "支付成功" : "支付失败";
    const summary =
      status === "success"
        ? "本次提交已完成本地落单演练，已从购物车移除对应勾选商品。"
        : "当前仍停留在 Mock 支付阶段，可返回结算页后重试。";

    this.setData({
      status,
      title,
      summary,
      orderNo: options.orderNo ?? "",
      amount: options.amount ?? "0",
    });
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleGoCart() {
    navigateToRoute(ROUTES.cart);
  },
  handleGoOrderList() {
    navigateToRoute(ROUTES.orderList);
  },
  handleBackCheckout() {
    wx.navigateBack();
  },
});
