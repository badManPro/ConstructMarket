import { ROUTES } from "../../constants/routes";
import { getProfilePageData, type ProfileAssetStat, type ProfileOrderFilter, type ProfileOrderShortcut, type ProfileServiceSection } from "../../mock/profile";
import type { Address, UserProfile } from "../../types/models";
import { navigateToRoute, navigateWithParams } from "../../utils/navigate";
import { getPageStatusOverride, type PageStatus } from "../../utils/page";
import { getAddresses, getFavoriteIds, getInvoiceRecords, getOrders } from "../../utils/storage";

function formatDefaultAddress(addresses: Address[]) {
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;

  if (!defaultAddress) {
    return "默认地址：暂未设置收货地址";
  }

  return `默认地址：${defaultAddress.city}${defaultAddress.district}${defaultAddress.detail}`;
}

Page({
  data: {
    status: "loading" as PageStatus,
    mockState: "",
    profileInfoRoute: ROUTES.profileInfo,
    userProfile: null as UserProfile | null,
    couponNote: "",
    defaultAddressText: "",
    assetStats: [] as ProfileAssetStat[],
    orderShortcuts: [] as ProfileOrderShortcut[],
    serviceSections: [] as ProfileServiceSection[],
  },
  onLoad(options: Record<string, string | undefined>) {
    const mockState = getPageStatusOverride(options.state);

    this.setData({
      mockState: mockState ?? "",
    });

    this.hydratePage(mockState);
  },
  onShow() {
    if (!this.data.mockState) {
      this.hydratePage();
    }
  },
  hydratePage(override: PageStatus | null = null) {
    if (override === "loading") {
      this.setData({
        status: "loading",
      });
      return;
    }

    if (override && override !== "ready") {
      this.setData({
        status: override,
        userProfile: null,
        couponNote: "",
        defaultAddressText: "",
        assetStats: [],
        orderShortcuts: [],
        serviceSections: [],
      });
      return;
    }

    try {
      const orders = getOrders();
      const favoriteCount = getFavoriteIds().length;
      const addresses = getAddresses();
      const invoiceCount = getInvoiceRecords().length;
      const pageData = getProfilePageData({
        orders,
        favoriteCount,
        addressCount: addresses.length,
        invoiceCount,
        defaultAddressText: formatDefaultAddress(addresses),
      });

      this.setData({
        status: pageData.serviceSections.length ? "ready" : "empty",
        userProfile: pageData.userProfile,
        couponNote: pageData.couponNote,
        defaultAddressText: pageData.defaultAddressText,
        assetStats: pageData.assetStats,
        orderShortcuts: pageData.orderShortcuts,
        serviceSections: pageData.serviceSections,
      });
    } catch {
      this.setData({
        status: "error",
        userProfile: null,
        couponNote: "",
        defaultAddressText: "",
        assetStats: [],
        orderShortcuts: [],
        serviceSections: [],
      });
    }
  },
  handleRouteTap(event: WechatMiniprogram.Event) {
    const { route } = event.currentTarget.dataset as { route?: string };
    if (!route) return;
    navigateToRoute(route);
  },
  handleViewAllOrders() {
    navigateToRoute(ROUTES.orderList);
  },
  handleOrderTap(event: WechatMiniprogram.Event) {
    const { filter } = event.currentTarget.dataset as { filter?: ProfileOrderFilter };
    if (!filter) return;

    navigateWithParams(ROUTES.orderList, {
      filter,
    });
  },
  handleRetry() {
    this.setData({
      mockState: "",
      status: "loading",
    });
    this.hydratePage();
  },
  handleGoHome() {
    navigateToRoute(ROUTES.home);
  },
});
