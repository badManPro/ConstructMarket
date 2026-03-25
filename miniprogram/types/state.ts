import type { Address, CartItem, Coupon, FaqItem, Order, UserProfile } from "./models";

export type AuthState = {
  isLoggedIn: boolean;
  authPlaceholderResult: "granted" | "denied" | "unknown";
};

export type SearchState = {
  keyword: string;
  currentCategoryId: string;
  sortOption: string;
  filters: Record<string, unknown>;
  recentKeywords: string[];
};

export type CartState = {
  items: CartItem[];
  selectedItemIds: string[];
  invalidItems: CartItem[];
  totalAmount: number;
};

export type CheckoutState = {
  selectedAddress: Address | null;
  selectedCoupon: Coupon | null;
  invoiceDraft: Record<string, unknown>;
  remark: string;
  paymentMethod: string;
};

export type OrderState = {
  items: Order[];
  currentFilter: string;
};

export type SupportState = {
  faqItems: FaqItem[];
  draftComplaint: Record<string, unknown>;
};

export type AppState = {
  authState: AuthState;
  cartState: CartState;
  searchState: SearchState;
  checkoutState: CheckoutState;
  orderState: OrderState;
  supportState: SupportState;
  userProfile: UserProfile | null;
};
