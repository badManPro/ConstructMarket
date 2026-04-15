"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_CART_AMOUNT_SUMMARY = void 0;
exports.splitCartItems = splitCartItems;
exports.getSelectedCartItemIds = getSelectedCartItemIds;
exports.calculateCartAmountSummary = calculateCartAmountSummary;
exports.resolveCheckoutItems = resolveCheckoutItems;
exports.formatAddressText = formatAddressText;
exports.formatInvoiceText = formatInvoiceText;
exports.EMPTY_CART_AMOUNT_SUMMARY = {
    lineCount: 0,
    selectedLineCount: 0,
    selectedQuantity: 0,
    invalidCount: 0,
    subtotal: 0,
    discount: 0,
    freight: 0,
    payable: 0,
};
function splitCartItems(items) {
    return {
        validItems: items.filter((item) => !item.invalid),
        invalidItems: items.filter((item) => item.invalid),
    };
}
function getSelectedCartItemIds(items) {
    return items.filter((item) => !item.invalid && item.checked).map((item) => item.id);
}
function calculateCartAmountSummary(items, coupon = null) {
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
function resolveCheckoutItems(draft, cartItems) {
    if (draft.source === "buy_now") {
        return draft.buyNowItem ? [draft.buyNowItem] : [];
    }
    const selectedIds = new Set(draft.selectedCartItemIds.length ? draft.selectedCartItemIds : getSelectedCartItemIds(cartItems));
    return cartItems.filter((item) => !item.invalid && selectedIds.has(item.id));
}
function formatAddressText(address) {
    return [address.province, address.city, address.district, address.detail].filter(Boolean).join(" ");
}
function formatInvoiceText(invoiceDraft) {
    if (!invoiceDraft)
        return "暂不开票";
    const typeText = invoiceDraft.type === "electronic" ? "电子发票" : "纸质发票";
    return `${typeText} · ${invoiceDraft.title}`;
}
