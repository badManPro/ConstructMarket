import { buildProfileDraft, seededUserProfile } from "../mock/profile";
import { seededOrders } from "../mock/order";
import { defaultComplaintDraft } from "../mock/support";
import { seededInvoiceRecords, tradeAddresses } from "../mock/trade";
import type {
  Address,
  CartItem,
  ChatMessage,
  CheckoutDraft,
  ComplaintForm,
  InvoiceRecord,
  Order,
  PaymentResultStatus,
  ProfileDraft,
  UserProfile,
} from "../types/models";

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

function cloneUserProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
  };
}

function normalizeUserProfile(profile?: Partial<UserProfile> | null): UserProfile {
  const nextProfile = profile ?? {};
  const nickname = typeof nextProfile.nickname === "string" ? nextProfile.nickname.trim() : seededUserProfile.nickname;
  const avatar = typeof nextProfile.avatar === "string" ? nextProfile.avatar.trim() : "";

  return {
    id: typeof nextProfile.id === "string" && nextProfile.id ? nextProfile.id : seededUserProfile.id,
    avatar: avatar || nickname.slice(0, 1) || seededUserProfile.avatar,
    nickname,
    phone:
      typeof nextProfile.phone === "string" && /^1\d{10}$/.test(nextProfile.phone.trim())
        ? nextProfile.phone.trim()
        : seededUserProfile.phone,
    companyName: typeof nextProfile.companyName === "string" ? nextProfile.companyName.trim() : seededUserProfile.companyName,
    buyerRole: typeof nextProfile.buyerRole === "string" ? nextProfile.buyerRole.trim() : seededUserProfile.buyerRole,
    couponCount: typeof nextProfile.couponCount === "number" ? nextProfile.couponCount : seededUserProfile.couponCount,
    defaultAddressId:
      typeof nextProfile.defaultAddressId === "string" ? nextProfile.defaultAddressId : seededUserProfile.defaultAddressId,
  };
}

function normalizeProfileDraft(draft?: Partial<ProfileDraft> | null, userProfile: UserProfile = getUserProfile()): ProfileDraft {
  const baseDraft = buildProfileDraft(userProfile);
  const nextDraft = draft ?? {};

  return {
    avatar:
      typeof nextDraft.avatar === "string" && nextDraft.avatar.trim()
        ? nextDraft.avatar.trim().slice(0, 1)
        : baseDraft.avatar,
    nickname: typeof nextDraft.nickname === "string" ? nextDraft.nickname : baseDraft.nickname,
    phone:
      typeof nextDraft.phone === "string" && /^1\d{10}$/.test(nextDraft.phone.trim()) ? nextDraft.phone.trim() : userProfile.phone,
    companyName: typeof nextDraft.companyName === "string" ? nextDraft.companyName : baseDraft.companyName,
    buyerRole: typeof nextDraft.buyerRole === "string" ? nextDraft.buyerRole : baseDraft.buyerRole,
  };
}

function saveUserProfileStorage(profile: UserProfile) {
  const normalized = normalizeUserProfile(profile);
  wx.setStorageSync(USER_PROFILE_KEY, normalized);
  return cloneUserProfile(normalized);
}

export function getUserProfile() {
  const stored = wx.getStorageSync(USER_PROFILE_KEY) as Partial<UserProfile> | undefined;

  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const normalized = normalizeUserProfile(stored);
    wx.setStorageSync(USER_PROFILE_KEY, normalized);
    return cloneUserProfile(normalized);
  }

  return saveUserProfileStorage(seededUserProfile);
}

export function getProfileDraft() {
  const userProfile = getUserProfile();
  const stored = wx.getStorageSync(PROFILE_DRAFT_KEY) as Partial<ProfileDraft> | undefined;

  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    const normalized = normalizeProfileDraft(stored, userProfile);
    wx.setStorageSync(PROFILE_DRAFT_KEY, normalized);
    return normalized;
  }

  const initialDraft = buildProfileDraft(userProfile);
  wx.setStorageSync(PROFILE_DRAFT_KEY, initialDraft);
  return initialDraft;
}

export function saveProfileDraft(draft: ProfileDraft) {
  const normalized = normalizeProfileDraft(draft);
  wx.setStorageSync(PROFILE_DRAFT_KEY, normalized);
  return normalized;
}

export function resetProfileDraft() {
  const nextDraft = buildProfileDraft(getUserProfile());
  wx.setStorageSync(PROFILE_DRAFT_KEY, nextDraft);
  return nextDraft;
}

export function saveUserProfile(profile: UserProfile) {
  const savedProfile = saveUserProfileStorage(profile);
  saveProfileDraft(buildProfileDraft(savedProfile));
  return savedProfile;
}

export function getFavoriteIds() {
  const stored = wx.getStorageSync(FAVORITE_KEY) as unknown;
  if (!Array.isArray(stored)) {
    if (stored !== "" && stored !== null && stored !== undefined) {
      wx.setStorageSync(FAVORITE_KEY, []);
    }
    return [];
  }

  const normalized = stored.filter((item): item is string => typeof item === "string");
  if (normalized.length !== stored.length) {
    wx.setStorageSync(FAVORITE_KEY, normalized);
  }
  return normalized;
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
  const stored = wx.getStorageSync(CART_KEY) as unknown;
  if (!Array.isArray(stored)) {
    if (stored !== "" && stored !== null && stored !== undefined) {
      wx.setStorageSync(CART_KEY, []);
    }
    return [];
  }

  const normalized = stored.filter((item): item is CartItem => Boolean(item && typeof item === "object"));
  if (normalized.length !== stored.length) {
    wx.setStorageSync(CART_KEY, normalized);
  }
  return normalized;
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

function cloneChatMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
  };
}

function saveSupportChatMessages(nextMessages: ChatMessage[]) {
  const normalizedMessages = nextMessages.map((item) => cloneChatMessage(item));
  wx.setStorageSync(SUPPORT_CHAT_KEY, normalizedMessages);
  return normalizedMessages;
}

export function getSupportChatMessages(seedMessages: ChatMessage[] = []) {
  const stored = wx.getStorageSync(SUPPORT_CHAT_KEY) as ChatMessage[] | undefined;

  if (Array.isArray(stored) && stored.length) {
    return stored;
  }

  if (seedMessages.length) {
    return saveSupportChatMessages(seedMessages);
  }

  return [];
}

export function appendSupportChatMessage(message: ChatMessage) {
  return saveSupportChatMessages([...getSupportChatMessages(), cloneChatMessage(message)]);
}

export function patchSupportChatMessage(messageId: string, patch: Partial<ChatMessage>) {
  let updatedMessage: ChatMessage | null = null;

  const nextMessages = getSupportChatMessages().map((item) => {
    if (item.id !== messageId) return item;

    updatedMessage = {
      ...item,
      ...patch,
    };

    return updatedMessage;
  });

  saveSupportChatMessages(nextMessages);
  return updatedMessage;
}

export function clearSupportChatMessages() {
  wx.removeStorageSync(SUPPORT_CHAT_KEY);
}

function normalizeComplaintDraft(draft?: Partial<ComplaintForm> | null): ComplaintForm {
  return {
    ...defaultComplaintDraft,
    ...(draft ?? {}),
    contactName: draft?.contactName ?? "",
    phone: draft?.phone ?? "",
    orderNo: draft?.orderNo ?? "",
    problemType: draft?.problemType ?? "",
    description: draft?.description ?? "",
    images: Array.isArray(draft?.images) ? draft.images : [],
  };
}

export function getComplaintDraft() {
  const stored = wx.getStorageSync(COMPLAINT_DRAFT_KEY) as Partial<ComplaintForm> | undefined;
  return normalizeComplaintDraft(stored);
}

export function saveComplaintDraft(draft: ComplaintForm) {
  const nextDraft = normalizeComplaintDraft(draft);
  wx.setStorageSync(COMPLAINT_DRAFT_KEY, nextDraft);
  return nextDraft;
}

export function patchComplaintDraft(patch: Partial<ComplaintForm>) {
  return saveComplaintDraft({
    ...getComplaintDraft(),
    ...patch,
  });
}

export function clearComplaintDraft() {
  wx.removeStorageSync(COMPLAINT_DRAFT_KEY);
}

function getInitialOrders() {
  return seededOrders.map((order) => cloneOrder(order));
}

function cloneAddress(address: Address): Address {
  return {
    ...address,
  };
}

function getInitialAddresses() {
  return tradeAddresses.map((address) => cloneAddress(address));
}

function saveAddresses(nextAddresses: Address[]) {
  wx.setStorageSync(ADDRESS_KEY, nextAddresses);
  return nextAddresses;
}

export function getAddresses() {
  const stored = wx.getStorageSync(ADDRESS_KEY) as Address[] | undefined;

  if (Array.isArray(stored)) {
    return stored;
  }

  const initialAddresses = getInitialAddresses();
  saveAddresses(initialAddresses);
  return initialAddresses;
}

export function getDefaultAddress() {
  const addresses = getAddresses();
  return addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;
}

export function getAddressById(addressId: string | null | undefined) {
  if (!addressId) return null;
  return getAddresses().find((item) => item.id === addressId) ?? null;
}

export function upsertAddress(address: Address) {
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

export function setDefaultAddress(addressId: string) {
  const nextAddresses = getAddresses().map((item) => ({
    ...item,
    isDefault: item.id === addressId,
  }));
  saveAddresses(nextAddresses);
  patchCheckoutDraft({ selectedAddressId: addressId });
  return nextAddresses.find((item) => item.id === addressId) ?? null;
}

export function deleteAddress(addressId: string) {
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

function cloneInvoiceRecord(record: InvoiceRecord): InvoiceRecord {
  return {
    ...record,
  };
}

function getInitialInvoiceRecords() {
  return seededInvoiceRecords.map((record) => cloneInvoiceRecord(record));
}

function saveInvoiceRecords(nextRecords: InvoiceRecord[]) {
  wx.setStorageSync(INVOICE_RECORD_KEY, nextRecords);
  return nextRecords;
}

export function getInvoiceRecords() {
  const stored = wx.getStorageSync(INVOICE_RECORD_KEY) as InvoiceRecord[] | undefined;

  if (Array.isArray(stored)) {
    return stored;
  }

  const initialRecords = getInitialInvoiceRecords();
  saveInvoiceRecords(initialRecords);
  return initialRecords;
}

export function prependInvoiceRecord(record: InvoiceRecord) {
  return saveInvoiceRecords([cloneInvoiceRecord(record), ...getInvoiceRecords()]);
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

export function setOrderPaymentState(orderId: string, status: PaymentResultStatus) {
  const order = getOrderById(orderId);
  if (!order) return null;

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
