import type { AppState } from "../types/state";

export const appStore: AppState = {
  authState: {
    isLoggedIn: false,
    authPlaceholderResult: "unknown",
  },
  cartState: {
    items: [],
    selectedItemIds: [],
    invalidItems: [],
    totalAmount: 0,
  },
  searchState: {
    keyword: "",
    currentCategoryId: "",
    sortOption: "default",
    filters: {},
    recentKeywords: [],
  },
  checkoutState: {
    selectedAddress: null,
    selectedCoupon: null,
    invoiceDraft: {},
    remark: "",
    paymentMethod: "wechat",
  },
  orderState: {
    items: [],
    currentFilter: "all",
  },
  supportState: {
    faqItems: [],
    draftComplaint: {},
  },
  userProfile: null,
};
