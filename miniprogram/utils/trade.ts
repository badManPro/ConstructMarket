import type { CartAmountSummary, CartItem, CheckoutDraft, Coupon, InvoiceDraft } from "../types/models";

export const EMPTY_CART_AMOUNT_SUMMARY: CartAmountSummary = {
  lineCount: 0,
  selectedLineCount: 0,
  selectedQuantity: 0,
  invalidCount: 0,
  subtotal: 0,
  discount: 0,
  freight: 0,
  payable: 0,
};

export function splitCartItems(items: CartItem[]) {
  return {
    validItems: items.filter((item) => !item.invalid),
    invalidItems: items.filter((item) => item.invalid),
  };
}

export function getSelectedCartItemIds(items: CartItem[]) {
  return items.filter((item) => !item.invalid && item.checked).map((item) => item.id);
}

export function calculateCartAmountSummary(items: CartItem[], coupon: Coupon | null = null): CartAmountSummary {
  const validItems = items.filter((item) => !item.invalid);
  const selectedItems = validItems.filter((item) => item.checked);
  const subtotal = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = coupon && coupon.status === "available" && subtotal >= coupon.threshold ? coupon.amount : 0;

  return {
    lineCount: validItems.length,
    selectedLineCount: selectedItems.length,
    selectedQuantity: selectedItems.reduce((total, item) => total + item.quantity, 0),
    invalidCount: items.length - validItems.length,
    subtotal,
    discount,
    freight: 0,
    payable: Math.max(subtotal - discount, 0),
  };
}

export function resolveCheckoutItems(draft: CheckoutDraft, cartItems: CartItem[]) {
  if (draft.source === "buy_now") {
    return draft.buyNowItem ? [draft.buyNowItem] : [];
  }

  const selectedIds = new Set(
    draft.selectedCartItemIds.length ? draft.selectedCartItemIds : getSelectedCartItemIds(cartItems),
  );

  return cartItems.filter((item) => !item.invalid && selectedIds.has(item.id));
}

export function formatAddressText(address: {
  province: string;
  city: string;
  district: string;
  detail: string;
}) {
  return [address.province, address.city, address.district, address.detail].filter(Boolean).join(" ");
}

export function formatInvoiceText(invoiceDraft: InvoiceDraft | null) {
  if (!invoiceDraft) return "暂不开票";
  const typeText = invoiceDraft.type === "electronic" ? "电子发票" : "纸质发票";
  return `${typeText} · ${invoiceDraft.title}`;
}
