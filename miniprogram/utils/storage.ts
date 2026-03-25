import { seededOrders } from "../mock/order";
import type { CartItem, CheckoutDraft, Order } from "../types/models";

const FAVORITE_KEY = "constructmarket_favorite_ids";
const CART_KEY = "constructmarket_cart_items";
const CHECKOUT_DRAFT_KEY = "constructmarket_checkout_draft";
const ORDER_KEY = "constructmarket_orders";

const DEFAULT_CHECKOUT_DRAFT: CheckoutDraft = {
  source: "cart",
  selectedCartItemIds: [],
  buyNowItem: null,
  selectedAddressId: null,
  selectedCouponId: null,
  invoiceDraft: null,
  remark: "",
  paymentMethod: "wechat",
};

export function getFavoriteIds() {
  return (wx.getStorageSync(FAVORITE_KEY) as string[] | undefined) ?? [];
}

export function toggleFavoriteId(productId: string) {
  const current = new Set(getFavoriteIds());

  if (current.has(productId)) {
    current.delete(productId);
  } else {
    current.add(productId);
  }

  const next = Array.from(current);
  wx.setStorageSync(FAVORITE_KEY, next);
  return next;
}

export function getCartItems() {
  return (wx.getStorageSync(CART_KEY) as CartItem[] | undefined) ?? [];
}

function saveCartItems(nextItems: CartItem[]) {
  wx.setStorageSync(CART_KEY, nextItems);
  return nextItems;
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + (item.invalid ? 0 : item.quantity), 0);
}

export function addCartItem(nextItem: CartItem) {
  const cart = getCartItems();
  const existing = cart.find((item) => item.skuId === nextItem.skuId);

  if (existing) {
    existing.quantity += nextItem.quantity;
  } else {
    cart.unshift(nextItem);
  }

  saveCartItems(cart);
  return getCartCount();
}

export function setCartItemChecked(itemId: string, checked: boolean) {
  return saveCartItems(
    getCartItems().map((item) => {
      if (item.id !== itemId || item.invalid) return item;
      return {
        ...item,
        checked,
      };
    }),
  );
}

export function toggleAllCartItems(checked: boolean) {
  return saveCartItems(
    getCartItems().map((item) => {
      if (item.invalid) return item;
      return {
        ...item,
        checked,
      };
    }),
  );
}

export function updateCartItemQuantity(itemId: string, quantity: number) {
  return saveCartItems(
    getCartItems().map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        quantity,
      };
    }),
  );
}

export function removeCartItem(itemId: string) {
  return saveCartItems(getCartItems().filter((item) => item.id !== itemId));
}

export function removeCartItems(itemIds: string[]) {
  const targets = new Set(itemIds);
  return saveCartItems(getCartItems().filter((item) => !targets.has(item.id)));
}

export function clearInvalidCartItems() {
  return saveCartItems(getCartItems().filter((item) => !item.invalid));
}

function normalizeCheckoutDraft(draft?: Partial<CheckoutDraft> | null): CheckoutDraft {
  return {
    ...DEFAULT_CHECKOUT_DRAFT,
    ...(draft ?? {}),
    source: draft?.source === "buy_now" ? "buy_now" : "cart",
    selectedCartItemIds: Array.isArray(draft?.selectedCartItemIds) ? draft?.selectedCartItemIds : [],
    buyNowItem: draft?.buyNowItem ?? null,
    selectedAddressId: draft?.selectedAddressId ?? null,
    selectedCouponId: draft?.selectedCouponId ?? null,
    invoiceDraft: draft?.invoiceDraft ?? null,
    remark: draft?.remark ?? "",
    paymentMethod: draft?.paymentMethod ?? "wechat",
  };
}

export function getCheckoutDraft() {
  const draft = wx.getStorageSync(CHECKOUT_DRAFT_KEY) as Partial<CheckoutDraft> | undefined;
  return normalizeCheckoutDraft(draft);
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  const nextDraft = normalizeCheckoutDraft(draft);
  wx.setStorageSync(CHECKOUT_DRAFT_KEY, nextDraft);
  return nextDraft;
}

export function patchCheckoutDraft(patch: Partial<CheckoutDraft>) {
  return saveCheckoutDraft({
    ...getCheckoutDraft(),
    ...patch,
  });
}

export function clearCheckoutDraft() {
  wx.removeStorageSync(CHECKOUT_DRAFT_KEY);
}

function cloneOrder(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item })),
    address: { ...order.address },
    coupon: order.coupon ? { ...order.coupon } : null,
    invoiceInfo: order.invoiceInfo ? { ...order.invoiceInfo } : null,
    amount: { ...order.amount },
  };
}

function getInitialOrders() {
  return seededOrders.map((order) => cloneOrder(order));
}

function saveOrders(nextOrders: Order[]) {
  wx.setStorageSync(ORDER_KEY, nextOrders);
  return nextOrders;
}

export function getOrders() {
  const stored = wx.getStorageSync(ORDER_KEY) as Order[] | undefined;

  if (Array.isArray(stored)) {
    return stored;
  }

  const initialOrders = getInitialOrders();
  saveOrders(initialOrders);
  return initialOrders;
}

export function prependOrder(order: Order) {
  return saveOrders([cloneOrder(order), ...getOrders()]);
}

export function getOrderById(orderId: string | null | undefined) {
  if (!orderId) return null;
  return getOrders().find((item) => item.id === orderId) ?? null;
}

export function getOrderByNo(orderNo: string | null | undefined) {
  if (!orderNo) return null;
  return getOrders().find((item) => item.orderNo === orderNo) ?? null;
}

function patchOrder(orderId: string, patch: Partial<Order>) {
  let updatedOrder: Order | null = null;

  const nextOrders = getOrders().map((item) => {
    if (item.id !== orderId) return item;
    updatedOrder = {
      ...item,
      ...patch,
    };
    return updatedOrder;
  });

  saveOrders(nextOrders);
  return updatedOrder;
}

export function markOrderPaid(orderId: string) {
  const order = getOrderById(orderId);
  if (!order) return null;

  if (order.payStatus === "success" && order.status !== "pending_payment") {
    return order;
  }

  return patchOrder(orderId, {
    payStatus: "success",
    status: "pending_receipt",
  });
}

export function markOrderReceived(orderId: string) {
  return patchOrder(orderId, {
    status: "completed",
  });
}

export function markOrderAfterSale(orderId: string) {
  return patchOrder(orderId, {
    status: "after_sale",
  });
}
