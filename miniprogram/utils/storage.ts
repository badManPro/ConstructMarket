import type { CartItem } from "../types/models";

const FAVORITE_KEY = "constructmarket_favorite_ids";
const CART_KEY = "constructmarket_cart_items";

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

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function addCartItem(nextItem: CartItem) {
  const cart = getCartItems();
  const existing = cart.find((item) => item.skuId === nextItem.skuId);

  if (existing) {
    existing.quantity += nextItem.quantity;
  } else {
    cart.unshift(nextItem);
  }

  wx.setStorageSync(CART_KEY, cart);
  return getCartCount();
}
