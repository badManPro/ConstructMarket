"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptAddresses = adaptAddresses;
exports.adaptInvoiceTitles = adaptInvoiceTitles;
exports.adaptInvoiceRecords = adaptInvoiceRecords;
exports.adaptCartItems = adaptCartItems;
exports.adaptOrders = adaptOrders;
function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function extractArray(value) {
    if (Array.isArray(value)) {
        return value.filter((item) => isRecord(item));
    }
    if (!isRecord(value)) {
        return [];
    }
    const candidates = [value.records, value.list, value.items, value.rows, value.content];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            return candidate.filter((item) => isRecord(item));
        }
    }
    return [];
}
function pickString(source, keys, fallback = "") {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return fallback;
}
function pickNumber(source, keys, fallback = 0) {
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
function adaptAddresses(input) {
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
function adaptInvoiceTitles(input) {
    return extractArray(input).map((item) => ({
        type: pickString(item, ["type"], "electronic") === "paper" ? "paper" : "electronic",
        title: pickString(item, ["title", "invoiceTitle"], ""),
        taxNo: pickString(item, ["taxNo", "taxNumber"], ""),
        email: pickString(item, ["email"], ""),
    }));
}
function adaptInvoiceRecords(input) {
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
function adaptCartItems(input) {
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
function adaptOrders(input) {
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
