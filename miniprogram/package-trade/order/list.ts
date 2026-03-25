import { ROUTES } from "../../constants/routes";
import type { Order } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { filterOrdersByStatus, getOrderStatusDesc, getOrderStatusText, getOrderTotalQuantity, orderFilterOptions, type OrderFilterValue } from "../../utils/order";
import { getOrders, markOrderPaid } from "../../utils/storage";

type PageStatus = "loading" | "ready" | "empty" | "error";
type OrderCardView = Order & {
  statusText: string;
  statusDesc: string;
  totalQuantity: number;
  itemCount: number;
  primaryItem: Order["items"][number] | null;
};

Page({
  data: {
    status: "loading" as PageStatus,
    currentFilter: "all" as OrderFilterValue,
    tabs: [] as Array<{ value: OrderFilterValue; label: string; count: number }>,
    orders: [] as OrderCardView[],
    filteredOrders: [] as OrderCardView[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const filter = options.filter as OrderFilterValue | undefined;
    if (filter && orderFilterOptions.some((item) => item.value === filter)) {
      this.setData({
        currentFilter: filter,
      });
    }
  },
  onShow() {
    this.hydrateOrders();
  },
  hydrateOrders() {
    try {
      const orders = getOrders().map((order) => ({
        ...order,
        statusText: getOrderStatusText(order.status),
        statusDesc: getOrderStatusDesc(order),
        totalQuantity: getOrderTotalQuantity(order),
        itemCount: order.items.length,
        primaryItem: order.items[0] ?? null,
      }));
      const tabs = orderFilterOptions.map((item) => ({
        ...item,
        count: filterOrdersByStatus(orders, item.value).length,
      }));
      const filteredOrders = filterOrdersByStatus(orders, this.data.currentFilter);

      this.setData({
        status: orders.length ? "ready" : "empty",
        tabs,
        orders,
        filteredOrders,
      });
    } catch {
      this.setData({
        status: "error",
      });
    }
  },
  handleGoBack() {
    wx.navigateBack({
      fail: () => {
        navigateToRoute(ROUTES.profile);
      },
    });
  },
  handleFilterTap(event: WechatMiniprogram.Event) {
    const { value } = event.currentTarget.dataset as { value?: OrderFilterValue };
    if (!value) return;

    this.setData({
      currentFilter: value,
      filteredOrders: filterOrdersByStatus(this.data.orders, value),
    });
  },
  handleOpenDetail(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    navigateWithParams(ROUTES.orderDetail, {
      id,
    });
  },
  handleContinuePay(event: WechatMiniprogram.Event) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;

    const order = markOrderPaid(id);
    if (!order) {
      wx.showToast({
        title: "订单状态更新失败",
        icon: "none",
      });
      return;
    }

    navigateWithParams(ROUTES.paymentResult, {
      status: "success",
      orderNo: order.orderNo,
      amount: order.amount.payable,
      orderId: order.id,
    });
  },
  handleViewAll() {
    this.setData({
      currentFilter: "all",
      filteredOrders: filterOrdersByStatus(this.data.orders, "all"),
    });
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
  handleRetry() {
    this.hydrateOrders();
  },
});
