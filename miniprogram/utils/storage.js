"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = getUserProfile;
exports.getProfileDraft = getProfileDraft;
exports.saveProfileDraft = saveProfileDraft;
exports.resetProfileDraft = resetProfileDraft;
exports.saveUserProfile = saveUserProfile;
exports.getFavoriteIds = getFavoriteIds;
exports.toggleFavoriteId = toggleFavoriteId;
exports.getCartItems = getCartItems;
exports.getCartCount = getCartCount;
exports.addCartItem = addCartItem;
exports.setCartItemChecked = setCartItemChecked;
exports.toggleAllCartItems = toggleAllCartItems;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.removeCartItem = removeCartItem;
exports.removeCartItems = removeCartItems;
exports.clearInvalidCartItems = clearInvalidCartItems;
exports.getCheckoutDraft = getCheckoutDraft;
exports.saveCheckoutDraft = saveCheckoutDraft;
exports.patchCheckoutDraft = patchCheckoutDraft;
exports.clearCheckoutDraft = clearCheckoutDraft;
exports.getSupportChatMessages = getSupportChatMessages;
exports.appendSupportChatMessage = appendSupportChatMessage;
exports.patchSupportChatMessage = patchSupportChatMessage;
exports.clearSupportChatMessages = clearSupportChatMessages;
exports.getComplaintDraft = getComplaintDraft;
exports.saveComplaintDraft = saveComplaintDraft;
exports.patchComplaintDraft = patchComplaintDraft;
exports.clearComplaintDraft = clearComplaintDraft;
exports.getAddresses = getAddresses;
exports.getDefaultAddress = getDefaultAddress;
exports.getAddressById = getAddressById;
exports.upsertAddress = upsertAddress;
exports.setDefaultAddress = setDefaultAddress;
exports.deleteAddress = deleteAddress;
exports.getInvoiceRecords = getInvoiceRecords;
exports.prependInvoiceRecord = prependInvoiceRecord;
exports.getOrders = getOrders;
exports.prependOrder = prependOrder;
exports.getOrderById = getOrderById;
exports.getOrderByNo = getOrderByNo;
exports.markOrderPaid = markOrderPaid;
exports.setOrderPaymentState = setOrderPaymentState;
exports.markOrderReceived = markOrderReceived;
exports.markOrderAfterSale = markOrderAfterSale;
const profile_1 = require("../mock/profile");
const order_1 = require("../mock/order");
const support_1 = require("../mock/support");
const trade_1 = require("../mock/trade");
const FAVORITE_KEY = "constructmarket_favorite_ids";
const CART_KEY = "constructmarket_cart_items";
const CHECKOUT_DRAFT_KEY = "constructmarket_checkout_draft";
const ORDER_KEY = "constructmarket_orders";
const ADDRESS_KEY = "constructmarket_addresses";
const INVOICE_RECORD_KEY = "constructmarket_invoice_records";
const SUPPORT_CHAT_KEY = "constructmarket_support_chat";
const COMPLAINT_DRAFT_KEY = "constructmarket_support_complaint_draft";
const USER_PROFILE_KEY = "constructmarket_user_profile";
const PROFILE_DRAFT_KEY = "constructmarket_profile_draft";
const DEFAULT_CHECKOUT_DRAFT = {
    source: "cart",
    selectedCartItemIds: [],
    buyNowItem: null,
    selectedAddressId: null,
    selectedCouponId: null,
    invoiceDraft: null,
    remark: "",
    paymentMethod: "wechat",
};
function cloneUserProfile(profile) {
    return {
        ...profile,
    };
}
function normalizeUserProfile(profile) {
    const nextProfile = profile ?? {};
    const nickname = typeof nextProfile.nickname === "string" ? nextProfile.nickname.trim() : profile_1.seededUserProfile.nickname;
    const avatar = typeof nextProfile.avatar === "string" ? nextProfile.avatar.trim() : "";
    return {
        id: typeof nextProfile.id === "string" && nextProfile.id ? nextProfile.id : profile_1.seededUserProfile.id,
        avatar: avatar || nickname.slice(0, 1) || profile_1.seededUserProfile.avatar,
        nickname,
        phone: typeof nextProfile.phone === "string" && /^1\d{10}$/.test(nextProfile.phone.trim())
            ? nextProfile.phone.trim()
            : profile_1.seededUserProfile.phone,
        companyName: typeof nextProfile.companyName === "string" ? nextProfile.companyName.trim() : profile_1.seededUserProfile.companyName,
        buyerRole: typeof nextProfile.buyerRole === "string" ? nextProfile.buyerRole.trim() : profile_1.seededUserProfile.buyerRole,
        couponCount: typeof nextProfile.couponCount === "number" ? nextProfile.couponCount : profile_1.seededUserProfile.couponCount,
        defaultAddressId: typeof nextProfile.defaultAddressId === "string" ? nextProfile.defaultAddressId : profile_1.seededUserProfile.defaultAddressId,
    };
}
function normalizeProfileDraft(draft, userProfile = getUserProfile()) {
    const baseDraft = (0, profile_1.buildProfileDraft)(userProfile);
    const nextDraft = draft ?? {};
    return {
        avatar: typeof nextDraft.avatar === "string" && nextDraft.avatar.trim()
            ? nextDraft.avatar.trim().slice(0, 1)
            : baseDraft.avatar,
        nickname: typeof nextDraft.nickname === "string" ? nextDraft.nickname : baseDraft.nickname,
        phone: typeof nextDraft.phone === "string" && /^1\d{10}$/.test(nextDraft.phone.trim()) ? nextDraft.phone.trim() : userProfile.phone,
        companyName: typeof nextDraft.companyName === "string" ? nextDraft.companyName : baseDraft.companyName,
        buyerRole: typeof nextDraft.buyerRole === "string" ? nextDraft.buyerRole : baseDraft.buyerRole,
    };
}
function saveUserProfileStorage(profile) {
    const normalized = normalizeUserProfile(profile);
    wx.setStorageSync(USER_PROFILE_KEY, normalized);
    return cloneUserProfile(normalized);
}
function getUserProfile() {
    const stored = wx.getStorageSync(USER_PROFILE_KEY);
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        const normalized = normalizeUserProfile(stored);
        wx.setStorageSync(USER_PROFILE_KEY, normalized);
        return cloneUserProfile(normalized);
    }
    return saveUserProfileStorage(profile_1.seededUserProfile);
}
function getProfileDraft() {
    const userProfile = getUserProfile();
    const stored = wx.getStorageSync(PROFILE_DRAFT_KEY);
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
        const normalized = normalizeProfileDraft(stored, userProfile);
        wx.setStorageSync(PROFILE_DRAFT_KEY, normalized);
        return normalized;
    }
    const initialDraft = (0, profile_1.buildProfileDraft)(userProfile);
    wx.setStorageSync(PROFILE_DRAFT_KEY, initialDraft);
    return initialDraft;
}
function saveProfileDraft(draft) {
    const normalized = normalizeProfileDraft(draft);
    wx.setStorageSync(PROFILE_DRAFT_KEY, normalized);
    return normalized;
}
function resetProfileDraft() {
    const nextDraft = (0, profile_1.buildProfileDraft)(getUserProfile());
    wx.setStorageSync(PROFILE_DRAFT_KEY, nextDraft);
    return nextDraft;
}
function saveUserProfile(profile) {
    const savedProfile = saveUserProfileStorage(profile);
    saveProfileDraft((0, profile_1.buildProfileDraft)(savedProfile));
    return savedProfile;
}
function getFavoriteIds() {
    const stored = wx.getStorageSync(FAVORITE_KEY);
    if (!Array.isArray(stored)) {
        if (stored !== "" && stored !== null && stored !== undefined) {
            wx.setStorageSync(FAVORITE_KEY, []);
        }
        return [];
    }
    const normalized = stored.filter((item) => typeof item === "string");
    if (normalized.length !== stored.length) {
        wx.setStorageSync(FAVORITE_KEY, normalized);
    }
    return normalized;
}
function toggleFavoriteId(productId) {
    const current = new Set(getFavoriteIds());
    if (current.has(productId)) {
        current.delete(productId);
    }
    else {
        current.add(productId);
    }
    const next = Array.from(current);
    wx.setStorageSync(FAVORITE_KEY, next);
    return next;
}
function getCartItems() {
    const stored = wx.getStorageSync(CART_KEY);
    if (!Array.isArray(stored)) {
        if (stored !== "" && stored !== null && stored !== undefined) {
            wx.setStorageSync(CART_KEY, []);
        }
        return [];
    }
    const normalized = stored.filter((item) => Boolean(item && typeof item === "object"));
    if (normalized.length !== stored.length) {
        wx.setStorageSync(CART_KEY, normalized);
    }
    return normalized;
}
function saveCartItems(nextItems) {
    wx.setStorageSync(CART_KEY, nextItems);
    return nextItems;
}
function getCartCount() {
    return getCartItems().reduce((total, item) => total + (item.invalid ? 0 : item.quantity), 0);
}
function addCartItem(nextItem) {
    const cart = getCartItems();
    const existing = cart.find((item) => item.skuId === nextItem.skuId);
    if (existing) {
        existing.quantity += nextItem.quantity;
    }
    else {
        cart.unshift(nextItem);
    }
    saveCartItems(cart);
    return getCartCount();
}
function setCartItemChecked(itemId, checked) {
    return saveCartItems(getCartItems().map((item) => {
        if (item.id !== itemId || item.invalid)
            return item;
        return {
            ...item,
            checked,
        };
    }));
}
function toggleAllCartItems(checked) {
    return saveCartItems(getCartItems().map((item) => {
        if (item.invalid)
            return item;
        return {
            ...item,
            checked,
        };
    }));
}
function updateCartItemQuantity(itemId, quantity) {
    return saveCartItems(getCartItems().map((item) => {
        if (item.id !== itemId)
            return item;
        return {
            ...item,
            quantity,
        };
    }));
}
function removeCartItem(itemId) {
    return saveCartItems(getCartItems().filter((item) => item.id !== itemId));
}
function removeCartItems(itemIds) {
    const targets = new Set(itemIds);
    return saveCartItems(getCartItems().filter((item) => !targets.has(item.id)));
}
function clearInvalidCartItems() {
    return saveCartItems(getCartItems().filter((item) => !item.invalid));
}
function normalizeCheckoutDraft(draft) {
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
function getCheckoutDraft() {
    const draft = wx.getStorageSync(CHECKOUT_DRAFT_KEY);
    return normalizeCheckoutDraft(draft);
}
function saveCheckoutDraft(draft) {
    const nextDraft = normalizeCheckoutDraft(draft);
    wx.setStorageSync(CHECKOUT_DRAFT_KEY, nextDraft);
    return nextDraft;
}
function patchCheckoutDraft(patch) {
    return saveCheckoutDraft({
        ...getCheckoutDraft(),
        ...patch,
    });
}
function clearCheckoutDraft() {
    wx.removeStorageSync(CHECKOUT_DRAFT_KEY);
}
function cloneOrder(order) {
    return {
        ...order,
        items: order.items.map((item) => ({ ...item })),
        address: { ...order.address },
        coupon: order.coupon ? { ...order.coupon } : null,
        invoiceInfo: order.invoiceInfo ? { ...order.invoiceInfo } : null,
        amount: { ...order.amount },
    };
}
function cloneChatMessage(message) {
    return {
        ...message,
    };
}
function saveSupportChatMessages(nextMessages) {
    const normalizedMessages = nextMessages.map((item) => cloneChatMessage(item));
    wx.setStorageSync(SUPPORT_CHAT_KEY, normalizedMessages);
    return normalizedMessages;
}
function getSupportChatMessages(seedMessages = []) {
    const stored = wx.getStorageSync(SUPPORT_CHAT_KEY);
    if (Array.isArray(stored) && stored.length) {
        return stored;
    }
    if (seedMessages.length) {
        return saveSupportChatMessages(seedMessages);
    }
    return [];
}
function appendSupportChatMessage(message) {
    return saveSupportChatMessages([...getSupportChatMessages(), cloneChatMessage(message)]);
}
function patchSupportChatMessage(messageId, patch) {
    let updatedMessage = null;
    const nextMessages = getSupportChatMessages().map((item) => {
        if (item.id !== messageId)
            return item;
        updatedMessage = {
            ...item,
            ...patch,
        };
        return updatedMessage;
    });
    saveSupportChatMessages(nextMessages);
    return updatedMessage;
}
function clearSupportChatMessages() {
    wx.removeStorageSync(SUPPORT_CHAT_KEY);
}
function normalizeComplaintDraft(draft) {
    return {
        ...support_1.defaultComplaintDraft,
        ...(draft ?? {}),
        contactName: draft?.contactName ?? "",
        phone: draft?.phone ?? "",
        orderNo: draft?.orderNo ?? "",
        problemType: draft?.problemType ?? "",
        description: draft?.description ?? "",
        images: Array.isArray(draft?.images) ? draft.images : [],
    };
}
function getComplaintDraft() {
    const stored = wx.getStorageSync(COMPLAINT_DRAFT_KEY);
    return normalizeComplaintDraft(stored);
}
function saveComplaintDraft(draft) {
    const nextDraft = normalizeComplaintDraft(draft);
    wx.setStorageSync(COMPLAINT_DRAFT_KEY, nextDraft);
    return nextDraft;
}
function patchComplaintDraft(patch) {
    return saveComplaintDraft({
        ...getComplaintDraft(),
        ...patch,
    });
}
function clearComplaintDraft() {
    wx.removeStorageSync(COMPLAINT_DRAFT_KEY);
}
function getInitialOrders() {
    return order_1.seededOrders.map((order) => cloneOrder(order));
}
function cloneAddress(address) {
    return {
        ...address,
    };
}
function getInitialAddresses() {
    return trade_1.tradeAddresses.map((address) => cloneAddress(address));
}
function saveAddresses(nextAddresses) {
    wx.setStorageSync(ADDRESS_KEY, nextAddresses);
    return nextAddresses;
}
function getAddresses() {
    const stored = wx.getStorageSync(ADDRESS_KEY);
    if (Array.isArray(stored)) {
        return stored;
    }
    const initialAddresses = getInitialAddresses();
    saveAddresses(initialAddresses);
    return initialAddresses;
}
function getDefaultAddress() {
    const addresses = getAddresses();
    return addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
}
function getAddressById(addressId) {
    if (!addressId)
        return null;
    return getAddresses().find((item) => item.id === addressId) ?? null;
}
function upsertAddress(address) {
    const addresses = getAddresses();
    const exists = addresses.some((item) => item.id === address.id);
    const normalized = address.isDefault
        ? addresses.map((item) => ({
            ...item,
            isDefault: item.id === address.id ? true : false,
        }))
        : addresses;
    const nextAddresses = exists
        ? normalized.map((item) => (item.id === address.id ? cloneAddress(address) : item))
        : [cloneAddress(address), ...normalized];
    const hasDefault = nextAddresses.some((item) => item.isDefault);
    const finalAddresses = hasDefault
        ? nextAddresses
        : nextAddresses.map((item, index) => ({
            ...item,
            isDefault: index === 0,
        }));
    saveAddresses(finalAddresses);
    return finalAddresses.find((item) => item.id === address.id) ?? finalAddresses[0] ?? null;
}
function setDefaultAddress(addressId) {
    const nextAddresses = getAddresses().map((item) => ({
        ...item,
        isDefault: item.id === addressId,
    }));
    saveAddresses(nextAddresses);
    patchCheckoutDraft({ selectedAddressId: addressId });
    return nextAddresses.find((item) => item.id === addressId) ?? null;
}
function deleteAddress(addressId) {
    const currentDraft = getCheckoutDraft();
    const nextAddresses = getAddresses().filter((item) => item.id !== addressId);
    const normalizedAddresses = nextAddresses.map((item, index) => ({
        ...item,
        isDefault: nextAddresses.some((current) => current.isDefault) ? item.isDefault : index === 0,
    }));
    saveAddresses(normalizedAddresses);
    if (currentDraft.selectedAddressId === addressId) {
        patchCheckoutDraft({ selectedAddressId: normalizedAddresses[0]?.id ?? null });
    }
    return normalizedAddresses;
}
function cloneInvoiceRecord(record) {
    return {
        ...record,
    };
}
function getInitialInvoiceRecords() {
    return trade_1.seededInvoiceRecords.map((record) => cloneInvoiceRecord(record));
}
function saveInvoiceRecords(nextRecords) {
    wx.setStorageSync(INVOICE_RECORD_KEY, nextRecords);
    return nextRecords;
}
function getInvoiceRecords() {
    const stored = wx.getStorageSync(INVOICE_RECORD_KEY);
    if (Array.isArray(stored)) {
        return stored;
    }
    const initialRecords = getInitialInvoiceRecords();
    saveInvoiceRecords(initialRecords);
    return initialRecords;
}
function prependInvoiceRecord(record) {
    return saveInvoiceRecords([cloneInvoiceRecord(record), ...getInvoiceRecords()]);
}
function saveOrders(nextOrders) {
    wx.setStorageSync(ORDER_KEY, nextOrders);
    return nextOrders;
}
function getOrders() {
    const stored = wx.getStorageSync(ORDER_KEY);
    if (Array.isArray(stored)) {
        return stored;
    }
    const initialOrders = getInitialOrders();
    saveOrders(initialOrders);
    return initialOrders;
}
function prependOrder(order) {
    return saveOrders([cloneOrder(order), ...getOrders()]);
}
function getOrderById(orderId) {
    if (!orderId)
        return null;
    return getOrders().find((item) => item.id === orderId) ?? null;
}
function getOrderByNo(orderNo) {
    if (!orderNo)
        return null;
    return getOrders().find((item) => item.orderNo === orderNo) ?? null;
}
function patchOrder(orderId, patch) {
    let updatedOrder = null;
    const nextOrders = getOrders().map((item) => {
        if (item.id !== orderId)
            return item;
        updatedOrder = {
            ...item,
            ...patch,
        };
        return updatedOrder;
    });
    saveOrders(nextOrders);
    return updatedOrder;
}
function markOrderPaid(orderId) {
    const order = getOrderById(orderId);
    if (!order)
        return null;
    if (order.payStatus === "success" && order.status !== "pending_payment") {
        return order;
    }
    return patchOrder(orderId, {
        payStatus: "success",
        status: "pending_receipt",
    });
}
function setOrderPaymentState(orderId, status) {
    const order = getOrderById(orderId);
    if (!order)
        return null;
    if (status === "success") {
        return patchOrder(orderId, {
            payStatus: "success",
            status: "pending_receipt",
        });
    }
    if (status === "failed") {
        return patchOrder(orderId, {
            payStatus: "failed",
            status: "pending_payment",
        });
    }
    return patchOrder(orderId, {
        payStatus: "paying",
        status: "pending_payment",
    });
}
function markOrderReceived(orderId) {
    return patchOrder(orderId, {
        status: "completed",
    });
}
function markOrderAfterSale(orderId) {
    return patchOrder(orderId, {
        status: "after_sale",
    });
}
