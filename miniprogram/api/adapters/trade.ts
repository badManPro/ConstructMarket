import type { Address, CartItem, InvoiceDraft, InvoiceRecord, Order } from "../../types/models";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => isRecord(item));
  }

  if (!isRecord(value)) {
    return [];
  }

  const candidates = [value.records, value.list, value.items, value.rows, value.content];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => isRecord(item));
    }
  }

  return [];
}

function pickString(source: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function pickNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

export function adaptAddresses(input: unknown): Address[] {
  return extractArray(input).map((item, index) => ({
    id: pickString(item, ["id", "addressId"], `address-${index + 1}`),
    receiver: pickString(item, ["receiver", "consignee"], "收货人"),
    phone: pickString(item, ["phone", "mobile"], ""),
    province: pickString(item, ["province"], ""),
    city: pickString(item, ["city"], ""),
    district: pickString(item, ["district", "area"], ""),
    detail: pickString(item, ["detail", "address"], ""),
    tag: pickString(item, ["tag", "label"], ""),
    isDefault: pickNumber(item, ["isDefault", "defaultFlag"], 0) === 1,
  }));
}

export function adaptInvoiceTitles(input: unknown): InvoiceDraft[] {
  return extractArray(input).map((item) => ({
    type: pickString(item, ["type"], "electronic") === "paper" ? "paper" : "electronic",
    title: pickString(item, ["title", "invoiceTitle"], ""),
    taxNo: pickString(item, ["taxNo", "taxNumber"], ""),
    email: pickString(item, ["email"], ""),
  }));
}

export function adaptInvoiceRecords(input: unknown): InvoiceRecord[] {
  return extractArray(input).map((item, index) => ({
    id: pickString(item, ["id", "recordId"], `invoice-record-${index + 1}`),
    orderNo: pickString(item, ["orderNo"], ""),
    type: pickString(item, ["type"], "electronic"),
    status: pickString(item, ["status"], "applying"),
    title: pickString(item, ["title", "invoiceTitle"], ""),
    taxNo: pickString(item, ["taxNo", "taxNumber"], ""),
    email: pickString(item, ["email"], ""),
    receiverName: pickString(item, ["receiverName", "consignee"], ""),
    receiverPhone: pickString(item, ["receiverPhone", "mobile"], ""),
    receiverAddress: pickString(item, ["receiverAddress", "address"], ""),
    applyAt: pickString(item, ["applyAt", "createTime"], ""),
  }));
}

export function adaptCartItems(input: unknown): CartItem[] {
  return extractArray(input).map((item, index) => ({
    id: pickString(item, ["id", "cartItemId"], `cart-item-${index + 1}`),
    productId: pickString(item, ["productId"], ""),
    skuId: pickString(item, ["skuId"], ""),
    name: pickString(item, ["name", "productName"], "购物车商品"),
    cover: pickString(item, ["cover", "coverUrl"], "商品"),
    model: pickString(item, ["model", "specName"], "默认规格"),
    price: pickNumber(item, ["price", "salePrice"], 0),
    unit: pickString(item, ["unit"], "件"),
    quantity: pickNumber(item, ["quantity", "count"], 1),
    minOrderQty: pickNumber(item, ["minOrderQty", "minQuantity"], 1),
    checked: true,
    invalid: false,
  }));
}

export function adaptOrders(input: unknown): Order[] {
  return extractArray(input).map((item, index) => ({
    id: pickString(item, ["id", "orderId"], `order-${index + 1}`),
    orderNo: pickString(item, ["orderNo"], ""),
    status: pickString(item, ["status"], "pending_payment"),
    payStatus: pickString(item, ["payStatus", "paymentStatus"], "unpaid"),
    items: [],
    address: {
      id: "",
      receiver: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      tag: "",
      isDefault: false,
    },
    coupon: null,
    invoiceInfo: null,
    remark: pickString(item, ["remark"], ""),
    paymentMethod: pickString(item, ["paymentMethod"], "wechat"),
    amount: {
      lineCount: 0,
      selectedLineCount: 0,
      selectedQuantity: 0,
      invalidCount: 0,
      subtotal: pickNumber(item, ["subtotal", "amount"], 0),
      discount: pickNumber(item, ["discount"], 0),
      freight: pickNumber(item, ["freight"], 0),
      payable: pickNumber(item, ["payable", "amount"], 0),
    },
    createdAt: pickString(item, ["createdAt", "createTime"], ""),
  }));
}
