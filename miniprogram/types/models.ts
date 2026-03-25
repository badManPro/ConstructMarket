export type Category = {
  id: string;
  parentId: string;
  name: string;
  icon: string;
  level: number;
  isHot: boolean;
  children?: Category[];
};

export type ProductCard = {
  id: string;
  spuId: string;
  skuId: string;
  name: string;
  cover: string;
  brand: string;
  model: string;
  price: number;
  unit: string;
  minOrderQty: number;
  salesVolume: number;
  stockStatus: string;
  tags: string[];
  supportInvoice: boolean;
  isFavorite: boolean;
};

export type ProductDetail = ProductCard & {
  gallery: string[];
  subtitle: string;
  description: string;
  specGroups: Array<{ groupName: string; options: string[] }>;
  selectedSpecText: string;
  params: Array<{ key: string; value: string }>;
  serviceTags: string[];
  shopInfo: { shopId: string; shopName: string; score: number };
  deliveryDesc: string;
};

export type Article = {
  id: string;
  category: string;
  title: string;
  cover: string;
  summary: string;
  source: string;
  publishAt: string;
  content: string;
  relatedIds: string[];
};

export type Address = {
  id: string;
  receiver: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  tag: string;
  isDefault: boolean;
};

export type Coupon = {
  id: string;
  name: string;
  type: string;
  amount: number;
  threshold: number;
  status: string;
  validFrom: string;
  validTo: string;
  scopeDesc: string;
};

export type CartItem = {
  id: string;
  productId: string;
  skuId: string;
  name: string;
  cover: string;
  model: string;
  price: number;
  unit: string;
  quantity: number;
  minOrderQty: number;
  checked: boolean;
  invalid: boolean;
  invalidReason?: string;
};

export type InvoiceDraft = {
  type: "electronic" | "paper";
  title: string;
  taxNo: string;
  email: string;
};

export type CartAmountSummary = {
  lineCount: number;
  selectedLineCount: number;
  selectedQuantity: number;
  invalidCount: number;
  subtotal: number;
  discount: number;
  freight: number;
  payable: number;
};

export type CheckoutDraft = {
  source: "cart" | "buy_now";
  selectedCartItemIds: string[];
  buyNowItem: CartItem | null;
  selectedAddressId: string | null;
  selectedCouponId: string | null;
  invoiceDraft: InvoiceDraft | null;
  remark: string;
  paymentMethod: "wechat" | "alipay" | "unionpay";
};

export type Order = {
  id: string;
  orderNo: string;
  status: string;
  payStatus: string;
  items: CartItem[];
  address: Address;
  coupon: Coupon | null;
  invoiceInfo: InvoiceDraft | null;
  remark: string;
  paymentMethod: string;
  amount: CartAmountSummary;
  createdAt: string;
};

export type InvoiceRecord = {
  id: string;
  orderNo: string;
  type: string;
  status: string;
  title: string;
  taxNo: string;
  email: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  applyAt: string;
};

export type UserProfile = {
  id: string;
  avatar: string;
  nickname: string;
  phone: string;
  companyName: string;
  buyerRole: string;
  couponCount: number;
  defaultAddressId: string;
};

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort: number;
};

export type ComplaintForm = {
  contactName: string;
  phone: string;
  orderNo: string;
  problemType: string;
  description: string;
  images: string[];
};

export type PaymentMethod = {
  code: "wechat" | "alipay" | "unionpay";
  name: string;
  enabled: boolean;
  desc: string;
};

export type RouteLink = {
  label: string;
  description: string;
  route: string;
};

export type BannerCard = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  actionText: string;
  accent: string;
  route: string;
  params?: Record<string, string>;
};

export type CategoryShortcut = {
  id: string;
  name: string;
  tagline: string;
  route: string;
  params?: Record<string, string>;
};

export type ArticleEntrance = {
  id: string;
  category: string;
  title: string;
  summary: string;
  route: string;
  params?: Record<string, string>;
};

export type SearchFilterState = {
  priceRange: string;
  minOrder: string;
  material: string;
};

export type FilterOption = {
  value: string;
  label: string;
  desc?: string;
};

export type SearchProduct = ProductCard & {
  categoryId: string;
  categoryName: string;
  material: string;
  coverTone: string;
};

export type BrowseProductDetail = ProductDetail & {
  categoryId: string;
  categoryName: string;
  material: string;
  coverTone: string;
  recommendedIds: string[];
};
